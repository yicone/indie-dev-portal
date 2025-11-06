'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Repository {
  id: number;
  name: string;
}

interface NewSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: Repository[];
  onCreateSession: (repoId: number, sessionName: string) => Promise<void>;
  initialRepository?: number;
}

export function NewSessionDialog({
  isOpen,
  onClose,
  repositories,
  onCreateSession,
  initialRepository,
}: NewSessionDialogProps) {
  const [sessionName, setSessionName] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepository?.toString() || '');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!sessionName.trim() || !selectedRepoId) return;

    setIsCreating(true);
    try {
      await onCreateSession(parseInt(selectedRepoId), sessionName.trim());
      setSessionName('');
      setSelectedRepoId('');
      onClose();
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSessionName('');
    setSelectedRepoId(initialRepository?.toString() || '');
    onClose();
  };

  const isFormValid = sessionName.trim() && selectedRepoId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-mantle border border-surface0 rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">New Chat Session</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 hover:bg-surface0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          Create a new chat session for your project
        </p>

        {/* Form */}
        <div className="space-y-4">
          {/* Session Name Input */}
          <div>
            <label className="text-sm font-medium text-text mb-2 block">Session Name</label>
            <Input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Refactor authentication module"
              className="bg-surface0 border-surface1 focus:ring-mauve"
              maxLength={100}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isFormValid) {
                  handleCreate();
                }
              }}
            />
          </div>

          {/* Repository Selector */}
          <div>
            <label className="text-sm font-medium text-text mb-2 block">Repository</label>
            <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
              <SelectTrigger className="bg-surface0 border-surface1 focus:ring-mauve">
                <SelectValue placeholder="Choose a repository..." />
              </SelectTrigger>
              <SelectContent className="bg-mantle border-surface0">
                {repositories.map((repo) => (
                  <SelectItem
                    key={repo.id}
                    value={repo.id.toString()}
                    className="hover:bg-surface0"
                  >
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={handleClose} className="hover:bg-surface0">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isFormValid || isCreating}
            className="bg-mauve hover:bg-mauve/90 text-crust"
          >
            {isCreating ? 'Creating...' : 'Create Session'}
          </Button>
        </div>
      </div>
    </div>
  );
}
