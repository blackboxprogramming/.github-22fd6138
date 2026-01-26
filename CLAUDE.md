# CLAUDE.md - AI Assistant Guidelines

This file provides guidance for AI assistants working with this repository.

## Repository Overview

This is the **GitHub Organization Profile** repository for `blackboxprogramming`, the origin organization for the **BlackRoad Ecosystem**. It contains the organization-level profile and configuration files that appear on the organization's GitHub page.

**Owner:** BlackRoad OS, Inc.
**CEO:** Alexa Amundson
**License:** Proprietary (testing/evaluation only - NOT for commercial use)

## Project Structure

```
.github/
├── CLAUDE.md           # This file - AI assistant guidelines
├── README.md           # Repository documentation
├── CONTRIBUTING.md     # Contribution guidelines
├── LICENSE             # Proprietary license (BlackRoad OS, Inc.)
├── profile/
│   └── README.md       # Organization profile (displays on GitHub org page)
└── .github/
    └── workflows/
        └── deploy.yml  # CI/CD for Cloudflare Pages deployment
```

## Key Files

| File | Purpose |
|------|---------|
| `profile/README.md` | The organization profile displayed on GitHub |
| `README.md` | Project documentation and setup instructions |
| `CONTRIBUTING.md` | Contribution guidelines with brand compliance rules |
| `.github/workflows/deploy.yml` | GitHub Actions workflow for Cloudflare Pages |

## Development Workflow

### Local Development
1. Clone the repository
2. Open files in a text editor (VS Code recommended)
3. No build process required - static HTML/CSS

### Deployment
- **Platform:** Cloudflare Pages
- **Trigger:** Automatic on push to `main` branch
- **Preview:** All branches get preview deployments

### CI/CD Pipeline
The workflow performs:
1. Checkout code
2. Brand compliance check (color validation)
3. Deploy to Cloudflare Pages
4. Add deployment comment on PRs

## Brand Compliance (CRITICAL)

All changes MUST follow the BlackRoad Brand System. The CI pipeline enforces this.

### Required Colors
```css
--amber: #F5A623
--hot-pink: #FF1D6C       /* Primary Brand Color */
--electric-blue: #2979FF
--violet: #9C27B0
--black: #000000
--white: #FFFFFF
```

### Forbidden Colors (DO NOT USE)
```
#FF9D00, #FF6B00, #FF0066, #FF006B, #D600AA, #7700FF, #0066FF
```

### Spacing System (Golden Ratio)
```css
--space-xs: 8px      /* Base */
--space-sm: 13px     /* 8 x 1.618 */
--space-md: 21px     /* 13 x 1.618 */
--space-lg: 34px     /* 21 x 1.618 */
--space-xl: 55px     /* 34 x 1.618 */
--space-2xl: 89px    /* 55 x 1.618 */
--space-3xl: 144px   /* 89 x 1.618 */
```

### Typography
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
line-height: 1.618; /* Golden Ratio */
```

### Gradients
```css
background: linear-gradient(135deg,
  var(--amber) 0%,
  var(--hot-pink) 38.2%,    /* Golden Ratio */
  var(--violet) 61.8%,      /* Golden Ratio */
  var(--electric-blue) 100%);
```

## Commit Message Convention

Use conventional commits with emoji prefixes:

```
✨ feat: Add new feature
🐛 fix: Fix bug in component
📝 docs: Update documentation
🎨 style: Improve styling
♻️ refactor: Refactor code
✅ test: Add tests
🔧 chore: Update config
🌌 enhancement: Proprietary enhancement
🔒 security: Security update
```

## Important Notes for AI Assistants

### This Is Production Infrastructure
- This repository is part of a REAL production ecosystem
- The BlackRoad Ecosystem spans 15 organizations with 113+ repositories
- Changes affect the actual organization profile on GitHub

### License Restrictions
- **Proprietary** - NOT open source
- Testing and evaluation purposes ONLY
- No commercial use without written permission
- All IP belongs to BlackRoad OS, Inc.

### Related Ecosystem
| Organization | Focus |
|--------------|-------|
| [BlackRoad-OS](https://github.com/BlackRoad-OS) | Core Operating System |
| [BlackRoad-AI](https://github.com/BlackRoad-AI) | Artificial Intelligence |
| [BlackRoad-Cloud](https://github.com/BlackRoad-Cloud) | Cloud Infrastructure |
| [BlackRoad-Security](https://github.com/BlackRoad-Security) | Security & Compliance |
| [BlackRoad-Labs](https://github.com/BlackRoad-Labs) | Research & Development |

### Contact
- **Email:** blackroad.systems@gmail.com
- **Documentation:** https://docs.blackroad.io

## Testing Checklist

Before submitting changes:
- [ ] Visual test in multiple browsers
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Brand compliance verified (colors, spacing, typography)
- [ ] No forbidden colors used
- [ ] Golden ratio spacing applied
- [ ] Line height is 1.618

## Quick Commands

```bash
# Check for brand-compliant colors
grep -r "#F5A623\|#FF1D6C\|#2979FF\|#9C27B0" .

# Check for forbidden colors (should return nothing)
grep -r "#FF9D00\|#FF6B00\|#FF0066\|#FF006B\|#D600AA\|#7700FF\|#0066FF" .

# View git history
git log --oneline -10
```
