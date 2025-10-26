import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';

export type GitRepoInfo = {
  name: string;
  slug: string;
  description: string | null;
  repoPath: string;
  primaryLanguage: string;
  frameworks: string[];
  ciStatus: 'passing' | 'failing' | 'pending' | 'none';
  lastOpenedAt: Date | null;
  notes: string | null;
  stars: number;
  commits: GitCommitInfo[];
};

export type GitCommitInfo = {
  hash: string;
  message: string;
  author: string;
  committedAt: Date;
};

/**
 * Detect primary language by counting file extensions
 */
async function detectPrimaryLanguage(repoPath: string): Promise<string> {
  const languageMap: Record<string, string> = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.py': 'Python',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
  };

  const extensionCounts: Record<string, number> = {};

  async function scanDir(dirPath: string, depth = 0): Promise<void> {
    if (depth > 3) return; // Limit recursion depth

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        // Skip common directories
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === 'vendor'
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await scanDir(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (languageMap[ext]) {
            extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  await scanDir(repoPath);

  // Find most common extension
  let maxCount = 0;
  let primaryExt = '.js'; // Default

  for (const [ext, count] of Object.entries(extensionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      primaryExt = ext;
    }
  }

  return languageMap[primaryExt] || 'Unknown';
}

/**
 * Detect frameworks by checking for config files
 */
async function detectFrameworks(repoPath: string): Promise<string[]> {
  const frameworkIndicators: Record<string, string> = {
    'package.json': 'Node.js',
    'next.config.js': 'Next.js',
    'next.config.mjs': 'Next.js',
    'next.config.ts': 'Next.js',
    'vite.config.ts': 'Vite',
    'vite.config.js': 'Vite',
    'angular.json': 'Angular',
    'vue.config.js': 'Vue',
    'nuxt.config.js': 'Nuxt',
    'svelte.config.js': 'Svelte',
    'remix.config.js': 'Remix',
    'astro.config.mjs': 'Astro',
    'gatsby-config.js': 'Gatsby',
    'tsconfig.json': 'TypeScript',
    'Cargo.toml': 'Cargo',
    'go.mod': 'Go Modules',
    'requirements.txt': 'Python',
    Pipfile: 'Pipenv',
    'poetry.lock': 'Poetry',
  };

  const frameworks = new Set<string>();

  try {
    const files = await fs.readdir(repoPath);

    for (const file of files) {
      if (frameworkIndicators[file]) {
        frameworks.add(frameworkIndicators[file]);
      }
    }

    // Check package.json for additional frameworks
    if (files.includes('package.json')) {
      try {
        const packageJsonPath = path.join(repoPath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if (deps.react) frameworks.add('React');
        if (deps.express) frameworks.add('Express');
        if (deps['@nestjs/core']) frameworks.add('NestJS');
        if (deps.fastify) frameworks.add('Fastify');
        if (deps.tailwindcss) frameworks.add('Tailwind');
        if (deps.prisma || deps['@prisma/client']) frameworks.add('Prisma');
      } catch {
        // Ignore JSON parse errors
      }
    }
  } catch (error) {
    // Ignore read errors
  }

  return Array.from(frameworks).slice(0, 5); // Limit to 5 frameworks
}

/**
 * Check for CI configuration
 */
async function detectCIStatus(
  repoPath: string
): Promise<'passing' | 'failing' | 'pending' | 'none'> {
  const ciFiles = [
    '.github/workflows',
    '.gitlab-ci.yml',
    '.circleci/config.yml',
    'azure-pipelines.yml',
    '.travis.yml',
    'Jenkinsfile',
  ];

  try {
    const files = await fs.readdir(repoPath);

    for (const ciFile of ciFiles) {
      const ciPath = path.join(repoPath, ciFile);
      try {
        await fs.access(ciPath);
        return 'pending'; // CI exists but we don't know status
      } catch {
        // File doesn't exist, continue
      }
    }
  } catch {
    // Ignore errors
  }

  return 'none';
}

/**
 * Get repository description from README or package.json
 */
async function getRepoDescription(repoPath: string): Promise<string | null> {
  // Try package.json first
  try {
    const packageJsonPath = path.join(repoPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    if (packageJson.description) {
      return packageJson.description;
    }
  } catch {
    // Ignore
  }

  // Try README
  const readmeFiles = ['README.md', 'README.txt', 'README'];
  for (const readme of readmeFiles) {
    try {
      const readmePath = path.join(repoPath, readme);
      const content = await fs.readFile(readmePath, 'utf-8');
      // Get first non-empty line that's not a heading
      const lines = content.split('\n').filter((line) => line.trim());
      for (const line of lines) {
        if (!line.startsWith('#') && line.length > 10 && line.length < 200) {
          return line.trim();
        }
      }
    } catch {
      // Ignore
    }
  }

  return null;
}

/**
 * Parse commits from git log
 */
async function getCommits(git: SimpleGit, limit = 10): Promise<GitCommitInfo[]> {
  try {
    const log: LogResult = await git.log({ maxCount: limit });

    return log.all.map((commit) => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      committedAt: new Date(commit.date),
    }));
  } catch (error) {
    console.error('Failed to get commits:', error);
    return [];
  }
}

/**
 * Check if directory is a git repository
 */
export async function isGitRepo(dirPath: string): Promise<boolean> {
  try {
    const git = simpleGit(dirPath);
    await git.status();
    return true;
  } catch {
    return false;
  }
}

/**
 * Scan a directory for git repositories
 */
export async function scanForRepos(basePath: string, maxDepth = 2): Promise<string[]> {
  const repos: string[] = [];

  async function scan(dirPath: string, depth = 0): Promise<void> {
    if (depth > maxDepth) return;

    try {
      // Check if this directory is a git repo
      if (await isGitRepo(dirPath)) {
        repos.push(dirPath);
        return; // Don't scan subdirectories of a git repo
      }

      // Scan subdirectories
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(path.join(dirPath, entry.name), depth + 1);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  await scan(basePath);
  return repos;
}

/**
 * Parse a git repository and extract metadata
 */
export async function parseGitRepo(repoPath: string): Promise<GitRepoInfo> {
  const git = simpleGit(repoPath);
  const repoName = path.basename(repoPath);
  const slug = repoName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Get all metadata in parallel
  const [description, primaryLanguage, frameworks, ciStatus, commits] = await Promise.all([
    getRepoDescription(repoPath),
    detectPrimaryLanguage(repoPath),
    detectFrameworks(repoPath),
    detectCIStatus(repoPath),
    getCommits(git, 10),
  ]);

  return {
    name: repoName,
    slug,
    description,
    repoPath,
    primaryLanguage,
    frameworks,
    ciStatus,
    lastOpenedAt: null, // Will be tracked separately
    notes: null,
    stars: 0,
    commits,
  };
}

/**
 * Scan multiple paths and parse all git repositories
 */
export async function scanAndParseRepos(scanPaths: string[], maxDepth = 2): Promise<GitRepoInfo[]> {
  const allRepoPaths = new Set<string>();

  // Scan all paths
  for (const scanPath of scanPaths) {
    try {
      const repos = await scanForRepos(scanPath, maxDepth);
      repos.forEach((repo) => allRepoPaths.add(repo));
    } catch (error) {
      console.error(`Failed to scan ${scanPath}:`, error);
    }
  }

  // Parse all repositories
  const repoInfos = await Promise.all(
    Array.from(allRepoPaths).map((repoPath) => parseGitRepo(repoPath))
  );

  return repoInfos;
}
