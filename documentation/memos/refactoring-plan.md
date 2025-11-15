# 重构计划备忘

## 进度概览

- ✅ **Phase 1 完成** (2025-11-15)
- ✅ **Phase 2 完成** (2025-11-15)
  - ✅ InputManager 完成 & 测试通过
  - ✅ BulletManager 完成 & 测试通过
  - ✅ UIManager 完成 & 测试通过
  - **最终代码**: GameScene.js 12.8 KB (~380行, 已减少 ~345行)

---

## Phase 1: 已完成 ✅

### 提取的管理器 (2025-11-15)

**减少代码**: GameScene.js 879行 → ~630行 (-250行)

#### 1. AudioManager (src/managers/AudioManager.js)
```javascript
- playBackgroundMusic()
- pauseBackgroundMusic()
- resumeBackgroundMusic()
- stopBackgroundMusic()
- setVolume(volume)
```

#### 2. ScoreManager (src/managers/ScoreManager.js)
```javascript
- getScore() / getHighScore()
- addScore(points)
- resetScore()
- showNewRecordAnimation()
- localStorage 持久化
```

#### 3. EffectsManager (src/managers/EffectsManager.js)
```javascript
- blinkSprite(sprite, onComplete)
- playerHitEffect(player, onInvincibilityEnd)
- showHitText()
- showWaveAnnouncement(waveNumber)
- showTextEffect(x, y, text, options)
```

### 测试状态
- ✅ 本地测试通过
- ✅ 生产构建成功
- ✅ 已部署到 GitHub (commit: 3ce0be9)

---

## Phase 2: 明天计划 ⏳

### 目标
**再减少 ~450 行代码**, GameScene: 630 → ~180行

### 提取模块 (按难度排序)

#### 1. InputManager (中等, 2-3h)
**职责**:
- 键盘输入处理 (WASD, 方向键, Space, ESC)
- 触摸输入处理 (移动端左右屏幕)
- 移动设备检测

**迁移代码** (GameScene.js):
- Lines: 68-82 (键盘设置)
- Lines: 125-156 (触摸控制)
- Lines: 290-308 (update 中的输入处理)

**接口设计**:
```javascript
class InputManager {
    constructor(scene)

    // 键盘状态
    isLeftPressed()
    isRightPressed()
    isUpPressed()
    isDownPressed()
    isShootPressed()
    isPausePressed()

    // 触摸状态
    isTouchLeft()
    isTouchRight()

    // 设备信息
    isMobileDevice()

    shutdown()
}
```

#### 2. BulletManager (中等, 2-3h)
**职责**:
- 玩家子弹组管理
- 敌人子弹组管理
- 子弹创建和清理
- 边界外清理

**迁移代码**:
- Lines: 56-57 (子弹组创建)
- Lines: 310-321 (playerShoot)
- Lines: 348-373 (边界清理)

**接口设计**:
```javascript
class BulletManager {
    constructor(scene)

    // 子弹组
    getPlayerBullets()
    getEnemyBullets()

    // 发射
    shootPlayerBullet(x, y)
    shootEnemyBullet(x, y)

    // 清理
    cleanupOutOfBounds()

    shutdown()
}
```

#### 3. UIManager (中等, 3-4h)
**职责**:
- 所有文本显示 (分数、生命、波次、FPS)
- 按钮创建工具
- 暂停菜单
- 游戏结束界面
- 通关界面

**迁移代码**:
- Lines: 35-45, 84-88 (UI创建)
- Lines: 156-166 (暂停菜单)
- Lines: 248-280 (createButton)
- Lines: 440-473 (游戏结束)
- Lines: 571-632 (通关界面)

**接口设计**:
```javascript
class UIManager {
    constructor(scene, scoreManager)

    // 文本更新
    updateScore(score)
    updateHighScore(highScore)
    updateLives(lives)
    updateWave(current, max)
    updateFPS(fps)

    // 界面显示
    showPauseMenu(onResume, onRestart)
    hidePauseMenu()
    showGameOver(score, highScore, isNewRecord, onRestart)
    showVictory(score, lives, onContinue)
    hideVictory()

    // 按钮工具
    createButton(x, y, text, callback, options)

    shutdown()
}
```

---

## 实施步骤

### 步骤 1: InputManager (最简单，先做)
```bash
# 1. 创建文件
touch src/managers/InputManager.js

# 2. 实现接口
# 3. 在 GameScene 中集成
# 4. 测试
npm start

# 5. 构建 & 提交
npm run build
git add src/managers/InputManager.js src/scenes/GameScene.js docs/main.js
git commit -m "refactor: Extract InputManager"
```

### 步骤 2: BulletManager
```bash
# 同上流程
```

### 步骤 3: UIManager (最复杂，最后做)
```bash
# 同上流程
```

---

## 关键文件位置

