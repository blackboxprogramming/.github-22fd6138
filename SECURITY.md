# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| main    | :white_check_mark: |

## Scope

The following are **in scope** for security reports:

- All repositories under the `blackboxprogramming` GitHub organization
- GitHub Actions workflows and CI/CD pipeline configurations
- Deployment infrastructure (Cloudflare Pages, Railway)
- Dependency supply-chain vulnerabilities
- Secret or credential exposure in code or logs

The following are **out of scope**:

- Third-party services not operated by BlackRoad OS (e.g., GitHub, Cloudflare platform bugs)
- Social engineering attacks against team members
- Denial-of-service attacks against production endpoints
- Issues already reported and under active remediation

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please DO NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@blackroad.io**

You may also use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) if enabled on the repository.

In your report, please include:

- Description of the vulnerability
- Affected component(s) and version(s)
- Steps to reproduce the issue
- Proof-of-concept code or screenshots (if applicable)
- Potential impact and attack scenario
- Any suggested fixes (optional)

### Severity Classification

We use the following severity levels based on [CVSS v3.1](https://www.first.org/cvss/):

| Severity | CVSS Score | Response Target |
| -------- | ---------- | --------------- |
| Critical | 9.0 - 10.0 | 24 hours |
| High     | 7.0 - 8.9  | 48 hours |
| Medium   | 4.0 - 6.9  | 5 business days |
| Low      | 0.1 - 3.9  | 10 business days |

### What to Expect

- **Acknowledgment**: We will acknowledge your report within 48 hours
- **Triage**: We will assess severity and assign a priority within 72 hours
- **Updates**: We will provide status updates at least every 5 business days
- **Resolution**: We will work on a fix and coordinate disclosure timing with you
- **Disclosure**: We follow a 90-day coordinated disclosure timeline
- **Credit**: With your permission, we will credit you in our security advisories

## Security Features

This repository and organization are protected with:

- :white_check_mark: **Dependabot** - Automated vulnerability scanning and dependency updates (npm, pip, GitHub Actions)
- :white_check_mark: **Secret scanning** - Detection of accidentally committed credentials and tokens
- :white_check_mark: **CodeQL analysis** - Static analysis for JavaScript, TypeScript, and Python
- :white_check_mark: **Dependency review** - Blocks PRs that introduce known-vulnerable dependencies
- :white_check_mark: **OpenSSF Scorecard** - Supply-chain security posture monitoring
- :white_check_mark: **SBOM generation** - Software Bill of Materials for dependency transparency
- :white_check_mark: **Automated health monitoring** - Self-healing deployment checks every 30 minutes
- :white_check_mark: **Pinned dependencies** - GitHub Actions pinned to commit SHAs to prevent supply-chain attacks

## Security Best Practices

When contributing to this project:

- Never commit secrets, API keys, tokens, or credentials
- Keep all dependencies up to date and review Dependabot alerts promptly
- Pin GitHub Actions to full commit SHAs (not tags)
- Use least-privilege permissions in all workflow definitions
- Never interpolate secrets directly in `run:` shell blocks — use environment variables instead
- Validate and sanitize all external inputs in workflows
- Review third-party actions before adoption
- Follow the principle of least privilege for all service accounts and tokens

## Supply-Chain Security

We follow supply-chain hardening practices aligned with [SLSA](https://slsa.dev/) and [OpenSSF](https://openssf.org/):

- GitHub Actions are pinned by commit SHA, not mutable tags
- Dependabot monitors all package ecosystems in use
- Dependency review is enforced on pull requests
- SBOM (Software Bill of Materials) is generated for audit and compliance

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we greatly appreciate responsible disclosure and will acknowledge contributors who help improve our security posture.

---

**BlackRoad OS** - Building secure, scalable systems
