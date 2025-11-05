import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface NewSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (name: string, repository: string) => void;
  repositories: string[];
  initialRepository?: string;
}

export function NewSessionDialog({
  isOpen,
  onClose,
  onCreateSession,
  repositories,
  initialRepository
}: NewSessionDialogProps) {
  const [sessionName, setSessionName] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(initialRepository || "");

  // Update selected repo when initialRepository changes
  useEffect(() => {
    if (initialRepository) {
      setSelectedRepo(initialRepository);
    }
  }, [initialRepository]);

  const handleCreate = () => {
    if (sessionName.trim() && selectedRepo) {
      onCreateSession(sessionName, selectedRepo);
      setSessionName("");
      setSelectedRepo("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-mantle border-surface0">
        <DialogHeader>
          <DialogTitle>New Chat Session</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new AI chat session for a specific repository
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Refactor authentication module"
              className="bg-surface0 border-surface1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repository">Repository</Label>
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="bg-surface0 border-surface1">
                <SelectValue placeholder="Choose a repository..." />
              </SelectTrigger>
              <SelectContent className="bg-mantle border-surface0">
                {repositories.map((repo) => (
                  <SelectItem key={repo} value={repo}>
                    {repo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-surface0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!sessionName.trim() || !selectedRepo}
            className="bg-mauve hover:bg-mauve/90"
          >
            Create Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
