# ingest.py
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Load PDF
loader = PyPDFLoader("Constitution_of_Pakistan_1973.pdf")
docs = loader.load()

# Add metadata (page numbers)
for d in docs:
    d.metadata["source"] = f"Page-{d.metadata.get('page', 'N/A')}"

# 2. Split into chunks
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\n\n", "\n", ".", " "]
)
chunks = splitter.split_documents(docs)

# 3. Embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 4. Store in Chroma (persistent)
vectordb = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="chroma_db"
)

print("Ingestion complete. Embeddings stored in chroma_db/")
