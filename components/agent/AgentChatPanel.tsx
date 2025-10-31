'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAgentChat } from '@/lib/contexts/AgentChatContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AgentChatPanel() {
  const { isOpen, closePanel, activeSessionId, messages, sendMessage, connectionStatus } =
    useAgentChat();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const sessionMessages = activeSessionId ? messages.get(activeSessionId) || [] : [];

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(input);
      setInput('');
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
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">AI Assistant</h2>
          <div
            className={`h-2 w-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-500'
                : connectionStatus === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={closePanel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!activeSessionId ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No active session</p>
            <p className="text-sm">Select a project and start a conversation</p>
          </div>
        ) : sessionMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Start a conversation</p>
            <p className="text-sm">Ask me anything about your project</p>
          </div>
        ) : (
          sessionMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {msg.role === 'agent' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.parsedContent.type === 'text'
                        ? msg.parsedContent.text
                        : JSON.stringify(msg.parsedContent)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.parsedContent.type === 'text'
                      ? msg.parsedContent.text
                      : JSON.stringify(msg.parsedContent)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="min-h-[60px] max-h-[120px]"
            disabled={!activeSessionId || sending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !activeSessionId || sending}
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
