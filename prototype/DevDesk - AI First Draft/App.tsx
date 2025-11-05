import { useState, useEffect } from "react";
import { DashboardHeader, SortOption } from "./components/DashboardHeader";
import { ProjectCard, Project } from "./components/ProjectCard";
import { Skeleton } from "./components/ui/skeleton";
import { ChatPanel } from "./components/ChatPanel";
import { ChatButton } from "./components/ChatButton";

// Mock data for projects
const mockProjects: Project[] = [
  {
    id: "1",
    name: "personal-website",
    language: "typescript",
    framework: "NextJS",
    lastOpened: "2 days ago",
    ciStatus: "passing",
    notes: "Production site hosted on Vercel. Remember to update analytics before next deploy.",
    commits: [
      {
        message: "feat: add dark mode support",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        hash: "a3f4c2d",
      },
      {
        message: "fix: responsive layout issues on mobile",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        hash: "b7e9d1f",
      },
      {
        message: "docs: update README with deployment steps",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        hash: "c1a8b4e",
      },
      {
        message: "refactor: optimize bundle size",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        hash: "d4f2e8a",
      },
      {
        message: "feat: implement blog section",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "e8c3f1b",
      },
    ],
  },
  {
    id: "2",
    name: "ml-pipeline",
    language: "python",
    framework: "Flask",
    lastOpened: "1 week ago",
    ciStatus: "failing",
    notes: "Unit tests failing on GPU instance. Need to update CUDA drivers.",
    commits: [
      {
        message: "feat: add data preprocessing module",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        hash: "f9a2e4d",
      },
      {
        message: "fix: memory leak in training loop",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        hash: "a1b3c7e",
      },
      {
        message: "perf: improve model inference speed",
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
        hash: "c7d9e2f",
      },
      {
        message: "test: add unit tests for data loader",
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        hash: "b4e8f1a",
      },
      {
        message: "feat: implement model versioning",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "d2f5a9c",
      },
    ],
  },
  {
    id: "3",
    name: "ecommerce-app",
    language: "typescript",
    framework: "React",
    ciStatus: "passing",
    lastOpened: "Yesterday",
    commits: [
      {
        message: "feat: add payment gateway integration",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        hash: "e3a7b2c",
      },
      {
        message: "fix: shopping cart persistence issue",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        hash: "f1c8d4e",
      },
      {
        message: "style: update product card design",
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        hash: "a9e2f7b",
      },
      {
        message: "feat: implement wishlist functionality",
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        hash: "c4b8e1f",
      },
      {
        message: "fix: checkout form validation",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "b7d3a9e",
      },
    ],
  },
  {
    id: "4",
    name: "api-gateway",
    language: "go",
    lastOpened: "3 days ago",
    ciStatus: "pending",
    notes: "Microservices gateway. Remember to test rate limiting before production deploy.",
    commits: [
      {
        message: "feat: add rate limiting middleware",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        hash: "d8f3a1e",
      },
      {
        message: "fix: connection pool exhaustion",
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        hash: "e2a9c7f",
      },
      {
        message: "perf: optimize routing performance",
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        hash: "f7b4e2a",
      },
      {
        message: "docs: add API documentation",
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        hash: "a3c9d8f",
      },
      {
        message: "feat: implement circuit breaker",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "c1e7b4a",
      },
    ],
  },
  {
    id: "5",
    name: "dashboard-ui",
    language: "typescript",
    framework: "Vue",
    lastOpened: "5 days ago",
    ciStatus: "passing",
    commits: [
      {
        message: "feat: add chart components",
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        hash: "b9f2e4a",
      },
      {
        message: "fix: data table sorting bug",
        timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
        hash: "d4a8c1e",
      },
      {
        message: "style: implement new color scheme",
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        hash: "e7c3f9b",
      },
      {
        message: "feat: add export to CSV functionality",
        timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        hash: "f2b7d4a",
      },
      {
        message: "refactor: split large components",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "a8e1c3f",
      },
    ],
  },
  {
    id: "6",
    name: "game-engine",
    language: "rust",
    lastOpened: "1 month ago",
    ciStatus: "none",
    commits: [
      {
        message: "feat: implement physics engine",
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        hash: "c3f8a2e",
      },
      {
        message: "perf: optimize rendering pipeline",
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        hash: "d9b4e7f",
      },
      {
        message: "feat: add particle system",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        hash: "e4a1c8b",
      },
      {
        message: "fix: memory safety issues",
        timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
        hash: "f1c7d3a",
      },
      {
        message: "feat: implement audio system",
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "b2e9a4f",
      },
    ],
  },
  {
    id: "7",
    name: "mobile-app",
    language: "typescript",
    framework: "React",
    lastOpened: "Today",
    ciStatus: "passing",
    commits: [
      {
        message: "feat: add push notifications",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        hash: "a7d2f8e",
      },
      {
        message: "fix: camera permission handling",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        hash: "c9e4b1f",
      },
      {
        message: "feat: implement offline mode",
        timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        hash: "e2f7a9c",
      },
      {
        message: "style: update app icons",
        timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
        hash: "f8b3d2a",
      },
      {
        message: "feat: add biometric authentication",
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        hash: "d1a4e7b",
      },
    ],
  },
  {
    id: "8",
    name: "data-visualizer",
    language: "python",
    lastOpened: "2 weeks ago",
    ciStatus: "pending",
    commits: [
      {
        message: "feat: add 3D plotting support",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        hash: "b4e9a3f",
      },
      {
        message: "fix: color scale rendering",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        hash: "c7d1f4e",
      },
      {
        message: "feat: implement interactive tooltips",
        timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
        hash: "e9a2c8b",
      },
      {
        message: "perf: optimize large dataset rendering",
        timestamp: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
        hash: "f3b8d1a",
      },
      {
        message: "feat: add export to PNG",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "a1e4c7f",
      },
    ],
  },
  {
    id: "9",
    name: "component-library",
    language: "typescript",
    framework: "Svelte",
    lastOpened: "4 days ago",
    ciStatus: "passing",
    notes: "Open-source component library. Need to publish v2.0 to npm.",
    commits: [
      {
        message: "feat: add accordion component",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        hash: "d2f9a7e",
      },
      {
        message: "docs: update component examples",
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        hash: "e8b3c4f",
      },
      {
        message: "feat: implement theme customization",
        timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
        hash: "f4a7d9b",
      },
      {
        message: "fix: accessibility improvements",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        hash: "a9c2e8f",
      },
      {
        message: "feat: add dropdown menu",
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        hash: "c3e7b1a",
      },
    ],
  },
];

