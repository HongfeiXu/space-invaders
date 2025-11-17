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

## Documentation Maintenance Rules

**IMPORTANT**: All future development sessions MUST follow these rules to keep documentation clean and maintainable.

### PLAN.md - Future Roadmap Only
**Purpose**: Forward-looking development roadmap, NOT a history document

**Maintenance Rules**:
- ✅ Record only **pending/future features** (what needs to be done next)
- ❌ Remove completed items immediately after completion
- ❌ Never keep ✅ completed items in this file
- 📏 Target length: 150-200 lines (pure roadmap)

**Session Checklist**:
- [ ] After completing a feature, REMOVE it from PLAN.md
- [ ] Move completed items to `documentation/archive/COMPLETED_FEATURES.md`
- [ ] Add next planned features to PLAN.md
- [ ] Keep only the next 2-3 priority levels visible

**Bad Practice ❌**:
```markdown
## Priority 2 ✅ Completed (Session 3)
- ✅ Wave system implemented
- ✅ Background music added
```

**Good Practice ✅**:
```markdown
## Priority 2: Audio & Effects
- ❌ SFX sound system (next)
- ❌ Particle effects
```

---

### PROGRESS.md - High-Level History Only
**Purpose**: Concise development history focused on "why" not "what"

**Maintenance Rules**:
- ✅ Record **architecture decisions** and **technical rationale**
- ✅ Keep sessions **30-80 lines each** (brief, focused)
- ❌ No code snippets (they become outdated, git history has them)
- ❌ No step-by-step problem-solving details (unless architecturally significant)
- ❌ No tables with incremental changes
- 📏 Target length: 300-400 lines for all sessions

**Session Template**:
```markdown
## Session N - Feature Name (Date)
**Impact**: [High/Medium/Low]
**Outcome**: 1-2 sentence summary

### Key Achievements
- Achievement 1
- Achievement 2

### Technical Decisions
- Decision 1: Rationale
- Decision 2: Rationale

### Key Insights
- Insight 1
```

**After Each Session**:
1. Write brief PROGRESS.md entry (template above)
2. Move old sessions to `documentation/archive/DETAILED_PROGRESS_SESSIONS_*.md`
3. Keep only last 3-4 sessions in main PROGRESS.md

---

### Archive Policy
**When to Archive**:
- PLAN.md: Completed items → immediately move to `archive/COMPLETED_FEATURES.md`
- PROGRESS.md: Sessions older than 4 sessions → move to `archive/DETAILED_PROGRESS_*.md`

**Archive Location**:
```
documentation/archive/
├── COMPLETED_FEATURES.md      # All finished work
├── DETAILED_PROGRESS_SESSIONS_1-5.md  # Full session details
└── other_historical_docs.md
```

---

### Reference: Current Documentation

| File | Purpose | Audience | Length |
|------|---------|----------|--------|
| `PLAN.md` | Future roadmap | Developers | ~150-200 lines |
| `PROGRESS.md` | Architecture history | Team | ~300-400 lines |
| `README.md` | Game overview | Players | ~100 lines |
| `documentation/memos/*` | Technical guides | Developers | Variable |
| `documentation/archive/*` | Historical details | Reference | Variable |

---

## Key Documentation

- **README.md** - Game overview for players
- **PLAN.md** - Development roadmap (future only, no completed items)
- **PROGRESS.md** - Architecture decisions and technical history
- **documentation/memos/** - Detailed guides and reference docs
- **documentation/archive/** - Historical details and completed features

## Current Performance

- **FPS**: 60+ stable (8.3-16.6ms per frame, desktop + mobile)
- **Memory**: ~24.5 MB peak (measured in incognito mode)
- **Code**: ~393 lines (GameScene.js, post-mobile implementation)
- **Managers**: 6 (Audio, Score, Effects, Input, Bullet, UI)
- **Enemies**: 15 (can support 50+)
- **Bundle size**: 1.14 MB minified (includes Phaser)
- **Controls**: Full multi-platform support (virtual buttons on all devices + tap-to-target on mobile)

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
