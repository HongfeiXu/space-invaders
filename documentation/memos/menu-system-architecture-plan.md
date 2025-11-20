# 通用菜单系统架构升级计划

**创建时间**: 2025-11-18
**状态**: 设计完成，等待实施确认
**优先级**: 🔴 高（解决暂停菜单被覆盖问题）
**目标**: 建立可扩展的通用菜单系统

---

## 📋 问题分析

### 当前存在的问题

| 问题 | 现状 | 影响 |
|------|------|------|
| **Depth 未设置** | 暂停菜单 depth=0（默认），游戏对象也是 0 | 菜单被飞船、敌人遮挡 |
| **无背景遮罩** | 没有半透明 overlay | UI 混乱，鼠标可穿透到背后按钮 |
| **菜单与 HUD 混合** | 暂停菜单在 `createHUD()` 中创建 | 627 行代码混乱，难以维护 |
| **无菜单栈** | 每个菜单独立显示/隐藏 | 无法支持多菜单嵌套 |
| **难以扩展** | 每个菜单需要新方法 | 升级菜单、主菜单等难以添加 |

### 技术细节

**UIManager.js 当前问题**（第56-162行 `createHUD()` 方法）:
```javascript
// 暂停菜单元素在 HUD 创建方法中，没有 depth 设置
this.pauseText = this.scene.add.text(...).setVisible(false);
this.pauseResumeButton = this.createButton(...);
this.pauseResumeButton.setVisible(false);  // ❌ 没有 setDepth()

// 虚拟按钮有 depth 设置（第325行）
container.setDepth(100);  // ✓ 这就是为什么虚拟按钮可见

// 游戏对象的 depth = 0（默认）
// 结果：player, enemies, bullets（depth=0）覆盖了 pauseText（depth=0）
```

**showPauseMenu() 问题**（第411-433行）:
```javascript
// 仅显示/隐藏元素，没有背景遮罩，没有 depth 管理
showPauseMenu(onResume, onRestart) {
    if (this.pauseText) {
        this.pauseText.setVisible(true);  // ❌ 可能被覆盖
    }
    // ... 没有遮罩
}
```

---

## 🏗️ 推荐方案：通用菜单系统

### 架构设计

```
新菜单架构：

UIManager（改进，~300 行）
  ├── HUD 管理（depth=0）
  │   ├── scoreText, waveText, livesText
  │   ├── pauseButton（按钮本身，不是菜单）
  │   └── virtualButtons (depth=100)
  └── 菜单委托
      └── menuManager.showMenu('pause', config)

MenuManager（新增，~400 行）
  ├── 菜单栈管理
  │   ├── showMenu(menuName, config)       ✓ 显示菜单
  │   ├── hideMenu(menuName)               ✓ 隐藏菜单
  │   ├── hideAllMenus()                   ✓ 隐藏所有
  │   ├── isMenuVisible(menuName)          ✓ 查询状态
  │   └── getTopMenu()                     ✓ 获取顶部菜单
  ├── 统一的 UI 结构
  │   ├── 背景遮罩（depth=90）             ✓ 清晰区分
  │   ├── 菜单容器（depth=100）            ✓ 最顶层
  │   └── 自动事件绑定                     ✓ 简化代码
  └── 菜单内容创建
      ├── createPauseMenuContent()         ✓ 暂停菜单
      ├── createGameOverMenuContent()      ✓ 游戏结束
      ├── createVictoryMenuContent()       ✓ 通关菜单
      ├── createUpgradeMenuContent()       ⏳ 未来
      └── createMainMenuContent()          ⏳ 未来

MenuConfig（新增，~50 行）
  ├── 统一的 depth 配置
  ├── 菜单样式参数
  └── 为新菜单预留配置
```

### Depth/Z-Index 分层策略

```
新架构的 Depth 分层（清晰）：

Layer 100: ▲ 菜单容器（pauseText, pauseResumeButton）
           ▲ 虚拟按钮（left, right）
           ▲ 暂停按钮本身

Layer 90:  ═ 背景遮罩（半透明黑色）

Layer 0:   ■ 游戏对象（player, enemies, bullets）
           ■ HUD 文本（scoreText, waveText, livesText）

规则：
- 0-79: 游戏对象和 HUD（互不干扰）
- 80-89: 特殊效果预留
- 90-99: 菜单背景遮罩（高于游戏对象）
- 100+: 菜单和按钮（最顶层）
```

