import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Model {
  id: string;
  name: string;
  category: string;
  badge?: string;
}

const models: Model[] = [
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", category: "Recently Used", badge: "1x" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", category: "Recently Used", badge: "1x" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", category: "Recommended", badge: "2x" },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", category: "Recommended", badge: "3x" },
  { id: "gpt-4", name: "GPT-4", category: "Recommended", badge: "1.5x" },
];

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const currentModel = models.find(m => m.id === selectedModel) || models[0];
  
  const recentlyUsed = models.filter(m => m.category === "Recently Used");
  const recommended = models.filter(m => m.category === "Recommended");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1 hover:bg-surface0/50 text-xs"
        >
          <span>{currentModel.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[320px] bg-mantle border-surface0 p-0"
      >
        <div className="p-2">
          {/* Recently Used */}
          {recentlyUsed.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Recently Used
              </div>
              <div className="space-y-0.5 mb-2">
                {recentlyUsed.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => onSelectModel(model.id)}
                    className={`px-3 py-2 cursor-pointer rounded-md text-sm flex items-center justify-between ${
                      model.id === selectedModel 
                        ? "bg-surface0 text-foreground" 
                        : "hover:bg-surface0/50"
                    }`}
                  >
                    <span>{model.name}</span>
                    {model.badge && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {model.badge}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-surface0 my-2" />
            </>
          )}

          {/* Recommended */}
          {recommended.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Recommended
              </div>
              <div className="space-y-0.5">
                {recommended.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => onSelectModel(model.id)}
                    className={`px-3 py-2 cursor-pointer rounded-md text-sm flex items-center justify-between ${
                      model.id === selectedModel 
                        ? "bg-surface0 text-foreground" 
                        : "hover:bg-surface0/50"
                    }`}
                  >
                    <span>{model.name}</span>
                    {model.badge && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {model.badge}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
