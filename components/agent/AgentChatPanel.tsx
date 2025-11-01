'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  AlertCircle,
  Loader2,
  Archive,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAgentChat } from '@/lib/contexts/AgentChatContext';
import { useQuery } from '@tanstack/react-query';
import { fetchRepos } from '@/lib/gitUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [showArchived, setShowArchived] = useState(false);
  const [archivingSession, setArchivingSession] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { data: repos } = useQuery({ queryKey: ['repos'], queryFn: fetchRepos });
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

  const handleArchiveSession = async (sessionId: string) => {
    if (!confirm('Archive this session? You can view it later in "Show Archived".')) return;

    setArchivingSession(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to archive session');
      }

      // If we archived the active session, clear it
      if (sessionId === activeSessionId) {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Failed to archive session:', error);
      alert('Failed to archive session. Please try again.');
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
    <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-background border-l shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">AI Assistant</h2>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'connecting'
                  ? 'Connecting...'
                  : 'Disconnected'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={closePanel}>
          <X className="h-4 w-4" />
        </Button>
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

      {/* Session Selector */}
      <div className="p-4 border-b space-y-3">
        {sessions.size > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              {renamingSessionId === activeSessionId ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                    className="flex-1 px-2 py-1 text-sm border rounded"
                    placeholder="Session name"
                    maxLength={100}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveRename}
                    className="h-7 w-7 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelRename}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <label className="text-sm font-medium">Active Sessions:</label>
                    {activeSessionId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartRename(activeSessionId)}
                        className="h-5 w-5 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                    className="h-7 text-xs"
                  >
                    {showArchived ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hide Archived
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Show Archived
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
            <div className="space-y-2">
              <select
                className="w-full p-2 rounded-md border bg-background"
                value={activeSessionId || ''}
                onChange={(e) => setActiveSession(e.target.value || null)}
              >
                <option value="">Select a session...</option>
                {Array.from(sessions.values())
                  .filter((session) => {
                    const s = session as unknown as { status: string };
                    if (showArchived) {
                      return true; // Show all sessions
                    }
                    // Hide archived and error sessions by default
                    return s.status === 'active' || s.status === 'suspended';
                  })
                  .map((session) => {
                    const s = session as unknown as {
                      id: string;
                      status: string;
                      repo?: { name: string };
                    };
                    const displayName = getSessionDisplayName(s);
                    return (
                      <option key={s.id} value={s.id}>
                        {displayName} - {s.status}
                        {s.status === 'archived' ? ' (archived)' : ''}
                      </option>
                    );
                  })}
              </select>
              {activeSessionId && currentSessionStatus !== 'archived' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchiveSession(activeSessionId)}
                  disabled={archivingSession === activeSessionId}
                  className="w-full h-8 text-xs"
                >
                  {archivingSession === activeSessionId ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <Archive className="h-3 w-3 mr-1" />
                      Archive Session
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {/* Create New Session */}
        {repos && repos.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              {sessions.size > 0 ? 'Or create new:' : 'Select a project:'}
            </label>
            <select
              className="w-full p-2 rounded-md border bg-background"
              onChange={async (e) => {
                const repoId = parseInt(e.target.value);
                if (repoId) {
                  await createSession(repoId);
                  e.target.value = ''; // Reset selector
                }
              }}
              defaultValue=""
              disabled={isCreatingSession}
            >
              <option value="">
                {isCreatingSession ? 'Creating session...' : 'Choose a repository...'}
              </option>
              {repos.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        ) : !activeSessionId ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No active session</p>
            <p className="text-sm">Select a session or create a new one</p>
          </div>
        ) : currentSessionStatus === 'archived' ? (
          <div className="text-center text-muted-foreground py-8 space-y-2">
            <Archive className="h-8 w-8 mx-auto opacity-50" />
            <p className="font-medium">Archived Session</p>
            <p className="text-sm">
              This session has been archived. You can view the conversation history but cannot send
              new messages.
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
          <div className="text-center text-muted-foreground py-8">
            <p>Start a conversation</p>
            <p className="text-sm">Ask me anything about your project</p>
          </div>
        ) : (
          sessionMessages.map((msg) => {
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
                  className={`max-w-[80%] rounded-lg p-3 relative break-words ${
                    messageRole === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  } ${isFailed ? 'opacity-70 border-2 border-red-500' : ''}`}
                >
                  <div>
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                          ul: ({ children }) => (
                            <ul className="mb-4 last:mb-0 space-y-1 list-disc pl-6">{children}</ul>
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
                                    handleCopyMessage(codeString, `${messageId}-code-${language}`)
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
          })
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
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
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
            className="min-h-[60px] max-h-[120px]"
            disabled={isCreatingSession || !canSendMessage || sending}
          />
          <Button
            onClick={handleSend}
            disabled={isCreatingSession || !input.trim() || !canSendMessage || sending}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