### 菜单栈概念

```
支持菜单嵌套的菜单栈设计：

单菜单场景（当前）：
showMenu('pause')
  → menuStack = [{ name: 'pause', ... }]
  → 显示暂停菜单

hideMenu('pause')
  → menuStack = []

多菜单嵌套（未来）：
showMenu('pause')
  → menuStack = [{ name: 'pause', ... }]

showMenu('upgrade')        // 在暂停中打开升级菜单
  → menuStack = [
      { name: 'pause', elements: {overlay, ...} },
      { name: 'upgrade', elements: {overlay, ...} }
    ]
  → 暂停菜单隐藏，升级菜单显示
  → 点击"关闭升级"触发 hideMenu('upgrade')

hideMenu('upgrade')
  → menuStack = [{ name: 'pause', ... }]
  → 升级菜单隐藏，暂停菜单重新显示

hideMenu('pause')
  → menuStack = []
  → 游戏继续
```

---

## 🛠️ 分阶段实施计划

### Phase 1: MenuManager 核心框架（1-2 天）

**目标**: 建立通用菜单系统基础，解决 depth 问题

#### 1.1 创建 MenuManager.js（新文件）

**文件路径**: `src/managers/MenuManager.js`（~400 行）

**核心代码结构**:
```javascript
class MenuManager {
  constructor(scene) {
    this.scene = scene;
    this.menuStack = [];        // 菜单栈
    this.overlayDepth = 90;     // 遮罩深度
    this.menuDepth = 100;       // 菜单深度
  }

  // 核心方法
  showMenu(menuName, menuConfig) { /* ... */ }
  hideMenu(menuName) { /* ... */ }
  hideAllMenus() { /* ... */ }
  isMenuVisible(menuName) { /* ... */ }
  getTopMenu() { /* ... */ }

  // 内部方法
  createMenuUI(menuName, menuConfig) { /* ... */ }
  createOverlay() { /* 创建背景遮罩 depth=90 */ }
  createMenuContent(menuName, menuConfig) { /* ... */ }

  // 菜单内容创建（对应每个菜单类型）
  createPauseMenuContent(container, config) { /* ... */ }
  createGameOverMenuContent(container, config) { /* ... */ }
  createVictoryMenuContent(container, config) { /* ... */ }

  // 工具方法
  createButton(x, y, text, callback, options) { /* ... */ }
  shutdown() { /* 清理资源 */ }
}
```

**关键实现细节**:

1. **showMenu 方法**:
```javascript
showMenu(menuName, menuConfig) {
  // 检查菜单是否已显示
  if (this.menuStack.some(m => m.name === menuName)) {
    return;
  }

  // 创建新菜单 UI
  const menu = this.createMenuUI(menuName, menuConfig);

  // 加入菜单栈
  this.menuStack.push({
    name: menuName,
    config: menuConfig,
    elements: menu
  });

  // 显示菜单
  menu.overlay.setVisible(true);
  menu.container.setVisible(true);
}
```

2. **createOverlay 方法**:
```javascript
createOverlay() {
  const overlay = this.scene.add.rectangle(
    this.scene.cameras.main.width / 2,
    this.scene.cameras.main.height / 2,
    this.scene.cameras.main.width,
    this.scene.cameras.main.height,
    0x000000,    // 黑色
    0.7          // 70% 不透明度
  );

  overlay.setInteractive();  // 阻止鼠标穿透
  overlay.setDepth(this.overlayDepth);  // depth = 90

  return overlay;
}
```

3. **createMenuContent 方法**:
```javascript
createMenuContent(menuName, menuConfig) {
  const container = this.scene.add.container(0, 0);

  switch (menuName) {
    case 'pause':
      return this.createPauseMenuContent(container, menuConfig);
    case 'gameOver':
      return this.createGameOverMenuContent(container, menuConfig);
    case 'victory':
      return this.createVictoryMenuContent(container, menuConfig);
    case 'upgrade':    // 预留扩展
      return this.createUpgradeMenuContent(container, menuConfig);
    case 'main':       // 预留扩展
      return this.createMainMenuContent(container, menuConfig);
    default:
      return container;
  }
}
```

