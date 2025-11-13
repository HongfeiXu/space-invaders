# CLAUDE.md

Guidance for Claude Code when working with this Space Invaders game repository.

## Project Overview

**Space Invaders** is a 2D arcade-style game built with Phaser 3 and Webpack 5, fully deployed to GitHub Pages.

- **Live**: https://hongfeixu.github.io/space-invaders/
- **Repo**: https://github.com/HongfeiXu/space-invaders
- **Tech**: Phaser 3.90 | Webpack 5 | CommonJS | GitHub Pages
- **Status**: Fully playable, deployed to production

## Quick Start

```bash
npm install          # Install dependencies
npm start           # Dev server (http://localhost:8080, hot reload)
npm run build       # Production build → /docs (for GitHub Pages)
```

**Critical**: Always run `npm run build` before pushing (GitHub Pages serves `/docs` folder).

## Project Structure

```
src/                 # Game source (CommonJS)
├── index.js         # Phaser config, textures, PreloadScene
└── scenes/GameScene.js  # Main game logic

public/index.html    # HTML template (auto-processed by Webpack)
docs/               # Build output (GitHub Pages source)
documentation/
├── PLAN.md          # Development roadmap
├── PROGRESS.md      # Development history
└── memos/           # Reference docs and guides (indexed by filename)

webpack.config.js   # Build configuration
package.json        # Dependencies
```

## Important Rules

### File Organization

**All new markdown files** → `documentation/memos/` by default
- Guides, references, technical docs, memos
- Exception: Only root/documentation level if user explicitly requests or it's a high-level overview

### Document Content Quality Standards

Technical documentation (performance reports, analysis, design decisions) must distinguish between facts, reasoning, and speculation:

| Type | Mark | Example |
|------|------|---------|
| **Facts** | ✓ | "Peak Memory: 24.5 MB (measured)" |
| **Reasoning** | 🤔 **推理** | "This likely caused the performance drop because..." |
| **Assumption** | **假设** | "We assume the object is still managed by..." |
| **Estimation** | **估计** | "Estimated ~30-50 bullets (unmeasured)" |
| **Needs Verification** | State how | "需要验证：Run X test to confirm" |

**Why**: Helps future readers assess confidence levels, prevents misinterpreting hypotheses as conclusions, and guides future investigations.

## Development Guide

### Architecture
- **Two-scene design**: PreloadScene (texture generation) → GameScene (gameplay)
- **Physics**: Phaser Arcade Physics groups for collisions
- **State**: Instance variables (score, lives, gameOver, isPaused, etc.)
- **Module system**: CommonJS (require/module.exports)

### Configuration
All game parameters (speeds, cooldowns, spawn layout, effects) centralized in `src/config/GameConfig.js`.
Modify values there to adjust gameplay without touching game logic.

### Key Files
| File | Purpose |
|------|---------|
| `src/scenes/GameScene.js` | Main game logic (shooting, collisions, scoring) |
| `src/config/GameConfig.js` | All game parameters |
| `webpack.config.js` | Build configuration + HtmlWebpackPlugin |

## Development Workflow

```bash
# 1. Make changes to src/
# 2. Test locally: npm start (auto hot-reload)
# 3. Build for production: npm run build
# 4. Commit and push: git add . && git commit -m "..." && git push origin main
# GitHub Pages auto-deploys (~1-2 min)
```

**Debugging**:
- DevTools Console: Check for errors
- DevTools Performance: Monitor FPS, memory, GC events
- Set `debug: true` in `src/index.js` for physics visualization

## Key Documentation

- **README.md** - Game overview for players
- **PLAN.md** - Development roadmap and next steps
- **PROGRESS.md** - Development history and architecture decisions
- **documentation/memos/** - Detailed guides and reference docs (indexed by filename)

## Current Performance

- **FPS**: 60+ stable (8.3-16.6ms per frame)
- **Memory**: ~24.5 MB peak (measured in incognito mode)
- **Enemies**: 15 (can support 50+)
- **Bundle size**: 1.14 MB minified (includes Phaser)

## Git Workflow

```bash
git status           # Review changes
git diff             # See detailed changes
git add .
git commit -m "Clear, descriptive message"
git push origin main
git log --oneline -10  # View recent commits
```

Keep commits concise and focused. This project has a clean history—maintain it.

## Next Steps

Refer to `PLAN.md` for development roadmap. High-priority items:
- Difficulty scaling system
- Wave/level system
- Advanced AI (target-based shooting)
- High score persistence (localStorage)

---

*Last updated: 2025-11-13*
