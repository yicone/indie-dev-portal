# Roadmap & Known Limitations

## 🚧 Known Limitations

### Current Constraints

1. **No Real-Time Updates**
   - Requires manual `pnpm git:sync` to refresh repository data
   - Changes to repositories won't appear until next sync
   - **Workaround**: Run sync command after making significant changes

2. **Local Repositories Only**
   - Only scans local filesystem
   - No GitHub/GitLab API integration
   - Cannot fetch remote repository information
   - **Workaround**: Clone repositories locally to track them

3. **Browser Security Restrictions**
   - `vscode://` protocol may be blocked by some browsers
   - `file://` protocol may not work in all browsers
   - **Workaround**: Use Chrome/Edge for best compatibility

4. **Single User**
   - No authentication or multi-user support
   - All data stored locally
   - **Workaround**: Run separate instances for different users

5. **Limited CI/CD Detection**
   - Only detects configuration files (GitHub Actions, GitLab CI, CircleCI, etc.)
   - Cannot fetch actual CI/CD status from services
   - **Workaround**: Status is based on config file presence only

6. **Branch Information**
   - Currently shows hardcoded "main" for all commits
   - No branch detection or switching
   - **Workaround**: See [fixes/2025-10-26-last-committed-branch-display.md](fixes/2025-10-26-last-committed-branch-display.md) for planned solution

## 🎯 Roadmap

### Short-term (1-3 months)

#### AI Agent Features

- [ ] **Multi-Agent Support**
  - Add Codex CLI integration
  - Add Claude Code integration
  - Agent-specific capabilities
- [ ] **Keyboard Shortcuts**
  - Session navigation (Cmd/Ctrl+K)
  - Quick actions (Cmd/Ctrl+N, E, R)
  - Shortcuts help modal

#### AI Agent Advanced Features

- [ ] **Agent Task Panel** (In Progress)
  - Real-time task monitoring
  - File change preview with diff
  - Approval workflow for destructive operations
  - Task history and filtering
- [ ] **Advanced Message Display**
  - Rich content rendering (tables, charts)
  - Interactive elements in messages
  - Context-aware code suggestions

#### Testing & Quality

- [ ] Add unit tests for React components (Vitest/Jest)
- [ ] Add E2E tests (Playwright)
- [ ] Add API endpoint tests
- [ ] Set up CI/CD pipeline

#### Git Features

- [ ] Implement branch detection
- [ ] Show branch name per commit
- [ ] Add branch switcher in UI
- [ ] Track all branches in repository

#### UI Improvements

- [ ] Add commit graph visualization
- [ ] Improve search with fuzzy matching
- [ ] Add repository grouping/tagging

### Mid-term (3-6 months)

#### AI Agent Features

- [ ] **Session Export**
  - Export to JSON format
  - Export to Markdown format

#### AI Agent Advanced Features

- [ ] **Agent Permission Control**
  - Fine-grained permission system
  - Per-repository access control
  - Audit logging for agent actions

#### Remote Integration

- [ ] GitHub API integration
  - Fetch remote repository information
  - Show stars, forks, issues count
  - Display PR status
- [ ] GitLab API integration
- [ ] Bitbucket support

#### Real-time Features

- [ ] File system watcher for auto-sync
- [ ] Git hooks integration
- [ ] Real-time commit detection

#### Advanced Features

- [ ] Repository analytics
  - Commit frequency graphs
  - Language distribution charts
  - Contributor statistics
- [ ] Code search across repositories
- [ ] Snippet management

### Long-term (6+ months)

#### CI/CD Integration

- [ ] Fetch actual CI/CD status from services
- [ ] Trigger builds from dashboard
- [ ] View build logs
- [ ] Deployment management

#### Advanced Git Operations

- [ ] Commit from dashboard
- [ ] Branch management
- [ ] Merge conflict resolution
- [ ] Stash management

#### Extensibility

- [ ] Plugin system
- [ ] Custom themes
- [ ] API for third-party integrations
- [ ] Webhook support

## 📊 Priority Matrix

| Feature                  | Impact | Effort | Priority |
| ------------------------ | ------ | ------ | -------- |
| Agent Task Panel         | High   | High   | **P0**   |
| Multi-Agent Support      | High   | Medium | **P0**   |
| Advanced Message Display | High   | Medium | **P1**   |
| Branch Detection         | High   | Low    | **P1**   |
| Unit Tests               | High   | Medium | **P1**   |
| Keyboard Shortcuts       | Medium | Low    | **P2**   |
| GitHub API               | High   | High   | **P2**   |
| File Watcher             | Medium | Medium | **P2**   |
| Commit Graph             | Medium | Low    | **P3**   |
| Session Export           | Medium | Low    | **P3**   |

## 🔄 Version Planning

### v1.2.0 (Next Release - Target: Dec 2025)

- **Agent Task Panel** (In Progress - P0)
  - Real-time task monitoring
  - File change preview and approval
  - Approval workflow for destructive operations
  - Task history and filtering
- **Multi-Agent Support** (P0)
  - Codex CLI integration
  - Claude Code integration
  - Agent-specific capabilities
- **Advanced Message Display** (P1)
  - Rich content rendering (tables, charts)
  - Interactive elements in messages
  - Context-aware code suggestions

### v1.3.0 (Target: Q1 2026)

- Branch Detection (P1)
- Unit Tests (P1)
- Keyboard Shortcuts (P2)
- Session Export (P3)

### v1.4.0 (Target: Q2 2026)

- GitHub API integration (P2)
- File system watcher (P2)
- Agent Permission Control
- Commit graph visualization (P3)

### Future (Undecided)

- CI/CD integration
- Plugin system
- Advanced git operations

## 💡 Feature Requests

Have an idea? Open an issue on GitHub with the `enhancement` label.

## 📝 Notes

- This roadmap is subject to change based on user feedback and priorities
- Dates are estimates and may shift
- Some features may be moved between versions
- Community contributions are welcome!

---

**Last Updated**: Nov 6, 2025  
**Current Version**: v1.1.0  
**Next Release**: v1.2.0 (Target: Dec 2025)
