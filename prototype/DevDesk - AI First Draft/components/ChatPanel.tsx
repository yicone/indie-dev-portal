import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { 
  X, 
  Send, 
  Plus, 
  ChevronDown,
  Archive,
  Edit2,
  Check,
  Mic,
  Search,
  Copy,
  FolderGit2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
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
    name: "API Gateway Performance Analysis",
    repository: "api-gateway",
    lastActive: "5d",
    messages: []
  },
  {
    id: "5",
    name: "Component Library Refactoring",
    repository: "component-library",
    lastActive: "3d",
    messages: []
  },
  {
    id: "6",
    name: "Mobile App Push Notifications",
    repository: "mobile-app",
    lastActive: "1d",
    messages: []
  },
  {
    id: "7",
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
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("gemini");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-pro");
  const [selectedRepository, setSelectedRepository] = useState<string>("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Filter sessions based on selected repository and search query
  const filteredActiveSessions = sessions.filter(s => {
    if (s.archived) return false;
    
    // Filter by selected repository
    if (selectedRepository && s.repository !== selectedRepository) return false;
    
    // Filter by search query
    if (sessionSearchQuery) {
      const query = sessionSearchQuery.toLowerCase();
      return s.name.toLowerCase().includes(query);
    }
    
    return true;
  });

  const archivedSessions = sessions.filter(s => s.archived);

  // Get unique repositories from all sessions (including archived)
  const sessionRepositories = Array.from(new Set(sessions.map(s => s.repository)));
  const allRepositories = Array.from(new Set([...repositories, ...sessionRepositories]));

  // Check if current repo has any sessions (including archived)
  const filteredArchivedSessions = selectedRepository 
    ? archivedSessions.filter(s => s.repository === selectedRepository)
    : archivedSessions;
  const hasAnySessions = filteredActiveSessions.length > 0 || filteredArchivedSessions.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  // Initialize selected repository
  useEffect(() => {
    if (isOpen) {
      if (initialRepository) {
        setSelectedRepository(initialRepository);
      } else if (activeSession && !selectedRepository) {
        setSelectedRepository(activeSession.repository);
      }
    }
  }, [isOpen, initialRepository, activeSession, selectedRepository]);

  // Clear active session when switching repos if no sessions exist for the new repo
  useEffect(() => {
    if (!selectedRepository) {
      // When "All Repositories" is selected, keep current session if any
      return;
    }
    
    if (activeSession) {
      // If active session doesn't belong to selected repo, clear it
      if (activeSession.repository !== selectedRepository) {
        const repoSessions = sessions.filter(s => 
          s.repository === selectedRepository && !s.archived
        );
        if (repoSessions.length > 0) {
          // Auto-select first session of the new repo
          setActiveSessionId(repoSessions[0].id);
        } else {
          // Clear active session if no sessions for this repo
          setActiveSessionId(null);
        }
      }
    } else if (selectedRepository) {
      // If no active session but a repo is selected, try to select first available
      const repoSessions = sessions.filter(s => 
        s.repository === selectedRepository && !s.archived
      );
      if (repoSessions.length > 0) {
        setActiveSessionId(repoSessions[0].id);
      }
    }
  }, [selectedRepository, activeSession, sessions]);

  // Handle opening chat with a specific repository
  useEffect(() => {
    if (isOpen && initialRepository) {
      // Check if there's already a session for this repo
      const existingSession = sessions.find(s => s.repository === initialRepository && !s.archived);
      if (existingSession) {
        setActiveSessionId(existingSession.id);
        setSelectedRepository(initialRepository);
      } else {
        // Auto-create a new session for this repo
        const newSession: ChatSession = {
          id: String(Date.now()),
          name: `New Chat - ${initialRepository}`,
          repository: initialRepository,
          lastActive: "now",
          messages: []
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setSelectedRepository(initialRepository);
      }
    }
  }, [isOpen, initialRepository]);

  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingSessionId]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // Handle send message logic here
    setMessage("");
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
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

  const handleQuickCreateSession = (repo?: string) => {
    const targetRepo = repo || selectedRepository;
    if (!targetRepo) return;
    
    const newSession: ChatSession = {
      id: String(Date.now()),
      name: `New Chat - ${targetRepo}`,
      repository: targetRepo,
      lastActive: "now",
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedRepository(targetRepo);
  };

  const handleStartEditSession = (sessionId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditedTitle(currentName);
  };

  const handleSaveSessionTitle = () => {
    if (editedTitle.trim() && editingSessionId) {
      setSessions(sessions.map(s => 
        s.id === editingSessionId ? { ...s, name: editedTitle.trim() } : s
      ));
    }
    setEditingSessionId(null);
    setEditedTitle("");
  };

  const handleCancelEditSession = () => {
    setEditingSessionId(null);
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
            {/* Top Bar: Repo Selector & Actions */}
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              {/* Repository Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex-1 justify-start gap-2 h-8 px-2 hover:bg-surface0/50 min-w-0"
                  >
                    <FolderGit2 className="h-4 w-4 text-mauve flex-shrink-0" />
                    <span className="text-sm truncate">
                      {selectedRepository || "All Repositories"}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-auto opacity-50 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-[280px] bg-mantle border-surface0"
                >
                  <DropdownMenuItem
                    onClick={() => setSelectedRepository("")}
                    className={`px-3 py-2 cursor-pointer hover:bg-surface0 text-sm ${
                      !selectedRepository ? "bg-surface0/50" : ""
                    }`}
                  >
                    All Repositories
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-surface0" />
                  {allRepositories.map((repo) => (
                    <DropdownMenuItem
                      key={repo}
                      onClick={() => setSelectedRepository(repo)}
                      className={`px-3 py-2 cursor-pointer hover:bg-surface0 text-sm ${
                        selectedRepository === repo ? "bg-surface0/50" : ""
                      }`}
                    >
                      {repo}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuickCreateSession()}
                  disabled={!selectedRepository}
                  className={`h-7 w-7 hover:bg-surface0/50 disabled:opacity-50 ${
                    selectedRepository && filteredActiveSessions.length === 0 ? 'ring-1 ring-mauve/50' : ''
                  }`}
                  title={selectedRepository 
                    ? `Create new chat for ${selectedRepository}`
                    : "Select a repository first"}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7 hover:bg-surface0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Session Selector */}
            <div className="px-4 pb-3">

              {/* Session Selector with Search */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled={selectedRepository && !hasAnySessions}
                    className={`w-full justify-between h-8 px-3 bg-surface0/50 hover:bg-surface0 border border-surface1 ${
                      selectedRepository && filteredActiveSessions.length === 0 
                        ? 'border-mauve/30 text-muted-foreground italic' 
                        : ''
                    }`}
                  >
                    <span className="text-sm truncate">
                      {activeSession && activeSession.repository === selectedRepository
                        ? activeSession.name
                        : selectedRepository && !hasAnySessions
                          ? "No sessions"
                          : selectedRepository && filteredActiveSessions.length === 0 
                            ? "No active sessions"
                            : "Select a session"}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-2 opacity-50 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-[380px] bg-mantle border-surface0 p-0"
                >
                  {/* Search Box */}
                  <div className="p-2 border-b border-surface0">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        value={sessionSearchQuery}
                        onChange={(e) => setSessionSearchQuery(e.target.value)}
                        placeholder="Search sessions..."
                        className="h-7 pl-7 text-xs bg-surface0/50 border-surface1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Filtered Sessions */}
                  <ScrollArea className="max-h-[300px]">
                    <div className="py-1">
                      {filteredActiveSessions.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <div className="text-sm text-muted-foreground mb-3">
                            {sessionSearchQuery 
                              ? "No sessions match your search"
                              : selectedRepository 
                                ? `No active sessions for ${selectedRepository}`
                                : "No active sessions"}
                          </div>
                          {selectedRepository && !sessionSearchQuery && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickCreateSession();
                              }}
                              size="sm"
                              className="h-7 bg-mauve hover:bg-mauve/90 text-base"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Create Session
                            </Button>
                          )}
                        </div>
                      ) : (
                        filteredActiveSessions.map((session) => (
                          <div key={session.id} className="mx-1 mb-0.5">
                            {editingSessionId === session.id ? (
                              <div className="flex items-center gap-1 px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                                <Input
                                  ref={editInputRef}
                                  value={editedTitle}
                                  onChange={(e) => setEditedTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveSessionTitle();
                                    if (e.key === "Escape") handleCancelEditSession();
                                    e.stopPropagation();
                                  }}
                                  className="h-6 text-xs bg-surface0 border-surface1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveSessionTitle();
                                  }}
                                  className="h-6 w-6 hover:bg-surface0 flex-shrink-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEditSession();
                                  }}
                                  className="h-6 w-6 hover:bg-surface0 flex-shrink-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setActiveSessionId(session.id);
                                  setSessionSearchQuery("");
                                }}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface0 rounded group"
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
                                <div className="flex items-center gap-1 ml-2">
                                  <span className="text-xs text-muted-foreground group-hover:hidden flex-shrink-0">
                                    {session.lastActive}
                                  </span>
                                  <div className="hidden group-hover:flex items-center gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => handleStartEditSession(session.id, session.name, e)}
                                      className="h-6 w-6 hover:bg-surface1"
                                      title="Rename"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleArchiveSession(session.id);
                                      }}
                                      className="h-6 w-6 hover:bg-surface1"
                                      title="Archive"
                                    >
                                      <Archive className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Archived Sessions */}
                  {filteredArchivedSessions.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-surface0" />
                      <div className="px-3 py-1.5 text-xs text-muted-foreground">
                        Archived
                      </div>
                      <ScrollArea className="max-h-[150px]">
                        <div className="py-1">
                          {filteredArchivedSessions.map((session) => (
                            <div key={session.id} className="mx-1 mb-0.5">
                              <DropdownMenuItem
                                onClick={() => setActiveSessionId(session.id)}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface0 rounded opacity-60 hover:opacity-100 group"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm truncate block">{session.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {session.repository}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <span className="text-xs text-muted-foreground group-hover:hidden flex-shrink-0">
                                    {session.lastActive}
                                  </span>
                                  <div className="hidden group-hover:flex items-center gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleArchiveSession(session.id);
                                      }}
                                      className="h-6 w-6 hover:bg-surface1"
                                      title="Unarchive"
                                    >
                                      <Archive className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </DropdownMenuItem>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}

                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            {!activeSession ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
                <div className="w-16 h-16 rounded-2xl bg-surface0 flex items-center justify-center mb-4">
                  <FolderGit2 className="h-8 w-8 text-mauve" />
                </div>
                <h3 className="mb-2">
                  {selectedRepository && filteredActiveSessions.length === 0 
                    ? "No Sessions Yet"
                    : "No Session Selected"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
                  {selectedRepository && filteredActiveSessions.length === 0
                    ? `Start chatting about ${selectedRepository} by creating your first session.`
                    : selectedRepository 
                      ? `Select a session from the list above or create a new one.`
                      : "Select a repository and create a new chat to get started."}
                </p>
                {selectedRepository && filteredActiveSessions.length === 0 && (
                  <Button
                    onClick={() => handleQuickCreateSession()}
                    size="sm"
                    className="bg-mauve hover:bg-mauve/90 text-base"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                )}
              </div>
            ) : activeSession.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-surface0 flex items-center justify-center mb-4">
                  <FolderGit2 className="h-8 w-8 text-mauve" />
                </div>
                <h3 className="mb-2">Start a Conversation</h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">
                  Ask questions about {activeSession.repository}. Get help with code, architecture, or documentation.
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {activeSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                        msg.role === "user"
                          ? "bg-mauve text-base"
                          : "bg-surface0 text-text"
                      }`}
                    >
                      <p className="text-sm leading-snug">{msg.content}</p>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[10px] opacity-50">
                          {msg.timestamp}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyMessage(msg.content)}
                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                          title="Copy message"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
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
    </AnimatePresence>
  );
}