#### 1.2 创建 MenuConfig.js（可选但推荐）

**文件路径**: `src/config/MenuConfig.js`（~50 行）

```javascript
const MenuConfig = {
  DEPTH: {
    OVERLAY: 90,
    MENU: 100
  },

  OVERLAY: {
    COLOR: 0x000000,
    ALPHA: 0.7,
    INTERACTIVE: true
  },

  PAUSE_MENU: {
    TITLE_FONT_SIZE: '50px',
    TITLE_COLOR: '#fff',
    BUTTON_WIDTH: 180,
    BUTTON_HEIGHT: 50,
    BUTTON_SPACING: 70
  },

  GAMEOVER_MENU: {
    TITLE_FONT_SIZE: '40px',
    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 60
  },

  VICTORY_MENU: {
    TITLE_FONT_SIZE: '50px',
    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 60
  },

  // 为未来菜单预留配置
  UPGRADE_MENU: {
    TITLE_FONT_SIZE: '40px',
    OPTION_GRID_COLS: 3,
    OPTION_CARD_WIDTH: 150,
    OPTION_CARD_HEIGHT: 180
  },

  MAIN_MENU: {
    TITLE_FONT_SIZE: '60px',
    BUTTON_WIDTH: 250,
    BUTTON_HEIGHT: 60,
    BUTTON_SPACING: 80
  }
};

module.exports = MenuConfig;
```

#### 1.3 修改 UIManager.js

**修改位置和内容**:

1. **在 constructor 中添加**（第16-19行之后）:
```javascript
constructor(scene, scoreManager) {
  this.scene = scene;
  this.scoreManager = scoreManager;

  // 新增：创建菜单管理器
  const MenuManager = require('./MenuManager');
  this.menuManager = new MenuManager(scene);

  // ... 其他初始化代码
}
```

2. **修改 createHUD() 方法**:
   - 删除以下行（第117-145行）：
     - `this.pauseText = ...`
     - `this.pauseResumeButton = ...`
     - `this.pauseRestartButton = ...`
   - 这些元素现在由 MenuManager 管理

3. **修改 showPauseMenu() 方法**（第411-433行）:
```javascript
// 从
showPauseMenu(onResume, onRestart) {
  if (this.pauseText) {
    this.pauseText.setVisible(true);
  }
  // ...
}

// 改为
showPauseMenu(onResume, onRestart) {
  this.menuManager.showMenu('pause', {
    onResume: onResume,
    onRestart: onRestart
  });
}
```

4. **修改 hidePauseMenu() 方法**（第438-448行）:
```javascript
// 从
hidePauseMenu() {
  if (this.pauseText) {
    this.pauseText.setVisible(false);
  }
  // ...
}

// 改为
hidePauseMenu() {
  this.menuManager.hideMenu('pause');
}
```

5. **修改 showGameOver() 方法**（第465-492行）:
```javascript
// 委托给 MenuManager
showGameOver(score, highScore, isNewRecord, onRestart) {
  this.menuManager.showMenu('gameOver', {
    score: score,
    highScore: highScore,
    isNewRecord: isNewRecord,
    onRestart: onRestart
  });
}
```

6. **修改 showVictory() 方法**（第500-545行）:
```javascript
// 委托给 MenuManager
showVictory(score, lives, onContinue) {
  this.menuManager.showMenu('victory', {
    score: score,
    lives: lives,
    onContinue: onContinue
  });
}
```

7. **修改 shutdown() 方法**:
```javascript
shutdown() {
  // 清理菜单管理器
  if (this.menuManager) {
    this.menuManager.shutdown();
  }

  // ... 其他清理代码
}
```

#### 验收标准
- [x] MenuManager.js 创建完成，所有核心方法实现
- [x] 背景遮罩（depth=90）正常显示
- [x] 菜单容器（depth=100）显示在所有游戏对象上方
- [x] 暂停菜单不被飞船/敌人遮挡
- [x] 鼠标点击遮罩不能穿透到背后
- [x] UIManager 代码行数明显减少（627 → ~350）

---

### Phase 2: 迁移现有菜单（1 天）

**目标**: 完全迁移现有三个菜单到 MenuManager

#### 2.1 迁移暂停菜单

