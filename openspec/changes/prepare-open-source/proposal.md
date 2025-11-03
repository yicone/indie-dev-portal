# Prepare Project for Open Source

## Why

The project is ready to be shared with the open source community. To ensure a professional and welcoming experience for contributors, we need to:

1. Standardize all communication (docs, code, git history) to English
2. Add proper open source licensing
3. Establish contribution guidelines and governance

This will make the project accessible to a global audience and establish clear expectations for contributors.

## What Changes

### 1. Project Rebranding

- **Name**: Change from "Personal Developer Dashboard" to "DevDesk"
- **Slogan**: "A local-first multi-repo workspace for developers."
- **Update**: README.md, package.json, documentation references

### 2. Language Standardization

- **Documentation**: All documentation is already in English ✅
- **Code Comments**: All comments are already in English ✅
- **Git History**: Commit messages have been cleaned up ✅
- **Future Commits**: Enforce English-only commit messages via git hooks

### 3. Open Source Licensing

- Add AGPL-3.0 License (copyleft, ensures derivatives remain open source)
- Include license headers in source files where appropriate
- Document third-party licenses in NOTICE file

### 4. Governance & Contribution

- Add CONTRIBUTING.md with contribution guidelines
- Add CODE_OF_CONDUCT.md for community standards
- Add SECURITY.md for vulnerability reporting
- Update README.md with contributor information
- Add issue templates and PR templates

### 5. Project Metadata

- Add comprehensive package.json metadata (keywords, repository, bugs, homepage)
- Add badges to README (license, Node.js version, etc.)
- Add CHANGELOG.md for version history

## Impact

**Affected Specs**:

- New capability: `project-governance` (licensing, contribution guidelines)

**Affected Files**:

- Root files: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CHANGELOG.md`
- `package.json` metadata
- `.github/` templates
- `.commitlintrc.json`, `.gitmessage`, `.husky/commit-msg`
- `README.md` enhancements

**Breaking Changes**: None (internal process changes only)

**Migration Path**:

- Existing contributors should adopt English for all future contributions
- All new contributions must follow the guidelines in CONTRIBUTING.md
