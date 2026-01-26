# CLAUDE.md - AI Assistant Guidelines

This document provides essential context for AI assistants working with this repository.

## Repository Overview

This is the **organization profile repository** for `blackboxprogramming`, part of the BlackRoad OS ecosystem. It contains the GitHub organization profile displayed on the organization's main page.

**Owner:** BlackRoad OS, Inc.
**CEO:** Alexa Amundson
**License:** Proprietary (testing/evaluation only)

## Codebase Structure

```
.github/
├── profile/
│   └── README.md       # Organization profile (displayed on GitHub org page)
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD workflow for Cloudflare Pages
├── README.md           # Repository documentation
├── CONTRIBUTING.md     # Contribution guidelines
├── LICENSE             # Proprietary license
└── CLAUDE.md           # This file
```

### Key Files

| File | Purpose |
|------|---------|
| `profile/README.md` | Organization profile displayed on GitHub |
| `README.md` | Repository documentation and quick start |
| `CONTRIBUTING.md` | Detailed contribution guidelines |
| `.github/workflows/deploy.yml` | Cloudflare Pages deployment workflow |

## Development Workflow

### Local Development

1. Clone the repository
2. Open files in a text editor (VS Code recommended)
3. Make changes following brand guidelines
4. Test by opening HTML files in browser
5. Commit with conventional commit messages
6. Push and create PR

### CI/CD Pipeline

- **Trigger:** Push to `main` branch or pull request
- **Platform:** GitHub Actions
- **Deployment:** Cloudflare Pages
- **Checks:** Brand compliance validation (forbidden colors)

### Branch Strategy

- `main` - Production branch, auto-deploys to Cloudflare Pages
- Feature branches: `feature/feature-name`
- Bugfix branches: `fix/bug-description`

## Brand Compliance (Critical)

All changes MUST follow the [BlackRoad Brand System](https://brand.blackroad.io).

### Required Colors

```css
--amber: #F5A623
--hot-pink: #FF1D6C      /* Primary Brand Color */
--electric-blue: #2979FF
--violet: #9C27B0
--black: #000000
--white: #FFFFFF
```

### Forbidden Colors (DO NOT USE)

These colors will fail the CI pipeline:
- `#FF9D00`, `#FF6B00`, `#FF0066`, `#FF006B`, `#D600AA`, `#7700FF`, `#0066FF`

### Spacing System (Golden Ratio)

```css
--space-xs: 8px      /* Base */
--space-sm: 13px     /* 8 × φ */
--space-md: 21px     /* 13 × φ */
--space-lg: 34px     /* 21 × φ */
--space-xl: 55px     /* 34 × φ */
--space-2xl: 89px    /* 55 × φ */
--space-3xl: 144px   /* 89 × φ */
```

### Typography

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
line-height: 1.618; /* Golden Ratio */
```

### Gradient Standard

```css
background: linear-gradient(135deg,
  var(--amber) 0%,
  var(--hot-pink) 38.2%,    /* Golden Ratio */
  var(--violet) 61.8%,      /* Golden Ratio */
  var(--electric-blue) 100%);
```

## Commit Message Convention

Use emoji-prefixed conventional commits:

```
✨ feat: Add new feature
🐛 fix: Fix bug in component
📝 docs: Update documentation
🎨 style: Improve styling
♻️ refactor: Refactor code
✅ test: Add tests
🔧 chore: Update config
```

## AI Assistant Guidelines

### Context Awareness

1. **This is REAL production infrastructure** - Not a test or demo
2. **Part of 15-organization ecosystem** - Changes may affect other projects
3. **Proprietary license** - For testing/evaluation only, not commercial use

### When Making Changes

1. Always verify brand compliance before committing
2. Test color values against approved palette
3. Preserve existing functionality
4. Update documentation if behavior changes
5. Follow the commit message convention

### Common Tasks

**Update organization profile:**
- Edit `profile/README.md`
- Ensure markdown renders correctly on GitHub

**Modify repository documentation:**
- Edit `README.md` for repo docs
- Edit `CONTRIBUTING.md` for contribution guidelines

**Update CI/CD:**
- Edit `.github/workflows/deploy.yml`
- Test workflow changes in a PR first

### Brand Compliance Check Command

Run before committing to verify no forbidden colors:

```bash
# Check for forbidden colors (should return nothing)
grep -r "#FF9D00\|#FF6B00\|#FF0066\|#FF006B\|#D600AA\|#7700FF\|#0066FF" . --include="*.html" --include="*.css" --include="*.md"

# Verify official colors are present
grep -r "#F5A623\|#FF1D6C\|#2979FF\|#9C27B0" . --include="*.html" --include="*.css"
```

## Related Resources

### BlackRoad Ecosystem

- **Main Hub:** [BlackRoad-OS](https://github.com/BlackRoad-OS)
- **Documentation:** [blackroad-os-docs](https://github.com/BlackRoad-OS/blackroad-os-docs)
- **Brand System:** [brand.blackroad.io](https://brand.blackroad.io)
- **Infrastructure:** [blackroad-os-infra](https://github.com/BlackRoad-OS/blackroad-os-infra)

### Contact

- **Email:** blackroad.systems@gmail.com
- **Issues:** https://github.com/blackboxprogramming/.github/issues

## Testing Checklist

Before submitting changes:

- [ ] Brand colors verified (no forbidden colors)
- [ ] Golden ratio spacing applied where applicable
- [ ] Line height is 1.618 for text
- [ ] Conventional commit message used
- [ ] Documentation updated if needed
- [ ] Visual test in multiple browsers (for HTML/CSS changes)
- [ ] Responsive design verified (for UI changes)

---

**Last Updated:** 2026-01-26
**Maintained by:** BlackRoad OS Team
