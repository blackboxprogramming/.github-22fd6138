# .github

[![Deploy](https://img.shields.io/github/actions/workflow/status/blackboxprogramming/.github/deploy.yml?branch=main&label=deploy)](https://github.com/blackboxprogramming/.github/actions/workflows/deploy.yml) [![Security](https://img.shields.io/github/actions/workflow/status/blackboxprogramming/.github/security-scan.yml?branch=main&label=security)](https://github.com/blackboxprogramming/.github/actions/workflows/security-scan.yml) [![Health](https://img.shields.io/github/actions/workflow/status/blackboxprogramming/.github/self-healing.yml?label=health)](https://github.com/blackboxprogramming/.github/actions/workflows/self-healing.yml) [![Brand Compliant](https://img.shields.io/badge/Brand-Compliant-success)](https://brand.blackroad.io)

Organization-wide configuration, workflows, and profile for **blackboxprogramming** (BlackRoad OS).

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [deploy.yml](.github/workflows/deploy.yml) | Push to `main`, PRs | Deploy static site to Cloudflare Pages with brand compliance check |
| [auto-deploy.yml](.github/workflows/auto-deploy.yml) | Push to `main`, manual | Auto-detect service type and deploy to Cloudflare Pages or Railway |
| [cloudflare-worker.yml](.github/workflows/cloudflare-worker.yml) | Push to `main` (worker paths), manual | Deploy Cloudflare Workers for long-running tasks |
| [security-scan.yml](.github/workflows/security-scan.yml) | Push, PRs, weekly, manual | CodeQL analysis and dependency vulnerability scanning |
| [self-healing.yml](.github/workflows/self-healing.yml) | Every 6 hours, post-deploy, manual | Health monitoring with auto-rollback and issue creation |
| [automerge.yml](.github/workflows/automerge.yml) | Dependabot PRs | Auto-approve and merge patch/minor dependency updates |
| [label-sync.yml](.github/workflows/label-sync.yml) | Push to `main`, manual | Ensure consistent issue/PR labels across the repository |

All actions are **pinned to commit hashes** for supply-chain security.

## Project Structure

```
.github/
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml              # Cloudflare Pages deployment
│   │   ├── auto-deploy.yml         # Multi-target auto deploy
│   │   ├── cloudflare-worker.yml   # Cloudflare Worker deployment
│   │   ├── security-scan.yml       # CodeQL + dependency scanning
│   │   ├── self-healing.yml        # Health monitoring + auto-rollback
│   │   ├── automerge.yml           # Dependabot automerge
│   │   └── label-sync.yml          # Repository label management
│   ├── dependabot.yml              # Dependency update config
│   └── FUNDING.yml                 # Sponsorship config
├── profile/
│   └── README.md                   # Organization profile page
├── README.md                       # This file
├── CONTRIBUTING.md                 # Contribution guidelines
├── SECURITY.md                     # Security policy
└── LICENSE                         # BlackRoad OS Proprietary License
```

## Quick Start

```bash
git clone https://github.com/blackboxprogramming/.github.git
cd .github
```

No build process required — this is a static organization profile repository.

## Deployment

### Cloudflare Pages (Static)

Auto-deploys on push to `main` with brand compliance enforcement and PR preview URLs.

### Cloudflare Workers (Long-Running Tasks)

For background processing, scheduled tasks, and API endpoints:

1. Place worker code in `worker/` or `workers/` directory
2. Configure via `wrangler.toml`
3. Auto-deploys on push to `main` when worker files change
4. Manual dispatch for staging/production environments

### Railway (Applications)

For Docker, Node.js, or Python applications — auto-detected and deployed via Railway CLI.

## Brand Compliance

All contributions must follow the [BlackRoad Brand System](https://brand.blackroad.io):

- **Colors:** Amber (#F5A623), Hot Pink (#FF1D6C), Electric Blue (#2979FF), Violet (#9C27B0)
- **Spacing:** Golden Ratio (phi = 1.618): 8px, 13px, 21px, 34px, 55px, 89px, 144px
- **Typography:** SF Pro Display, line-height: 1.618
- **Gradients:** 135 degrees with stops at 38.2% and 61.8%
- **Forbidden Colors:** #FF9D00, #FF6B00, #FF0066, #FF006B, #D600AA, #7700FF, #0066FF

## Security

- Dependabot vulnerability scanning (weekly, auto-merge for patch/minor)
- CodeQL static analysis (JavaScript/TypeScript, Python)
- Secret scanning enabled
- Health monitoring with auto-rollback every 6 hours
- See [SECURITY.md](SECURITY.md) for vulnerability reporting

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Technology Stack

- **Hosting:** Cloudflare Pages + Cloudflare Workers
- **Applications:** Railway
- **CI/CD:** GitHub Actions (all actions pinned to commit hashes)
- **Security:** CodeQL, Dependabot, npm audit
- **Monitoring:** Self-healing workflow with auto-rollback

## Part of BlackRoad OS

This repository is part of the [BlackRoad OS](https://blackroad.io) ecosystem.

- [blackboxprogramming.github.io](https://blackboxprogramming.github.io) — Website
- [docs.blackroad.io](https://docs.blackroad.io) — Documentation
- [status.blackroad.io](https://status.blackroad.io) — System Status
- [agents.blackroad.io](https://agents.blackroad.io) — AI Agents

## Support

- **Documentation:** https://docs.blackroad.io
- **Issues:** https://github.com/blackboxprogramming/.github/issues
- **Email:** blackroad.systems@gmail.com

---

**Copyright 2026 BlackRoad OS, Inc. All Rights Reserved.**

**CEO:** Alexa Amundson

This software is the proprietary property of BlackRoad OS, Inc. See [LICENSE](LICENSE) for complete terms.

For commercial licensing inquiries: blackroad.systems@gmail.com
