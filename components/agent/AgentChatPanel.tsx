'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAgentChat } from '@/lib/contexts/AgentChatContext';
import { useQuery } from '@tanstack/react-query';
import { fetchRepos } from '@/lib/gitUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    error,
    clearError,
  } = useAgentChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const { data: repos } = useQuery({ queryKey: ['repos'], queryFn: fetchRepos });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const sessionMessages = activeSessionId ? messages.get(activeSessionId) || [] : [];
  const currentSession = activeSessionId ? sessions.get(activeSessionId) : null;
  const currentSessionStatus = currentSession
    ? (currentSession as unknown as { status: string }).status
    : null;
  const canSendMessage = activeSessionId && currentSessionStatus === 'active';

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
      <div className="p-4 border-b">
        {sessions.size > 0 ? (
          <div>
            <label className="text-sm font-medium mb-2 block">Active Sessions:</label>
            <select
              className="w-full p-2 rounded-md border bg-background mb-2"
              value={activeSessionId || ''}
              onChange={(e) => setActiveSession(e.target.value || null)}
            >
              <option value="">Select a session...</option>
              {Array.from(sessions.values())
                .filter((session) => {
                  const s = session as unknown as { status: string };
                  // Only show active and completed sessions
                  return s.status === 'active' || s.status === 'completed';
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
                    </option>
                  );
                })}
            </select>
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
        {!activeSessionId ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No active session</p>
            <p className="text-sm">Select a session or create a new one</p>
          </div>
        ) : !canSendMessage ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Session is {currentSessionStatus}</p>
            <p className="text-sm">You can view messages but cannot send new ones</p>
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
                className={`flex ${messageRole === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    messageRole === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <div>
                    {messageRole === 'agent' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{content}</p>
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                    </p>
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
