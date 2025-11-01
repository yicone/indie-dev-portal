'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, Loader2, Archive, Eye, EyeOff, Copy, Check } from 'lucide-react';
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
  const [creatingSession, setCreatingSession] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivingSession, setArchivingSession] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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

      {/* Session Selector */}
      <div className="p-4 border-b space-y-3">
        {sessions.size > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Active Sessions:</label>
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
                    return (
                      <option key={s.id} value={s.id}>
                        {s.repo?.name || `Session ${s.id.slice(0, 8)}`} - {s.status}
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
                  setCreatingSession(true);
                  try {
                    await createSession(repoId);
                    e.target.value = ''; // Reset selector
                  } catch (error) {
                    console.error('Failed to create session:', error);
                  } finally {
                    setCreatingSession(false);
                  }
                }
              }}
              defaultValue=""
              disabled={creatingSession}
            >
              <option value="">
                {creatingSession ? 'Creating session...' : 'Choose a repository...'}
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
                  }`}
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
                      <p className="text-xs opacity-60">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                      </p>
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

        {/* Error Display */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 flex items-center gap-2 max-w-[80%]">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
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
            placeholder={canSendMessage ? 'Ask me anything...' : 'Session is not active'}
            className="min-h-[60px] max-h-[120px]"
            disabled={!canSendMessage || sending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !canSendMessage || sending}
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
