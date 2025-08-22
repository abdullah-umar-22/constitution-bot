import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
  onNewChat: () => void;
  onClearChat: () => void;
}

export const ChatSidebar = ({ onNewChat, onClearChat }: ChatSidebarProps) => {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-foreground">Pakistan Constitution Bot</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 space-y-2">
        <Button
          onClick={onNewChat}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <MessageSquarePlus className="mr-3 h-4 w-4" />
          New Chat
        </Button>

        <Button
          onClick={onClearChat}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Trash2 className="mr-3 h-4 w-4" />
          Clear Chat
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60">
          Constitutional AI Assistant
        </div>
      </div>
    </div>
  );
};