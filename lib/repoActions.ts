/**
 * Utility functions for repository actions
 */

export function openInVSCode(repoPath: string): void {
  // Use vscode:// protocol to open in VS Code
  const url = `vscode://file/${repoPath}`;
  window.open(url, '_blank');
}

export function openInFinder(repoPath: string): void {
  // For macOS, use file:// protocol
  // Note: This may not work in all browsers due to security restrictions
  const url = `file://${repoPath}`;
  window.open(url, '_blank');
}

export function openGitDiff(repoPath: string): void {
  // Open VS Code with git diff view
  const url = `vscode://file/${repoPath}?command=git.viewChanges`;
  window.open(url, '_blank');
}

export async function updateRepoNotes(repoSlug: string, notes: string): Promise<void> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

  const response = await fetch(`${apiBaseUrl}/repos/${repoSlug}/notes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error('Failed to update notes');
  }
}
