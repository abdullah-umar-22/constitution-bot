import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleNewChat = () => {
    setMessages([]);
    toast({
      title: "New chat started",
      description: "Your conversation history has been cleared.",
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    });
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // TODO: Replace with your Python backend API endpoint
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        message:
          data.response ||
          "I'm sorry, I couldn't process your request at the moment.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // For now, show a placeholder response since backend isn't set up yet
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        message:
          "I'm a Pakistan Constitution chatbot. Your backend API is not connected yet. Please set up your Python backend with the '/api/chat' endpoint to start receiving responses about Pakistan's Constitution.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Backend not connected",
        description: "Please set up your Python API endpoint.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <ChatSidebar onNewChat={handleNewChat} onClearChat={handleClearChat} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <h1 className="text-3xl font-semibold mb-4 text-foreground">
                  Hey. Ready to dive in?
                </h1>
                <p className="text-muted-foreground mb-8">
                  Ask me anything about Pakistan's Constitution. I'm here to
                  help you understand constitutional law, rights, and
                  governance.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Ask about fundamental rights</p>
                  <p>• Inquire about government structure</p>
                  <p>• Inquire about laws</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-6">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-muted rounded-lg px-4 py-3 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default Index;