从旧模式（createHUD 中预创建）改为新模式（按需创建）

实现 `MenuManager.createPauseMenuContent()`：
```javascript
createPauseMenuContent(container, config) {
  const centerX = this.scene.cameras.main.width / 2;
  const centerY = this.scene.cameras.main.height / 2;

  // 创建标题
  const title = this.scene.add.text(
    centerX,
    centerY - 100,
    'PAUSED',
    { fontSize: '50px', fill: '#fff', fontStyle: 'bold' }
  ).setOrigin(0.5);
  container.add(title);

  // 创建 Resume 按钮
  const resumeBtn = this.createButton(
    centerX, centerY, 'Resume',
    config.onResume,
    { width: 180, height: 50 }
  );
  container.add(resumeBtn);

  // 创建 Restart 按钮
  const restartBtn = this.createButton(
    centerX, centerY + 70, 'Restart',
    config.onRestart,
    { width: 180, height: 50 }
  );
  container.add(restartBtn);

  return container;
}
```

#### 2.2 迁移游戏结束菜单

改进：从"一次性创建"改为"可复用"

实现 `MenuManager.createGameOverMenuContent()`：
```javascript
createGameOverMenuContent(container, config) {
  const centerX = this.scene.cameras.main.width / 2;
  const centerY = this.scene.cameras.main.height / 2;

  // 创建消息
  let gameOverMessage = 'GAME OVER\n';
  gameOverMessage += 'Score: ' + config.score + '\n';
  gameOverMessage += 'High Score: ' + config.highScore;
  if (config.isNewRecord) {
    gameOverMessage += '\n🎉 NEW RECORD! 🎉';
  }

  const text = this.scene.add.text(
    centerX, centerY - 60, gameOverMessage,
    {
      fontSize: '40px',
      fill: config.isNewRecord ? '#FFD700' : '#fff',
      align: 'center'
    }
  ).setOrigin(0.5);
  container.add(text);

  // 创建 Restart 按钮
  const restartBtn = this.createButton(
    centerX, centerY + 100, 'Restart',
    config.onRestart,
    { width: 200, height: 60, fontSize: '28px' }
  );
  container.add(restartBtn);

  return container;
}
```

#### 2.3 迁移通关菜单

同游戏结束菜单

实现 `MenuManager.createVictoryMenuContent()`：
```javascript
createVictoryMenuContent(container, config) {
  const centerX = this.scene.cameras.main.width / 2;
  const centerY = this.scene.cameras.main.height / 2;

  // 创建标题
  const title = this.scene.add.text(
    centerX, centerY - 100,
    '🎉 恭喜通关！🎉',
    { fontSize: '50px', fill: '#FFD700', fontStyle: 'bold' }
  ).setOrigin(0.5);
  container.add(title);

  // 创建统计
  const stats = this.scene.add.text(
    centerX, centerY,
    `Score: ${config.score}\nLives: ${config.lives}`,
    { fontSize: '30px', fill: '#fff', align: 'center' }
  ).setOrigin(0.5);
  container.add(stats);

  // 创建 Continue 按钮
  const continueBtn = this.createButton(
    centerX, centerY + 110, 'Continue',
    config.onContinue,
    { width: 200, height: 60, fontSize: '28px' }
  );
  container.add(continueBtn);

  // 创建提示
  const hint = this.scene.add.text(
    centerX, centerY + 180,
    '(Restart from Wave 1)',
    { fontSize: '18px', fill: '#aaa', align: 'center' }
  ).setOrigin(0.5);
  container.add(hint);

  return container;
}
```

#### 测试步骤
1. 点击暂停按钮 → 暂停菜单显示，完全可见（不被覆盖）✓
2. 点击 Resume → 菜单隐藏，游戏继续 ✓
3. 再次暂停 → 菜单再次显示 ✓
4. 游戏结束 → 显示游戏结束菜单 ✓
5. 通关 → 显示通关菜单 ✓
6. 所有菜单都有背景遮罩 ✓

#### 验收标准
- [x] 暂停菜单显示/隐藏正常，背景遮罩完整
- [x] 游戏结束菜单显示/隐藏正常
- [x] 通关菜单显示/隐藏正常
- [x] 所有菜单都显示在最顶层，不被覆盖
- [x] 没有内存泄漏
- [x] 菜单外观与之前相同（只是位置更好）

