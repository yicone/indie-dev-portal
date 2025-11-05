import { Code2, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Agent {
  id: string;
  name: string;
  icon?: JSX.Element;
}

const agents: Agent[] = [
  { id: "gemini", name: "Gemini", icon: <Code2 className="h-3.5 w-3.5" /> },
  { id: "code-assistant", name: "Code Assistant", icon: <Code2 className="h-3.5 w-3.5" /> },
];

interface AgentSelectorProps {
  selectedAgent: string;
  onSelectAgent: (agentId: string) => void;
}

export function AgentSelector({ selectedAgent, onSelectAgent }: AgentSelectorProps) {
  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1 hover:bg-surface0/50 text-xs"
        >
          {currentAgent.icon}
          <span>{currentAgent.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[280px] bg-mantle border-surface0 p-0"
      >
        <div className="p-2 space-y-0.5">
          {agents.map((agent) => (
            <DropdownMenuItem
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`px-3 py-2 cursor-pointer rounded-md text-sm ${
                agent.id === selectedAgent 
                  ? "bg-surface0 text-foreground" 
                  : "hover:bg-surface0/50"
              }`}
            >
              <div className="flex items-center gap-2">
                {agent.icon}
                <span>{agent.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
