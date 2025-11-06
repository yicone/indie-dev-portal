'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface AgentSelectorProps {
  currentAgent?: string;
  onAgentChange?: (agent: string) => void;
}

const AVAILABLE_AGENTS = [
  { id: 'gemini', name: 'Gemini', description: 'Google AI' },
  // Future agents can be added here
];

export function AgentSelector({ currentAgent = 'gemini', onAgentChange }: AgentSelectorProps) {
  const selectedAgent = AVAILABLE_AGENTS.find((a) => a.id === currentAgent) || AVAILABLE_AGENTS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-surface0/50">
          <span>{selectedAgent.name}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] bg-mantle border-surface0">
        {AVAILABLE_AGENTS.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => onAgentChange?.(agent.id)}
            className="px-3 py-2 hover:bg-surface0 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{agent.name}</span>
              <span className="text-xs text-muted-foreground">{agent.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