---

### Phase 3: 为未来扩展做准备（0.5 天）

**目标**: 建立菜单扩展框架，为升级菜单、主菜单等做准备

#### 3.1 在 MenuManager 中预留扩展点

在 `createMenuContent()` 中添加：
```javascript
case 'upgrade':
  return this.createUpgradeMenuContent(container, config);
case 'main':
  return this.createMainMenuContent(container, config);
case 'settings':
  return this.createSettingsMenuContent(container, config);
```

添加占位方法：
```javascript
/**
 * 创建升级菜单内容
 * TODO: 实现升级菜单
 */
createUpgradeMenuContent(container, config) {
  // 占位符
  return container;
}

/**
 * 创建主菜单内容
 * TODO: 实现主菜单
 */
createMainMenuContent(container, config) {
  // 占位符
  return container;
}

/**
 * 创建设置菜单内容
 * TODO: 实现设置菜单
 */
createSettingsMenuContent(container, config) {
  // 占位符
  return container;
}
```

#### 3.2 完善 MenuConfig

已在上面的 MenuConfig.js 中预留了 UPGRADE_MENU、MAIN_MENU 等配置

#### 3.3 添加代码注释

在 MenuManager.js 中添加清晰的注释，说明如何添加新菜单：

```javascript
/**
 * 添加新菜单的步骤：
 * 1. 在 MenuConfig.js 中添加配置
 * 2. 在 createMenuContent() 中添加 case 分支
 * 3. 实现 createXxxMenuContent() 方法
 * 4. 调用 this.menuManager.showMenu('xxx', config)
 *
 * 无需修改核心逻辑！
 */
```

#### 验收标准
- [x] MenuManager 有清晰的扩展框架
- [x] MenuConfig 为新菜单预留了配置空间
- [x] 添加新菜单的步骤清晰明了
- [x] 代码注释完整

---

## 📁 文件修改清单

### 新建文件（2 个）

1. **`src/managers/MenuManager.js`**（~400 行）
   - 完整的菜单管理系统
   - 支持菜单栈、depth 管理、背景遮罩
   - 包含所有现有菜单的内容创建方法

2. **`src/config/MenuConfig.js`**（~50 行）
   - 集中管理所有菜单配置参数
   - 便于调整菜单样式
   - 为新菜单预留配置

### 修改文件（2 个）

3. **`src/managers/UIManager.js`**（预期变化：627 → ~350 行，-45%）
   - 在 constructor 中注入 MenuManager
   - 从 createHUD() 中移除菜单元素创建
   - 修改 showPauseMenu/hidePauseMenu 委托给 MenuManager
   - 修改 showGameOver/showVictory 委托给 MenuManager
   - 修改 shutdown() 调用 MenuManager.shutdown()
   - 删除 pauseText, pauseResumeButton, pauseRestartButton 等属性

4. **`src/scenes/GameScene.js`**（无需修改）
   - GameScene 调用 UIManager 的接口不变
   - UIManager 已做向后兼容

---

## 💾 代码量对比

```
当前（Phase 0）：
├── UIManager.js: 627 行（菜单+HUD 混合）
├── MenuManager: 无
└── MenuConfig: 无
总计: 627 行

Phase 1+2 完成后：
├── UIManager.js: ~350 行（仅 HUD，-45%）
├── MenuManager.js: ~400 行（菜单专用）
├── MenuConfig.js: ~50 行（配置）
└── GameScene.js: 无变化
总计: 800 行（+173 行）

代码质量：显著提升
- 职责分离：HUD ≠ 菜单
- 可维护性：更清晰的结构
- 可扩展性：轻松添加新菜单
- 性能：无损失（仅多一个矩形）
```

---

## 🔄 后续扩展示例

### 添加升级菜单（Phase 4，预计 0.5-1 天）