```
src/
├── managers/              # ✅ 新增目录
│   ├── AudioManager.js    # ✅ Phase 1
│   ├── ScoreManager.js    # ✅ Phase 1
│   ├── EffectsManager.js  # ✅ Phase 1
│   ├── InputManager.js    # ⏳ Phase 2 - Step 1
│   ├── BulletManager.js   # ⏳ Phase 2 - Step 2
│   └── UIManager.js       # ⏳ Phase 2 - Step 3
└── scenes/
    └── GameScene.js       # 🔧 持续瘦身中

docs/                      # GitHub Pages 部署目录
└── main.js               # 生产构建输出
```

---

## 提交信息模板

```bash
# Phase 2 - Step 1
git commit -m "refactor: Extract InputManager

Phase 2 Step 1: Keyboard & touch input management

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Phase 2 - Step 2
git commit -m "refactor: Extract BulletManager

Phase 2 Step 2: Player & enemy bullet management

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Phase 2 - Step 3
git commit -m "refactor: Extract UIManager

Phase 2 Step 3: UI text & button management

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Phase 2 完成
git commit -m "refactor: Complete Phase 2 refactoring

Phase 2: Extract Input/Bullet/UI managers (-450 lines)

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 快速恢复命令

```bash
# 1. 查看当前状态
git log --oneline -5

# 2. 启动开发服务器
npm start

# 3. 查看 GameScene 当前行数
wc -l src/scenes/GameScene.js   # Linux/Mac
# 或手动检查文件

# 4. 开始重构
# 从 InputManager 开始（最简单）
```

---

## 注意事项

1. **每个模块独立测试**
   - 完成一个模块 → 测试 → 提交
   - 不要一次改太多

2. **保持功能完整性**
   - 所有游戏功能必须正常工作
   - 分数/音乐/动画/碰撞等都要测试

3. **清理注释**
   - 迁移代码后删除原注释
   - 新模块添加清晰的文档注释

4. **构建部署**
   - 每个模块提交前都要 `npm run build`
   - 确保 docs/main.js 更新

---

## Phase 2: 进行中 🔄

### 已完成 (2025-11-15)

#### 1. InputManager ✅
**文件**: `src/managers/InputManager.js` (4.74 KB)

**功能**:
- 统一键盘输入 (方向键, WASD, Space, ESC)
- 触摸输入管理 (移动端左右屏幕)
- 移动设备检测
- 暂停回调注册

**接口**:
```javascript
isLeftPressed() / isRightPressed()
isShootPressed()  // PC: Space, 移动: 自动
isMobileDevice()
onPauseRequested(callback)
```

**测试结果**: ✅ 所有输入正常，暂停/恢复正常，场景重启无泄漏

---

#### 2. BulletManager ✅
**文件**: `src/managers/BulletManager.js` (3.62 KB)

**功能**:
- 玩家/敌人子弹组管理
- 射击冷却控制 (PC: 250ms, 移动: 500ms)
- 随机敌人射击
- 边界外子弹清理

**接口**:
```javascript
getPlayerBullets() / getEnemyBullets()  // 碰撞检测用
shootPlayerBullet(x, y)
shootRandomEnemy(enemies)
cleanupOutOfBounds()
```

**测试结果**: ✅ 射击正常，碰撞检测正常，子弹清理正常，重启无报错

**Bug修复**: shutdown() 方法不需要手动 clear 物理组 (Phaser 自动清理)

---

#### 3. UIManager ✅
**文件**: `src/managers/UIManager.js` (14.4 KB)

**功能**:
- HUD 文本管理 (分数/生命/波次/FPS/最高分)
- 按钮创建工具 (createButton)
- 暂停菜单 (showPauseMenu/hidePauseMenu)
- 游戏结束界面 (showGameOver)
- 通关界面 (showVictory/hideVictory)

**接口**:
```javascript
updateScore(score) / updateHighScore(highScore)
updateLives(lives) / updateWave(current, max)
updateFPS(fps)
showPauseMenu(onResume, onRestart)
showGameOver(score, highScore, isNewRecord, onRestart)
showVictory(score, lives, onContinue)
createButton(x, y, text, callback, options)
getPauseButton()
```

**测试结果**: ✅ HUD显示正常，按钮交互正常，所有界面正常，重启无报错

---

## Phase 2: 完成 ✅

### 最终成果 (2025-11-15)

| 指标 | 数值 |
|------|------|
| GameScene.js | 725行 → 12.8 KB (~380行) (-345行) |
| 新增管理器 | 3 个 (Input, Bullet, UI) |
| 总管理器大小 | 35.7 KB |
| Git 提交 | 63d7061 |

---

## Phase 3 展望 (后续)

完成 Phase 2 后，还可以继续提取：
- PlayerManager (玩家控制)
- EnemyManager (敌人生成和行为)
- WaveManager (波次系统)
- CollisionManager (碰撞检测)
- GameStateManager (游戏状态)

**最终目标**: GameScene 瘦身到 100-150 行纯协调代码

---

*最后更新: 2025-11-15*
*Phase 2 完成: InputManager ✅ | BulletManager ✅ | UIManager ✅*
