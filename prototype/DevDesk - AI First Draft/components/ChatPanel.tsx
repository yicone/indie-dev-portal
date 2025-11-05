import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { 
  MessageSquare, 
  X, 
  Send, 
  Plus, 
  ChevronDown,
  Archive,
  Edit2,
  Check,
  Mic
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { NewSessionDialog } from "./NewSessionDialog";
import { AgentSelector } from "./AgentSelector";
import { ModelSelector } from "./ModelSelector";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  role: "user" | "assistant";
}

interface ChatSession {
  id: string;
  name: string;
  repository: string;
  lastActive: string;
  messages: Message[];
  archived?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: string[];
  initialRepository?: string;
}

// Mock sessions data
const mockSessions: ChatSession[] = [
  {
    id: "1",
    name: "Refine Project Documentation",
    repository: "personal-website",
    lastActive: "12m",
    messages: [
      {
        id: "1",
        role: "user",
        content: "Help me refactor the authentication module",
        timestamp: "11:30:12 PM"
      },
      {
        id: "2",
        role: "assistant",
        content: "I'd be happy to help you refactor the authentication module. Let me analyze the current implementation...",
        timestamp: "11:30:45 PM"
      },
      {
        id: "3",
        role: "user",
        content: "Can you check the security best practices?",
        timestamp: "11:32:10 PM"
      }
    ]
  },
  {
    id: "2",
    name: "Fixing Doc Naming Conventions",
    repository: "ml-pipeline",
    lastActive: "9d",
    messages: [
      {
        id: "1",
        role: "user",
        content: "What's the best naming convention for documentation files?",
        timestamp: "Oct 26"
      },
      {
        id: "2",
        role: "assistant",
        content: "For documentation files, I recommend following these conventions...",
        timestamp: "Oct 26"
      }
    ]
  },
  {
    id: "3",
    name: "Document Management System Setup",
    repository: "ecommerce-app",
    lastActive: "9d",
    messages: []
  },
  {
    id: "4",
    name: "Figma MCP Introduction",
    repository: "component-library",
    lastActive: "12d",
    archived: true,
    messages: []
  }
];

export function ChatPanel({ isOpen, onClose, repositories, initialRepository }: ChatPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>("1");
  const [message, setMessage] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("gemini");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro");
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeSessions = sessions.filter(s => !s.archived);
  const archivedSessions = sessions.filter(s => s.archived);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  // Handle opening chat with a specific repository
  useEffect(() => {
    if (isOpen && initialRepository) {
      // Check if there's already a session for this repo
      const existingSession = sessions.find(s => s.repository === initialRepository && !s.archived);
      if (existingSession) {
        setActiveSessionId(existingSession.id);
      } else {
        // Create a new session for this repo
        setIsCreatingNew(true);
      }
    }
  }, [isOpen, initialRepository]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Handle send message logic here
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleArchiveSession = (sessionId: string) => {
    setSessions(sessions.map(s => 
      s.id === sessionId ? { ...s, archived: !s.archived } : s
    ));
  };

  const handleCreateSession = (name: string, repository: string) => {
    const newSession: ChatSession = {
      id: String(sessions.length + 1),
      name,
      repository,
      lastActive: "now",
      messages: []
    };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newSession.id);
  };

  const handleStartEdit = () => {
    if (activeSession) {
      setEditedTitle(activeSession.name);
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && activeSession) {
      setSessions(sessions.map(s => 
        s.id === activeSession.id ? { ...s, name: editedTitle.trim() } : s
      ));
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 h-screen w-[420px] bg-crust border-l border-surface0 flex flex-col shadow-2xl z-50"
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-surface0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-mauve" />
                <span className="text-sm">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 hover:bg-surface0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Session Selector - Compact Windsurf Style */}
            <div className="px-4 pb-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-8 px-3 bg-surface0/50 hover:bg-surface0 border border-surface1"
                  >
                    <span className="text-sm truncate">
                      {activeSession?.name || "Select a session"}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-2 opacity-50 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-[380px] bg-mantle border-surface0"
                >
                  {/* Active Sessions */}
                  <div className="py-1">
                    {activeSessions.map((session) => (
                      <DropdownMenuItem
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {session.id === activeSessionId && (
                              <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                            )}
                            <span className="text-sm truncate">{session.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {session.repository}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {session.lastActive}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator className="bg-surface0" />

                  {/* New Session */}
                  <DropdownMenuItem
                    onClick={() => setIsCreatingNew(true)}
                    className="px-3 py-2 cursor-pointer hover:bg-surface0"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    <span className="text-sm">New Chat Session</span>
                  </DropdownMenuItem>

                  {/* Archive Current Session */}
                  {activeSession && (
                    <>
                      <DropdownMenuSeparator className="bg-surface0" />
                      <DropdownMenuItem
                        onClick={() => handleArchiveSession(activeSession.id)}
                        className="px-3 py-2 cursor-pointer hover:bg-surface0"
                      >
                        <Archive className="h-3 w-3 mr-2" />
                        <span className="text-sm">
                          {activeSession.archived ? "Unarchive" : "Archive"} Session
                        </span>
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Archived Sessions */}
                  {archivedSessions.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-surface0" />
                      <div className="px-3 py-1.5 text-xs text-muted-foreground">
                        Archived
                      </div>
                      {archivedSessions.map((session) => (
                        <DropdownMenuItem
                          key={session.id}
                          onClick={() => setActiveSessionId(session.id)}
                          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface0 opacity-60"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{session.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {session.repository}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">
                            {session.lastActive}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Editable Title & Repo Info */}
              {activeSession && (
                <div className="mt-2">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-1">
                      <Input
                        ref={titleInputRef}
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTitle();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="h-7 text-xs bg-surface0 border-surface1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveTitle}
                        className="h-7 w-7 hover:bg-surface0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
                        className="h-7 w-7 hover:bg-surface0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-surface0/30 cursor-pointer group"
                      onClick={handleStartEdit}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate">{activeSession.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Repo: {activeSession.repository}
                        </div>
                      </div>
                      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            {activeSession?.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-surface0 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-mauve" />
                </div>
                <h3 className="mb-2">Start a Conversation</h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  Ask questions about {activeSession?.repository}. Get help with code, architecture, or documentation.
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {activeSession?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.role === "user"
                          ? "bg-mauve text-base"
                          : "bg-surface0 text-text"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className="text-xs opacity-60 mt-1.5 block">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area - Windsurf Style */}
          <div className="flex-shrink-0 border-t border-surface0 p-3">
            {/* Agent and Model Selectors */}
            <div className="flex items-center gap-1 mb-2 px-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-surface0/50"
                title="Add attachment"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <AgentSelector 
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
              />
              <ModelSelector 
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-surface0/50"
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>

            {/* Input with embedded send button */}
            <div className="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="pr-10 bg-surface0 border-surface1 focus-visible:ring-mauve"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-mauve hover:bg-mauve/90 text-base disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* New Session Dialog */}
      <NewSessionDialog
        isOpen={isCreatingNew}
        onClose={() => setIsCreatingNew(false)}
        onCreateSession={handleCreateSession}
        repositories={repositories}
        initialRepository={initialRepository}
      />
    </AnimatePresence>
  );
}
