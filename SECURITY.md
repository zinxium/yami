# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Yami, please report it by emailing security@yami.dev instead of using the issue tracker. This allows us to address the vulnerability responsibly before public disclosure.

When reporting, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if available)

We will acknowledge your report within 48 hours and aim to provide a fix within a reasonable timeframe.

## Security Best Practices

### For Users

- Keep your Yami installation and dependencies updated
- Use strong, unique passwords
- Enable two-factor authentication where available
- Report any suspicious activity immediately

### For Developers

- Never commit sensitive information (API keys, passwords, tokens)
- Use environment variables for configuration
- Keep dependencies updated
- Run security audits regularly: `npm audit`
- Follow OWASP security guidelines
- Validate and sanitize user input
- Use parameterized queries for database operations

## Supported Versions

| Version | Status | Support Until |
|---------|--------|--------------|
| 1.x     | Current | Active |
| 0.x     | Legacy | End of Life |

Only the latest version receives security updates. Users are encouraged to upgrade to the latest version.

## Security Features

- Input validation and sanitization
- Secure authentication and authorization
- Encryption of sensitive data
- Regular security audits
- Dependency scanning and updates

## Contact

For security inquiries, contact: security@yami.dev
