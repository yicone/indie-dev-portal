"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateRepoNotes } from "@/lib/repoActions";

type NotesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoSlug: string;
  repoName: string;
  initialNotes: string | null;
};

export function NotesDialog({
  open,
  onOpenChange,
  repoSlug,
  repoName,
  initialNotes,
}: NotesDialogProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => updateRepoNotes(repoSlug, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["repos"] });
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Notes</DialogTitle>
          <DialogDescription>
            Add or update notes for <strong>{repoName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Add notes about this repository..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
        {mutation.isError && (
          <p className="text-sm text-red">
            Failed to save notes. Please try again.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
