# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of DevDesk seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- **Do not** open a public GitHub issue for security vulnerabilities
- **Do not** disclose the vulnerability publicly until it has been addressed

### How to Report

**Email**: Send details to [yicone@gmail.com](mailto:yicone@gmail.com)

**Subject**: `[SECURITY] Brief description of the issue`

**Include**:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** of the vulnerability
4. **Suggested fix** (if you have one)
5. **Your contact information** for follow-up

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Assessment**: We will assess the vulnerability and determine its severity
3. **Updates**: We will keep you informed of our progress
4. **Resolution**: We will work on a fix and coordinate disclosure timing with you
5. **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 30 days
  - Medium: Within 90 days
  - Low: Next regular release

## Security Best Practices

### For Users

- **Keep Updated**: Always use the latest version of DevDesk
- **Environment Variables**: Never commit `.env` files or expose sensitive configuration
- **Database**: Ensure your SQLite database file has appropriate permissions
- **Network**: Run DevDesk on localhost only unless you understand the security implications

### For Contributors

- **Dependencies**: Keep dependencies up-to-date
- **Code Review**: All code changes require review before merging
- **Input Validation**: Always validate and sanitize user input
- **Authentication**: Use secure authentication mechanisms
- **Secrets**: Never hardcode secrets or API keys
- **Error Messages**: Avoid exposing sensitive information in error messages

## Known Security Considerations

### Local-First Architecture

DevDesk is designed as a local-first application:

- **Data Storage**: All data is stored locally in SQLite
- **No Cloud**: No data is sent to external servers by default
- **Git Access**: The application reads local git repositories
- **File System**: The application scans configured directories

### AI Agent Integration

When using AI agent features:

- **API Keys**: Store API keys securely in environment variables
- **Data Privacy**: Be aware that prompts may be sent to external AI services
- **Code Access**: The agent can read code from your repositories

## Security Updates

Security updates will be released as patch versions (e.g., 0.1.1, 0.1.2) and announced via:

- GitHub Security Advisories
- Release notes
- CHANGELOG.md

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Publish a security advisory on GitHub

We aim to disclose vulnerabilities in a coordinated manner with the reporter.

## Security Hall of Fame

We appreciate security researchers who help keep DevDesk secure. Contributors who report valid security issues will be listed here (with permission):

_No security issues reported yet._

## Contact

For security concerns, contact: [yicone@gmail.com](mailto:yicone@gmail.com)

For general questions, use [GitHub Discussions](https://github.com/yicone/indie-dev-portal/discussions).

---

Thank you for helping keep DevDesk and our users safe!
