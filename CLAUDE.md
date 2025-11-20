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
├── config/
│   └── GameConfig.js   # Centralized game parameters
├── managers/        # Game subsystem managers
│   ├── AudioManager.js   # Background music and sound effects
│   ├── ScoreManager.js   # Score and high score tracking
│   ├── EffectsManager.js # Visual effects (blink, particles)
│   ├── InputManager.js   # Keyboard + touch input handling
│   ├── BulletManager.js  # Bullet spawning and lifecycle
│   └── UIManager.js      # HUD, menus, virtual buttons
└── scenes/
    └── GameScene.js  # Main game logic (393 lines)

public/index.html    # HTML template (auto-processed by Webpack)
docs/               # Build output (GitHub Pages source)
documentation/
├── PLAN.md          # Development roadmap
├── PROGRESS.md      # Development history
└── memos/           # Reference docs and guides (indexed by filename)

webpack.config.js   # Build configuration
package.json        # Dependencies
```

## Documentation Standards & Maintenance

### File Organization

**All new markdown files** → `documentation/memos/` by default
- Guides, references, technical docs, memos
- Exception: Only root/documentation level if user explicitly requests or it's a high-level overview

### Content Quality Standards

Technical documentation must distinguish between facts, reasoning, and speculation:

| Type | Mark | Example |
|------|------|---------|
| **Facts** | ✓ | "Peak Memory: 24.5 MB (measured)" |
| **Reasoning** | 🤔 **推理** | "This likely caused the performance drop because..." |
| **Assumption** | **假设** | "We assume the object is still managed by..." |
| **Estimation** | **估计** | "Estimated ~30-50 bullets (unmeasured)" |
| **Needs Verification** | State how | "需要验证：Run X test to confirm" |

### Maintenance Rules (All future sessions MUST follow)

**PLAN.md** (Future roadmap only):
- ✅ Record pending/future features
- ❌ Remove completed items immediately
- 📏 Target: 150-200 lines

**PROGRESS.md** (Architecture history):
- ✅ Record technical decisions & rationale
- ✅ Keep sessions 30-80 lines each
- ❌ No code snippets or detailed problem-solving
- 📏 Target: 300-400 lines total

**Archive** (Rolling archive pattern):
- Completed features → `archive/COMPLETED_FEATURES.md`
- Old sessions (>4) → `archive/DETAILED_PROGRESS_SESSIONS_X-Y.md`
  - Naming: `SESSIONS_1-5.md`, `SESSIONS_6-9.md`, `SESSIONS_10-...md`
  - Trigger: When PROGRESS.md approaches 400 lines
  - Action: Archive oldest 5 sessions, keep newest in PROGRESS.md

### Session Checklist

- [ ] Remove completed features from PLAN.md
- [ ] Move to `archive/COMPLETED_FEATURES.md`
- [ ] Write PROGRESS.md entry (30-80 lines, follow template)
- [ ] Archive old sessions if needed
- [ ] `npm run build` and commit

**See detailed rules & examples**: [`documentation/memos/DOCUMENTATION_MAINTENANCE.md`](documentation/memos/DOCUMENTATION_MAINTENANCE.md)

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
- **PLAN.md** - Development roadmap (future only)
- **PROGRESS.md** - Architecture decisions and history
- **documentation/memos/** - Technical guides
- **documentation/archive/** - Historical details and completed features

## Git Workflow

```bash
git status           # Review changes
git diff             # See detailed changes
git add .
git commit -m "type: brief summary"
git push origin main
git log --oneline -10  # View recent commits
```

### Commit Message Style

Keep commits **concise and focused** (details go in docs, not commit messages):

**Format**:
```
<type>: <summary> (≤50 chars)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Guidelines**:
- Use imperative mood: "add" not "added"
- Be specific but brief: `feat: Add difficulty scaling` not `Update game`
- Only add body if critical detail essential
- Types: feat, fix, docs, refactor, test, perf

**Examples**:
- ✅ `feat: Add difficulty scaling system`
- ✅ `fix: Correct player collision bounds`
- ✅ `docs: Update deployment guide`
- ❌ `Update` (too vague)
- ❌ Long multi-line descriptions (put in docs instead)

### Version Control Approval Process

**IMPORTANT**: Different types of changes require different approval workflows:

#### ✅ Auto-commit (No approval needed)
**Documentation changes** - Can directly `git commit + push`:
- Files in `documentation/` (PLAN.md, PROGRESS.md, memos/*)
- README.md updates
- Configuration files (.gitignore, .claude/*)
- Any purely documentation changes

#### ⏸️ Require User Approval
**Engineering changes** - Must ask user before commit:
- Files in `src/` (*.js source code)
- `webpack.config.js` (build configuration)
- `package.json` (dependencies)
- `public/` (if affects game functionality)
- `docs/main.js` (production build output)

**Approval workflow**:
1. Complete code changes and testing
2. Show commit message and changed files to user
3. Ask: "是否确认提交并推送到 GitHub？"
4. Wait for user confirmation
5. Execute `git commit + push` only after approval

**Example approval prompt**:
```
准备提交以下变更：

Commit message: "feat: Add sound effects system"

Changed files:
- src/managers/AudioManager.js
- src/scenes/GameScene.js
- docs/main.js

是否确认提交并推送到 GitHub？
```

## Next Steps

Refer to `PLAN.md` for development roadmap. High-priority items:
- Difficulty scaling system
- Wave/level system
- Advanced AI (target-based shooting)
- High score persistence (localStorage)

---

*Last updated: 2025-11-15*
