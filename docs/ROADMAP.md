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
- [ ] Add keyboard shortcuts
- [ ] Add repository grouping/tagging

### Mid-term (3-6 months)

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
- [ ] WebSocket for live updates

#### Advanced Features

- [ ] Repository analytics
  - Commit frequency graphs
  - Language distribution charts
  - Contributor statistics
- [ ] Code search across repositories
- [ ] Snippet management
- [ ] Task/TODO tracking

### Long-term (6+ months)

#### Multi-user Support

- [ ] Authentication system
- [ ] User profiles
- [ ] Team collaboration features
- [ ] Shared repositories

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

| Feature          | Impact | Effort | Priority |
| ---------------- | ------ | ------ | -------- |
| Branch Detection | High   | Low    | **P0**   |
| Unit Tests       | High   | Medium | **P0**   |
| GitHub API       | High   | High   | **P1**   |
| File Watcher     | Medium | Medium | **P1**   |
| Commit Graph     | Medium | Low    | **P2**   |
| Multi-user       | Low    | High   | **P3**   |

## 🔄 Version Planning

### v1.1.0 (Next Release)

- Branch detection
- Unit tests
- E2E tests
- Improved search

### v1.2.0

- GitHub API integration
- File system watcher
- Commit graph visualization

### v2.0.0

- Multi-user support
- Real-time updates
- Advanced git operations

## 💡 Feature Requests

Have an idea? Open an issue on GitHub with the `enhancement` label.

## 📝 Notes

- This roadmap is subject to change based on user feedback and priorities
- Dates are estimates and may shift
- Some features may be moved between versions
- Community contributions are welcome!

---

**Last Updated**: October 26, 2025  
**Current Version**: 1.0.0  
**Next Release**: v1.1.0 (Target: December 2025)
