# Implementation Tasks

## 0. Project Rebranding

- [ ] 0.1 Update package.json name to "devdesk"
- [ ] 0.2 Update package.json description to "A local-first multi-repo workspace for developers."
- [ ] 0.3 Update README.md title to "DevDesk"
- [ ] 0.4 Update README.md tagline/description
- [ ] 0.5 Search and replace "Personal Developer Dashboard" → "DevDesk" in all docs
- [ ] 0.6 Update openspec/project.md purpose section

## 1. Licensing

- [ ] 1.1 Add AGPL-3.0 License file to project root
- [ ] 1.2 Add license headers to key source files (optional, based on preference)
- [ ] 1.3 Create NOTICE file documenting third-party licenses
- [ ] 1.4 Update package.json with license field

## 2. Contribution Guidelines

- [ ] 2.1 Create CONTRIBUTING.md with:
  - [ ] How to set up development environment
  - [ ] Code style and conventions
  - [ ] Commit message format (Conventional Commits)
  - [ ] Pull request process
  - [ ] Testing requirements
- [ ] 2.2 Create CODE_OF_CONDUCT.md (use Contributor Covenant)
- [ ] 2.3 Create SECURITY.md with vulnerability reporting process
- [ ] 2.4 Add GitHub issue templates (.github/ISSUE_TEMPLATE/)
- [ ] 2.5 Add GitHub PR template (.github/pull_request_template.md)

## 3. Documentation Translation

- [x] 3.1 Review all markdown files for Chinese content - None found
- [x] 3.2 Translate docs/ directory to English - Already in English
- [x] 3.3 Translate openspec/ directory to English - Already in English
- [x] 3.4 Translate README.md sections - Already in English
- [x] 3.5 Update all documentation links and references - Already correct

## 4. Code Comment Translation

- [x] 4.1 Scan codebase for Chinese comments - None found
- [x] 4.2 Translate comments in src/ and api/ directories - Already in English
- [x] 4.3 Translate comments in lib/ and components/ directories - Already in English
- [x] 4.4 Update JSDoc/TSDoc comments to English - Already in English

## 5. Git History Cleanup

- [x] 5.1 Create backup branch - Done in previous task
- [x] 5.2 Identify all commits with format issues - Done
- [x] 5.3 Fix commit message formatting - Done via git-filter-repo
- [x] 5.4 Verify rewritten history - Done
- [x] 5.5 Test that project still builds and runs - Verified

## 6. Commit Message Enforcement

- [ ] 6.1 Add commitlint configuration for English-only commits
- [ ] 6.2 Update husky pre-commit hook to validate commit messages
- [ ] 6.3 Add commit message template (.gitmessage)
- [ ] 6.4 Document commit conventions in CONTRIBUTING.md

## 7. Project Metadata

- [ ] 7.1 Update package.json with:
  - [ ] repository field
  - [ ] bugs field
  - [ ] homepage field
  - [ ] keywords array
  - [ ] author field
- [ ] 7.2 Create CHANGELOG.md with version history
- [ ] 7.3 Add badges to README.md (license, Node.js version, etc.)
- [ ] 7.4 Add "Contributing" section to README.md

## 8. Validation

- [ ] 8.1 Run full documentation review
- [ ] 8.2 Verify all links work
- [ ] 8.3 Test contribution workflow end-to-end
- [ ] 8.4 Review with native English speaker (if available)
- [ ] 8.5 Validate with `openspec validate --strict`
