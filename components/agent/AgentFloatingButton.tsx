'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAgentChat } from '@/lib/contexts/AgentChatContext';

export function AgentFloatingButton() {
  const { openPanel, sessions } = useAgentChat();

  // Count only active and completed sessions
  const activeSessionCount = Array.from(sessions.values()).filter((session) => {
    const s = session as unknown as { status: string };
    return s.status === 'active' || s.status === 'completed';
  }).length;

  return (
    <Button
      onClick={openPanel}
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      aria-label="Open AI Assistant"
    >
      <MessageSquare className="h-6 w-6" />
      {activeSessionCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
          {activeSessionCount}
        </span>
      )}
    </Button>
  );
}
