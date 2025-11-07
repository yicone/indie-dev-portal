import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { formatRelativeTime } from '@/lib/utils';
import { Archive, Check, Edit2, X } from 'lucide-react';
import React from 'react';

// Reusable Session List Item Component
const SessionListItem = ({
  session,
  isActive,
  isEditing,
  editedTitle,
  editInputRef,
  onSetActive,
  onSetEditedTitle,
  onSave,
  onCancel,
  onStartEdit,
  onArchive,
  getSessionDisplayName,
}: any) => {
  return (
    <div key={session.id} className="mx-1 mb-0.5">
      {isEditing ? (
        <div className="flex items-center gap-1 px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
          <Input
            ref={editInputRef}
            value={editedTitle}
            onChange={(e) => onSetEditedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
              e.stopPropagation();
            }}
            className="h-6 text-xs bg-surface0 border-surface1"
            onClick={(e) => e.stopPropagation()}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="h-6 w-6 hover:bg-surface0 flex-shrink-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="h-6 w-6 hover:bg-surface0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <DropdownMenuItem
          onClick={onSetActive}
          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface0 rounded group ${
            session.status === 'archived' ? 'opacity-60 hover:opacity-100' : ''
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />}
              <span className="text-sm truncate">{getSessionDisplayName(session)}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {session.repo?.name || 'Unknown'}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-muted-foreground group-hover:hidden flex-shrink-0">
              {session.updatedAt ? formatRelativeTime(session.updatedAt) : ''}
            </span>
            <div className="hidden group-hover:flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={onStartEdit}
                className="h-6 w-6 hover:bg-surface1"
                title="Rename"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              {session.status !== 'archived' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onArchive}
                  className="h-6 w-6 hover:bg-surface1"
                  title="Archive"
                >
                  <Archive className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuItem>
      )}
    </div>
  );
};

export default SessionListItem;
