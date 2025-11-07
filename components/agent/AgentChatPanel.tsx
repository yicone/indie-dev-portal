'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useAgentChat } from '@/lib/contexts/AgentChatContext';
import { fetchRepos } from '@/lib/gitUtils';
import { formatRelativeTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Archive,
  Check,
  ChevronDown,
  Copy,
  Edit2,
  FolderGit2,
  Loader2,
  MessageSquare,
  Mic,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { AgentSelector } from './AgentSelector';
import { ModelSelector } from './ModelSelector';

export function AgentChatPanel() {
  const {
    isOpen,
    closePanel,
    activeSessionId,
    sessions,
    messages,
    sendMessage,
    retryMessage,
    renameSession,
    archiveSession,
    connectionStatus,
    createSession,
    setActiveSession,
    isTyping,
    isCreatingSession,
    error,
    clearError,
  } = useAgentChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [archivingSession, setArchivingSession] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState<string>('');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const { data: repos } = useQuery({ queryKey: ['repos'], queryFn: fetchRepos });
  const editInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle session change - clear loading state when messages are loaded
  useEffect(() => {
    if (activeSessionId) {
      const sessionMessages = messages.get(activeSessionId);
      if (sessionMessages !== undefined) {
        setLoadingMessages(false);
      } else {
        setLoadingMessages(true);
      }
    } else {
      setLoadingMessages(false);
    }
  }, [activeSessionId, messages]);

  if (!isOpen) return null;

  const sessionMessages = activeSessionId ? messages.get(activeSessionId) || [] : [];
  const currentSession = activeSessionId ? sessions.get(activeSessionId) : null;
  const currentSessionStatus = currentSession
    ? (currentSession as unknown as { status: string }).status
    : null;
  const canSendMessage = activeSessionId && currentSessionStatus === 'active';

  // Helper function to get session display name
  const getSessionDisplayName = (session: any) => {
    // Try to get custom name from resumeData
    if (session.resumeData) {
      try {
        const resumeData = JSON.parse(session.resumeData);
        if (resumeData.customName) {
          return resumeData.customName;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Fall back to repo name or session ID
    return session.repo?.name || `Session ${session.id.slice(0, 8)}`;
  };

  // Filter sessions based on selected repository and search query
  const filteredActiveSessions = Array.from(sessions.values()).filter((s: any) => {
    if (s.status === 'archived') return false;

    // Filter by selected repository
    if (selectedRepository && s.repo?.name !== selectedRepository) return false;

    // Filter by search query
    if (sessionSearchQuery) {
      const query = sessionSearchQuery.toLowerCase();
      const displayName = getSessionDisplayName(s).toLowerCase();
      return displayName.includes(query);
    }

    return true;
  });

  const filteredArchivedSessions = Array.from(sessions.values()).filter((s: any) => {
    if (s.status !== 'archived') return false;

    // Filter by selected repository
    if (selectedRepository && s.repo?.name !== selectedRepository) return false;

    return true;
  });

  const hasAnySessions = filteredActiveSessions.length > 0 || filteredArchivedSessions.length > 0;

  // Get all repositories from repos query (not just from sessions)
  const allRepositories = repos ? repos.map((r) => r.name).sort() : [];

  const handleQuickCreateSession = async () => {
    if (!selectedRepository || !repos) return;

    // Find repo ID from name
    const repo = repos.find((r) => r.name === selectedRepository);
    if (!repo) {
      alert('Repository not found');
      return;
    }

    try {
      await createSession(repo.id);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
    }
  };

  const handleStartEditSession = (sessionId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditedTitle(currentName);
  };

  const handleSaveSessionTitle = async () => {
    if (!editedTitle.trim() || !editingSessionId) return;

    try {
      await renameSession(editingSessionId, editedTitle.trim());
      setEditingSessionId(null);
      setEditedTitle('');
    } catch (error) {
      console.error('Failed to rename session:', error);
      alert('Failed to rename session. Please try again.');
    }
  };

  const handleCancelEditSession = () => {
    setEditingSessionId(null);
    setEditedTitle('');
  };

  const handleArchiveSession = async (sessionId: string) => {
    if (!confirm('Archive this session? You can view it later in "Show Archived".')) return;

    setArchivingSession(sessionId);
    try {
      await archiveSession(sessionId);

      // If we archived the active session, clear it
      if (sessionId === activeSessionId) {
        setActiveSession(null);
      }
    } catch (error) {
      // Error is already set in the context, but we can log it here too
      console.error('Failed to archive session from panel:', error);
      // The context will show the error to the user
    } finally {
      setArchivingSession(null);
    }
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleStartRename = (sessionId: string) => {
    const session = sessions.get(sessionId);
    if (session) {
      setRenamingSessionId(sessionId);
      setRenameInput(getSessionDisplayName(session));
    }
  };

  const handleSaveRename = async () => {
    if (!renamingSessionId || !renameInput.trim()) return;

    try {
      await renameSession(renamingSessionId, renameInput.trim());
      setRenamingSessionId(null);
      setRenameInput('');
    } catch (error) {
      console.error('Failed to rename session:', error);
      // Error is already set in context
    }
  };

  const handleCancelRename = () => {
    setRenamingSessionId(null);
    setRenameInput('');
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(input);
      setInput('');
      clearError();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-[420px] bg-crust border-l border-surface1 shadow-2xl z-40 flex flex-col"
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
                    {selectedRepository || 'All Repositories'}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-auto opacity-50 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[280px] bg-mantle border-surface0">
                <DropdownMenuItem
                  onClick={() => setSelectedRepository('')}
                  className={`px-3 py-2 cursor-pointer hover:bg-surface0 text-sm ${
                    !selectedRepository ? 'bg-surface0/50' : ''
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
                      selectedRepository === repo ? 'bg-surface0/50' : ''
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
                onClick={handleQuickCreateSession}
                disabled={!selectedRepository}
                className={`h-7 w-7 hover:bg-surface0/50 disabled:opacity-50 ${
                  selectedRepository && filteredActiveSessions.length === 0
                    ? 'ring-1 ring-mauve/50'
                    : ''
                }`}
                title={
                  selectedRepository
                    ? `Create new chat for ${selectedRepository}`
                    : 'Select a repository first'
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePanel}
                className="h-7 w-7 hover:bg-surface0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Session Selector */}
          <div className="px-4 pb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={!!(selectedRepository && !hasAnySessions)}
                  className={`w-full justify-between h-8 px-3 bg-surface0/50 hover:bg-surface0 border border-surface1 ${
                    selectedRepository && filteredActiveSessions.length === 0
                      ? 'border-mauve/30 text-muted-foreground italic'
                      : ''
                  }`}
                >
                  <span className="text-sm truncate">
                    {currentSession &&
                    (!selectedRepository ||
                      (currentSession as any)?.repo?.name === selectedRepository)
                      ? getSessionDisplayName(currentSession)
                      : selectedRepository && !hasAnySessions
                        ? 'No sessions'
                        : selectedRepository && filteredActiveSessions.length === 0
                          ? 'No active sessions'
                          : 'Select a session'}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-2 opacity-50 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[380px] bg-mantle border-surface0 p-0 flex flex-col h-full"
                sideOffset={4}
              >
                {/* Search Box */}
                <div className="p-2 border-b border-surface0 flex-shrink-0">
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
                <ScrollArea className="h-[300px]">
                  <div className="py-1">
                    {filteredActiveSessions.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <div className="text-sm text-muted-foreground mb-3">
                          {sessionSearchQuery
                            ? 'No sessions match your search'
                            : selectedRepository
                              ? `No active sessions for ${selectedRepository}`
                              : 'No active sessions'}
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
                      filteredActiveSessions.map((session: any) => (
                        <div key={session.id} className="mx-1 mb-0.5">
                          {editingSessionId === session.id ? (
                            <div
                              className="flex items-center gap-1 px-2 py-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Input
                                ref={editInputRef}
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveSessionTitle();
                                  if (e.key === 'Escape') handleCancelEditSession();
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
                                setActiveSession(session.id);
                                setSessionSearchQuery('');
                              }}
                              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface0 rounded group"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {session.id === activeSessionId && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                                  )}
                                  <span className="text-sm truncate">
                                    {getSessionDisplayName(session)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {session.repo?.name || 'Unknown'}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-muted-foreground group-hover:hidden flex-shrink-0">
                                  {session.updatedAt ? formatRelativeTime(session.updatedAt) : ''}
                                </span>
                                <div className="hidden group-hover:flex items-center gap-0.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) =>
                                      handleStartEditSession(
                                        session.id,
                                        getSessionDisplayName(session),
                                        e
                                      )
                                    }
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
                    <DropdownMenuSeparator className="bg-surface0 my-1" />
                    <div className="px-3 py-1.5 text-xs text-muted-foreground">Archived</div>
                    <ScrollArea className="h-[150px]">
                      <div className="py-1">
                        {filteredArchivedSessions.map((session: any) => (
                          <div key={session.id} className="mx-1 mb-0.5">
                            <DropdownMenuItem
                              onClick={() => setActiveSession(session.id)}
                              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface0 rounded opacity-60 hover:opacity-100 group"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-sm truncate block">
                                  {getSessionDisplayName(session)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {session.repo?.name || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-xs text-muted-foreground group-hover:hidden flex-shrink-0">
                                  {session.updatedAt ? formatRelativeTime(session.updatedAt) : ''}
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

        {/* Error Banner - Fixed at top */}
        {error && (
          <div className="bg-destructive/10 border-b border-destructive/20 p-3 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-destructive">{error}</p>
                {error.includes('Too many requests') && (
                  <p className="text-xs text-destructive/70 mt-1">
                    Please wait 30 seconds before trying again
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0 hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          {isCreatingSession ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <Loader2 className="h-8 w-8 mx-auto animate-spin" />
              <p className="font-medium">Creating session...</p>
              <p className="text-sm">Please wait</p>
            </div>
          ) : loadingMessages ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <Loader2 className="h-8 w-8 mx-auto animate-spin" />
              <p className="font-medium">Loading messages...</p>
              <p className="text-sm">Please wait</p>
            </div>
          ) : !currentSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
              <div className="w-16 h-16 rounded-2xl bg-surface0 flex items-center justify-center mb-4">
                <FolderGit2 className="h-8 w-8 text-mauve" />
              </div>
              <h3 className="mb-2">
                {selectedRepository && filteredActiveSessions.length === 0
                  ? 'No Sessions Yet'
                  : 'No Session Selected'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
                {selectedRepository && filteredActiveSessions.length === 0
                  ? `Start chatting about ${selectedRepository} by creating your first session.`
                  : selectedRepository
                    ? 'Select a session from the list above or create a new one.'
                    : 'Select a repository and create a new chat to get started.'}
              </p>
              {selectedRepository && filteredActiveSessions.length === 0 && (
                <Button
                  onClick={handleQuickCreateSession}
                  size="sm"
                  className="bg-mauve hover:bg-mauve/90 text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              )}
            </div>
          ) : sessionMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-surface0 flex items-center justify-center mb-4">
                <FolderGit2 className="h-8 w-8 text-mauve" />
              </div>
              <h3 className="mb-2">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Ask questions about {(currentSession as any)?.repo?.name}. Get help with code,
                architecture, or documentation.
              </p>
            </div>
          ) : currentSessionStatus === 'archived' ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <Archive className="h-8 w-8 mx-auto opacity-50" />
              <p className="font-medium">Archived Session</p>
              <p className="text-sm">
                This session has been archived. You can view the conversation history but cannot
                send new messages.
              </p>
            </div>
          ) : !canSendMessage ? (
            <div className="text-center text-muted-foreground py-8 space-y-2">
              <AlertCircle className="h-8 w-8 mx-auto opacity-50" />
              <p className="font-medium">Session is {currentSessionStatus}</p>
              <p className="text-sm">
                {currentSessionStatus === 'suspended'
                  ? 'Session suspended - may be resumable when agent supports it'
                  : 'You can view messages but cannot send new ones'}
              </p>
            </div>
          ) : sessionMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface0 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-mauve" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Ask me anything about {currentSession?.repo?.name || 'your project'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {sessionMessages.map((msg) => {
                const messageId = msg.id || 'unknown';
                const messageRole = msg.role || 'system';
                const messageStatus = msg.status;
                const isFailed = messageStatus === 'failed';
                const isSending = messageStatus === 'sending';
                const content =
                  msg.parsedContent?.type === 'text'
                    ? msg.parsedContent.text
                    : JSON.stringify(msg.parsedContent || {});

                return (
                  <div
                    key={messageId}
                    className={`flex ${messageRole === 'user' ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 relative break-words ${
                        messageRole === 'user' ? 'bg-mauve text-base' : 'bg-surface0 text-text'
                      } ${isFailed ? 'opacity-70 border-2 border-destructive' : ''}`}
                    >
                      <div>
                        <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="mb-4 last:mb-0 text-sm">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="mb-4 last:mb-0 space-y-1 list-disc pl-6">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="mb-4 last:mb-0 space-y-1 list-decimal pl-6">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => <li className="break-words">{children}</li>,
                              code: ({ className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                const isInline = !className || !language;
                                const codeString = String(children).replace(/\n$/, '');
                                return isInline ? (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <div className="relative group/code my-4">
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={language}
                                      PreTag="div"
                                      customStyle={{
                                        margin: 0,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {codeString}
                                    </SyntaxHighlighter>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover/code:opacity-100 transition-opacity bg-background/90 hover:bg-background"
                                      onClick={() =>
                                        handleCopyMessage(
                                          codeString,
                                          `${messageId}-code-${language}`
                                        )
                                      }
                                    >
                                      {copiedMessageId === `${messageId}-code-${language}` ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                );
                              },
                            }}
                          >
                            {content}
                          </ReactMarkdown>
                        </div>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <div className="flex items-center gap-2">
                            <p className="text-xs opacity-60">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                            </p>
                            {isFailed && (
                              <div className="flex items-center gap-1 text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                <span className="text-xs">Failed</span>
                              </div>
                            )}
                            {isSending && (
                              <div className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span className="text-xs opacity-60">Sending...</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isFailed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                onClick={async () => {
                                  setRetryingMessageId(messageId);
                                  try {
                                    await retryMessage(messageId);
                                  } catch (error) {
                                    console.error('Retry failed:', error);
                                  } finally {
                                    setRetryingMessageId(null);
                                  }
                                }}
                                disabled={retryingMessageId === messageId}
                              >
                                {retryingMessageId === messageId ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopyMessage(content, messageId)}
                            >
                              {copiedMessageId === messageId ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Agent is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area - Phase 3 Design */}
        <div className="p-4 border-t border-surface1 space-y-2">
          {/* Agent and Model Selectors Row */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-surface0/50"
              title="Attachments (coming soon)"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <AgentSelector />
            <ModelSelector />

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-surface0/50"
              title="Voice input (coming soon)"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          {/* Message Input */}
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isCreatingSession
                  ? 'Creating session...'
                  : canSendMessage
                    ? 'Ask me anything...'
                    : 'Session is not active'
              }
              className="min-h-[60px] max-h-[120px] pr-12 bg-surface0 border-surface1 focus:ring-mauve resize-none"
              disabled={isCreatingSession || !canSendMessage || sending}
            />
            <Button
              onClick={handleSend}
              disabled={isCreatingSession || !input.trim() || !canSendMessage || sending}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 bg-mauve hover:bg-mauve/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
