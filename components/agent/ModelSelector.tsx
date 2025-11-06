'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface ModelSelectorProps {
  currentModel?: string;
  onModelChange?: (model: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash-exp', name: 'gemini-2.0-flash-exp', description: 'Latest experimental' },
  { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro', description: 'Production ready' },
  { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash', description: 'Fast responses' },
];

export function ModelSelector({
  currentModel = 'gemini-2.0-flash-exp',
  onModelChange,
}: ModelSelectorProps) {
  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === currentModel) || AVAILABLE_MODELS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-surface0/50">
          <span>{selectedModel.name}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] bg-mantle border-surface0">
        {AVAILABLE_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange?.(model.id)}
            className="px-3 py-2 hover:bg-surface0 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
