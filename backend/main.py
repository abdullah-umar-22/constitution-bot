import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain.retrievers.multi_query import MultiQueryRetriever


# Loading environment variables

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY") # Any API key


# Initialize FastAPI

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize Embeddings + DB

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)


# Initialize LLM

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")


# Multi-Query Retriever

base_retriever = db.as_retriever(search_type="mmr", search_kwargs={"k": 4})
multiquery_retriever = MultiQueryRetriever.from_llm(
    retriever=base_retriever,
    llm=llm
)


# Conversation Memory

memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True,
    output_key="answer"
)


# Custom Prompts

qa_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are an expert assistant on the Constitution of Pakistan (1973).

- Cite Article numbers, Sections, or Page numbers if available in metadata.
- If you do not find the answer in the context, say:
"I could not find this in the Constitution of Pakistan 1973."
- Be clear.
- Include all details which are asked

Context:
{context}

Question: {question}

Answer (with citations if possible):
"""
)

summarize_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template="""
You are a helpful assistant. The user is asking to summarize or explain part of the Constitution of Pakistan (1973).

Instructions:
- Summarize the ENTIRE provided text, not just headings. 
- Include all key ideas, legal principles, and important clauses. 
- Use clear, plain language. 
- If the context spans multiple paragraphs, cover them all.

Context:
{context}

User Request: {question}

Summarized Answer:
"""
)


# Conversational QA Chain

qa_chain = ConversationalRetrievalChain.from_llm(
    llm,
    retriever=multiquery_retriever,
    memory=memory,
    return_source_documents=True,
    output_key="answer"
)


# API Models

class ChatRequest(BaseModel):
    message: str



# Chat Endpoint

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_input = request.message

    # Detect summarization request
    if any(keyword in user_input.lower() for keyword in ["summarize", "explain", "simplify"]):
        deep_retriever = db.as_retriever(search_type="mmr", search_kwargs={"k": 10})
        docs = deep_retriever.get_relevant_documents(user_input)
        context = "\n\n".join([d.page_content for d in docs])
        response = llm.invoke(summarize_prompt.format(context=context, question=user_input))
        answer = response.content
    else:
        result = qa_chain({"question": user_input})
        answer = result["answer"]

    return {"response": answer}
