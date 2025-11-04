# Project Governance Specification

## ADDED Requirements

### Requirement: Open Source Licensing

The project SHALL use AGPL-3.0 license to ensure all derivatives remain open source.

#### Scenario: License file present

- **WHEN** user views project root
- **THEN** LICENSE file with AGPL-3.0 text is present

#### Scenario: Package metadata includes license

- **WHEN** user checks package.json
- **THEN** license field is set to "AGPL-3.0"

#### Scenario: Third-party licenses documented

- **WHEN** user views NOTICE file
- **THEN** all third-party dependencies and their licenses are listed

### Requirement: Contribution Guidelines

The project SHALL provide clear contribution guidelines for external contributors.

#### Scenario: CONTRIBUTING.md exists

- **WHEN** user wants to contribute
- **THEN** CONTRIBUTING.md file provides setup instructions, code style, commit format, and PR process

#### Scenario: Development environment setup documented

- **WHEN** contributor follows CONTRIBUTING.md
- **THEN** they can successfully set up local development environment

#### Scenario: Commit message format enforced

- **WHEN** contributor attempts to commit
- **THEN** commitlint validates message follows Conventional Commits format

### Requirement: Code of Conduct

The project SHALL establish community standards through a code of conduct.

#### Scenario: CODE_OF_CONDUCT.md exists

- **WHEN** user views project root
- **THEN** CODE_OF_CONDUCT.md file with Contributor Covenant v2.1 is present

#### Scenario: Reporting process documented

- **WHEN** user experiences code of conduct violation
- **THEN** CODE_OF_CONDUCT.md provides clear reporting process

### Requirement: Security Policy

The project SHALL provide a security vulnerability reporting process.

#### Scenario: SECURITY.md exists

- **WHEN** user discovers security vulnerability
- **THEN** SECURITY.md file provides reporting instructions

#### Scenario: Supported versions documented

- **WHEN** user checks security policy
- **THEN** SECURITY.md lists which versions receive security updates

### Requirement: Issue and PR Templates

The project SHALL provide templates for bug reports, feature requests, and pull requests.

#### Scenario: Bug report template

- **WHEN** user creates new issue
- **THEN** GitHub provides bug report template with required fields

#### Scenario: Feature request template

- **WHEN** user creates new issue
- **THEN** GitHub provides feature request template with required fields

#### Scenario: Pull request template

- **WHEN** user creates pull request
- **THEN** GitHub provides PR template with checklist

### Requirement: Project Metadata

The project SHALL provide comprehensive metadata for discoverability and documentation.

#### Scenario: Package.json metadata complete

- **WHEN** user checks package.json
- **THEN** repository, bugs, homepage, keywords, and author fields are populated

#### Scenario: README badges present

- **WHEN** user views README.md
- **THEN** badges for license, Node.js version, and other key metrics are displayed

#### Scenario: Contributing section in README

- **WHEN** user views README.md
- **THEN** Contributing section links to CONTRIBUTING.md

### Requirement: Project Branding

The project SHALL use consistent branding across all documentation and code.

#### Scenario: Project name is DevDesk

- **WHEN** user views any documentation
- **THEN** project is referred to as "DevDesk"

#### Scenario: Tagline is consistent

- **WHEN** user views README.md or package.json
- **THEN** description is "A local-first multi-repo workspace for developers."

### Requirement: Commit Message Enforcement

The project SHALL enforce English-only, properly formatted commit messages.

#### Scenario: Commitlint configuration present

- **WHEN** project is cloned
- **THEN** .commitlintrc.json configures Conventional Commits validation

#### Scenario: Git hook validates commits

- **WHEN** developer attempts to commit
- **THEN** husky commit-msg hook validates message format

#### Scenario: Commit template provided

- **WHEN** developer runs git commit
- **THEN** .gitmessage template guides proper format

### Requirement: Version History

The project SHALL maintain a changelog documenting all notable changes.

#### Scenario: CHANGELOG.md exists

- **WHEN** user wants to see version history
- **THEN** CHANGELOG.md lists all releases with changes

#### Scenario: Changelog follows Keep a Changelog format

- **WHEN** user reads CHANGELOG.md
- **THEN** entries are organized by version with Added, Changed, Fixed, etc. sections
