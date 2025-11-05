import { 
  Code2, 
  GitCommit, 
  ExternalLink, 
  FolderOpen, 
  GitCompare,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  StickyNote,
  Edit3,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

export interface Commit {
  message: string;
  timestamp: string;
  hash: string;
}

export type CIStatus = "passing" | "failing" | "pending" | "none";

export interface Project {
  id: string;
  name: string;
  language: string;
  framework?: string;
  commits: Commit[];
  lastOpened?: string;
  ciStatus?: CIStatus;
  notes?: string;
}

interface ProjectCardProps {
  project: Project;
  onUpdateNotes?: (projectId: string, notes: string) => void;
  onChatWithRepo?: (repoName: string) => void;
}

const languageColors: Record<string, string> = {
  typescript: "bg-blue text-background",
  javascript: "bg-yellow text-background",
  python: "bg-green text-background",
  go: "bg-sky text-background",
  rust: "bg-peach text-background",
};

const frameworkIcons: Record<string, JSX.Element> = {
  react: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26s-1.18-1.63-3.28-2.26c-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26s1.18 1.63 3.28 2.26c.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96a22.7 22.7 0 0 1 2.4-.36c.48-.67.99-1.31 1.51-1.9z" />
    </svg>
  ),
  vue: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 3h3.5L12 15l6.5-12H22L12 21L2 3m4.5 0h3L12 7.58L14.5 3h3L12 13.08L6.5 3Z" />
    </svg>
  ),
  svelte: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.15l2.131-1.36a4.025 4.025 0 0 1 1.136-.499 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.582l-5.589 3.562a4.072 4.072 0 0 1-1.135.499z" />
    </svg>
  ),
  nextjs: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.049-.106.005-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" />
    </svg>
  ),
  flask: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 3h12v5l6 9v1c0 1.66-1.34 3-3 3H3c-1.66 0-3-1.34-3-3v-1l6-9V3m2 2v5.17L2.5 17h19L16 10.17V5H8z" />
    </svg>
  ),
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

const getCIStatusBadge = (status: CIStatus) => {
  switch (status) {
    case "passing":
      return (
        <Badge className="bg-green/20 text-green border-green/30 gap-1.5">
          <CheckCircle2 className="h-3 w-3" />
          Passing
        </Badge>
      );
    case "failing":
      return (
        <Badge className="bg-red/20 text-red border-red/30 gap-1.5">
          <XCircle className="h-3 w-3" />
          Failing
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow/20 text-yellow border-yellow/30 gap-1.5">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    default:
      return null;
  }
};

export function ProjectCard({ project, onUpdateNotes, onChatWithRepo }: ProjectCardProps) {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState(project.notes || "");

  const handleSaveNotes = () => {
    onUpdateNotes?.(project.id, notes);
    setIsNotesOpen(false);
  };

  return (
    <Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-mauve/10 hover:border-mauve/50 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-5 w-5 text-mauve flex-shrink-0" />
              <h3 className="truncate">{project.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={languageColors[project.language] || "bg-surface1"}>
                {project.language}
              </Badge>
              {project.framework && (
                <Badge variant="outline" className="border-overlay0 text-foreground gap-1.5">
                  {frameworkIcons[project.framework.toLowerCase()]}
                  {project.framework}
                </Badge>
              )}
              {project.ciStatus && project.ciStatus !== "none" && getCIStatusBadge(project.ciStatus)}
            </div>
          </div>
          {project.lastOpened && (
            <div className="flex items-center gap-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs whitespace-nowrap">{project.lastOpened}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <Separator className="bg-border" />

      <CardContent className="pt-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <GitCommit className="h-4 w-4" />
            <span className="text-sm">Recent commits</span>
          </div>

          <div className="space-y-2">
            {project.commits.slice(0, 5).map((commit, index) => (
              <div
                key={commit.hash}
                className="group/commit flex items-start gap-2.5 rounded-md p-2 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-foreground">
                    {commit.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">
                      {commit.hash.substring(0, 7)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(commit.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border my-4" />

        {project.notes && (
          <div className="mb-4 p-3 bg-surface0/50 rounded-md border border-overlay0">
            <div className="flex items-start gap-2">
              <StickyNote className="h-4 w-4 text-yellow flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground line-clamp-2">{project.notes}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 bg-surface0 border-overlay0 hover:bg-mauve hover:text-background hover:border-mauve transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            VS Code
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 bg-surface0 border-overlay0 hover:bg-blue hover:text-background hover:border-blue transition-all"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Folder
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChatWithRepo?.(project.name)}
            className="gap-2 bg-surface0 border-overlay0 hover:bg-lavender hover:text-background hover:border-lavender transition-all"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 bg-surface0 border-overlay0 hover:bg-green hover:text-background hover:border-green transition-all"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Diff
          </Button>
          <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-surface0 border-overlay0 hover:bg-yellow hover:text-background hover:border-yellow transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Notes
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Project Notes</DialogTitle>
                <DialogDescription>
                  Add notes or documentation for {project.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter your notes here..."
                  className="min-h-[150px] bg-background border-border font-mono text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsNotesOpen(false)}
                    className="bg-surface0 border-overlay0"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNotes}
                    className="bg-mauve text-background hover:bg-mauve/90"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <div className="absolute top-0 right-0 h-1 w-0 bg-gradient-to-r from-mauve via-lavender to-blue transition-all duration-300 group-hover:w-full" />
    </Card>
  );
}