// Helper function to calculate commit frequency (commits per day)
const calculateCommitFrequency = (commits: Project['commits']): number => {
  if (commits.length === 0) return 0;
  
  const timestamps = commits.map(c => new Date(c.timestamp).getTime());
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);
  const daysDiff = (newest - oldest) / (1000 * 60 * 60 * 24);
  
  return daysDiff > 0 ? commits.length / daysDiff : commits.length;
};

// Helper function to parse relative time strings to sortable values
const parseLastOpened = (lastOpened?: string): number => {
  if (!lastOpened) return Infinity;
  
  const now = Date.now();
  const lowerStr = lastOpened.toLowerCase();
  
  if (lowerStr === "today") return now;
  if (lowerStr === "yesterday") return now - 24 * 60 * 60 * 1000;
  
  const match = lowerStr.match(/(\d+)\s+(day|week|month)s?\s+ago/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === "day") return now - value * 24 * 60 * 60 * 1000;
    if (unit === "week") return now - value * 7 * 24 * 60 * 60 * 1000;
    if (unit === "month") return now - value * 30 * 24 * 60 * 60 * 1000;
  }
  
  return Infinity;
};

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("lastOpened");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialRepo, setChatInitialRepo] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    // Simulate loading projects
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setProjects([...mockProjects]);
      setIsLoading(false);
    }, 600);
  };

  const handleUpdateNotes = (projectId: string, notes: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? { ...project, notes } : project
      )
    );
  };

  const handleChatWithRepo = (repoName: string) => {
    setChatInitialRepo(repoName);
    setIsChatOpen(true);
  };

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesLanguage =
        selectedLanguage === "all" || project.language === selectedLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "lastOpened":
          return parseLastOpened(b.lastOpened) - parseLastOpened(a.lastOpened);
        case "commitFrequency":
          return calculateCommitFrequency(b.commits) - calculateCommitFrequency(a.commits);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onRefresh={handleRefresh}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
      />

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4 p-6 border border-border rounded-lg bg-card">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-2/3 bg-surface0" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 bg-surface0" />
                    <Skeleton className="h-6 w-24 bg-surface0" />
                  </div>
                </div>
                <div className="space-y-2 pt-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full bg-surface0" />
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-9 flex-1 bg-surface0" />
                  <Skeleton className="h-9 flex-1 bg-surface0" />
                  <Skeleton className="h-9 w-20 bg-surface0" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-surface0 p-6 mb-4">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-muted-foreground">No projects found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchQuery || selectedLanguage !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first project"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onUpdateNotes={handleUpdateNotes}
                onChatWithRepo={handleChatWithRepo}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"} loaded
            </p>
            <div className="flex items-center gap-6">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
              <a href="#" className="hover:text-mauve transition-colors">
                Settings
              </a>
              <a href="#" className="hover:text-mauve transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Panel & Button */}
      <ChatButton onClick={() => setIsChatOpen(true)} isOpen={isChatOpen} />
      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialRepo(undefined);
        }}
        repositories={projects.map(p => p.name)}
        initialRepository={chatInitialRepo}
      />
    </div>
  );
}