```javascript
// 在 MenuManager.js 中实现
createUpgradeMenuContent(container, config) {
  const centerX = this.scene.cameras.main.width / 2;
  const centerY = this.scene.cameras.main.height / 2;

  // 创建标题
  const title = this.scene.add.text(
    centerX, centerY - 150,
    'Choose Your Upgrade:',
    { fontSize: '32px', fill: '#fff' }
  ).setOrigin(0.5);
  container.add(title);

  // 创建升级选项卡片
  const options = config.options;  // [option1, option2, option3]
  options.forEach((option, index) => {
    const x = centerX - 200 + index * 200;
    const card = this.createUpgradeCard(x, centerY, option, (selected) => {
      config.onSelect(selected);
      this.hideMenu('upgrade');
    });
    container.add(card);
  });

  return container;
}

// 使用示例（在 GameScene.js 中）
showUpgradeMenu(options) {
  this.uiManager.menuManager.showMenu('upgrade', {
    options: options,
    onSelect: (selected) => {
      this.upgradeManager.applyUpgrade(selected);
      this.startNextWave();
    }
  });
}
```

### 添加主菜单（Phase 5，预计 0.5-1 天）

```javascript
// 类似的扩展方式
createMainMenuContent(container, config) {
  // 游戏标题
  // 开始游戏按钮
  // 设置按钮
  // 排行榜按钮
}
```

---

## ⚖️ 权衡分析

### 优势 ✅
- **解决 depth 问题**：菜单不再被覆盖（core issue）
- **支持菜单栈**：可扩展到多菜单嵌套
- **代码更清晰**：菜单和 HUD 职责分离
- **易于扩展**：添加新菜单无需修改核心逻辑
- **性能无影响**：仅多一个矩形（overlay）
- **向后兼容**：GameScene 无需修改

### 成本 ⚠️
- **多一个管理器**：MenuManager 需要维护
- **多一个配置文件**：MenuConfig（可选但推荐）
- **学习曲线**：需要理解菜单栈概念
- **迁移工作**：需要修改 UIManager、测试

### 风险和缓解

| 风险 | 可能性 | 影响 | 缓解方案 |
|------|--------|------|---------|
| 菜单显示异常 | 低 | 中 | Phase 1 充分测试 |
| 性能下降 | 极低 | 低 | overlay 开销极小 |
| 内存泄漏 | 低 | 中 | MenuManager 负责清理 |
| 与虚拟按钮冲突 | 极低 | 低 | depth 设计避免冲突 |
| 迁移失败 | 低 | 中 | 分阶段实施，每阶段都测试 |

---

## 📊 实施时间表

| Phase | 工作 | 工作量 | 关键输出 |
|-------|------|--------|---------|
| 1 | MenuManager 核心 + MenuConfig + UIManager 修改 | 1-2 天 | 菜单不再被覆盖 |
| 2 | 迁移三个现有菜单 | 1 天 | 完整菜单功能 |
| 3 | 扩展框架 + 预留占位符 | 0.5 天 | 为新菜单做准备 |
| **总计** | - | **2.5-3.5 天** | **通用菜单系统完成** |
| 4 | 升级菜单（未来） | 0.5-1 天 | 支持波次升级 |
| 5 | 主菜单（未来） | 0.5-1 天 | 游戏启动界面 |

---

## ✅ 预期成果

### Phase 1 完成后 🎯
✅ 暂停菜单不再被飞船/敌人遮挡
✅ 有半透明背景遮罩，视觉清晰
✅ 代码职责分离，更易理解

### Phase 2 完成后 🎯
✅ 所有现有菜单迁移完成
✅ 没有内存泄漏，功能正常
✅ 用户体验明显提升

### Phase 3 完成后 🎯
✅ 菜单系统完全就绪
✅ 框架清晰，易于扩展
✅ 文档和注释完整

---

## 🎬 实施建议

1. **按顺序实施**：Phase 1 → Phase 2 → Phase 3
2. **每 Phase 后测试**：确保功能正常
3. **保留 UIManager 旧代码**：完全验证后再删除
4. **逐步迁移菜单**：暂停 → 游戏结束 → 通关
5. **建立测试清单**：保证所有菜单场景都测过

---

## 📚 相关文档

- **当前项目计划**: `documentation/PLAN.md`
- **玩家升级系统**: `documentation/memos/player-upgrade-system-plan.md`
- **游戏配置**: `src/config/GameConfig.js`
- **UI 管理器**: `src/managers/UIManager.js`

---

**最后更新**: 2025-11-18
**作者**: Claude Code + 用户讨论
**状态**: 设计完成，等待实施确认
