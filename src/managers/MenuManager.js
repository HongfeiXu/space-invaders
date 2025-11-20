/**
 * MenuManager - 通用菜单系统管理器
 *
 * 职责：
 * - 管理游戏菜单的显示、隐藏、栈管理
 * - 统一处理菜单的 depth、overlay、背景遮罩
 * - 支持菜单嵌套（菜单栈）
 * - 为各类菜单提供统一的创建和销毁接口
 *
 * ==================== 如何添加新菜单 ====================
 *
 * 步骤 1：在 MenuConfig.js 中添加配置
 * ```javascript
 * const MenuConfig = {
 *   MY_MENU: {
 *     TITLE_FONT_SIZE: '40px',
 *     BUTTON_WIDTH: 200,
 *     // ... other styles
 *   }
 * };
 * ```
 *
 * 步骤 2：在 createMenuContent() 方法中添加 case 分支
 * ```javascript
 * case 'myMenu':
 *   return this.createMyMenuContent(container, menuConfig);
 * ```
 *
 * 步骤 3：实现 createMyMenuContent() 方法
 * ```javascript
 * createMyMenuContent(container, config) {
 *   // 使用 this.scene.add.text/rectangle 等创建 UI 元素
 *   // 使用 this.createButton() 创建按钮
 *   // 使用 container.add() 将元素添加到容器
 *   // 记住所有元素都是相对于容器中心的坐标
 *   return container;
 * }
 * ```
 *
 * Step 4: Call showMenu() in game code
 * ```javascript
 * this.uiManager.menuManager.showMenu('myMenu', {
 *   data: someData,
 *   onConfirm: () => { ... },
 *   onCancel: () => { ... }
 * });
 * ```
 *
 * ==================== 已实现菜单 ====================
 * ✅ pause     - 暂停菜单（Phase 2）
 * ✅ gameOver  - 游戏结束菜单（Phase 2）
 * ✅ victory   - 通关菜单（Phase 2）
 *
 * ==================== 计划菜单 ====================
 * ⏳ upgrade   - 升级菜单（Phase 4）
 * ⏳ main      - 主菜单（Phase 5）
 * ⏳ settings  - 设置菜单（Future）
 *
 * ==================== Depth 分层 ====================
 * - depth 0:   游戏对象 (player, enemies, bullets)
 * - depth 90:  菜单背景遮罩
 * - depth 100: 菜单内容 (buttons, text)
 * 这确保菜单永远显示在游戏对象上方
 */

class MenuManager {
    constructor(scene) {
      const MenuConfig = require('../config/MenuConfig');
      this.scene = scene;
      this.menuStack = [];        // 菜单栈：[{ name, config, elements }, ...]
      this.overlayDepth = MenuConfig.DEPTH.OVERLAY;
      this.menuDepth = MenuConfig.DEPTH.MENU;
    }

    /**
     * 显示菜单
     * @param {string} menuName - 菜单名称 ('pause', 'gameOver', 'victory', etc.)
     * @param {object} menuConfig - 菜单配置（包含回调和数据）
     */
    showMenu(menuName, menuConfig) {
      // 检查菜单是否已经显示
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

    /**
     * 隐藏特定菜单
     * @param {string} menuName - 菜单名称
     */
    hideMenu(menuName) {
      const index = this.menuStack.findIndex(m => m.name === menuName);
      if (index === -1) {
        return;
      }

      const menu = this.menuStack[index];
      menu.elements.overlay.setVisible(false);
      menu.elements.container.setVisible(false);

      // 从栈中移除
      this.menuStack.splice(index, 1);

      // 如果还有其他菜单，显示栈顶菜单
      if (this.menuStack.length > 0) {
        const topMenu = this.menuStack[this.menuStack.length - 1];
        topMenu.elements.overlay.setVisible(true);
        topMenu.elements.container.setVisible(true);
      }
    }

    /**
     * 隐藏所有菜单
     */
    hideAllMenus() {
      this.menuStack.forEach(menu => {
        if (menu.elements) {
          menu.elements.overlay.setVisible(false);
          menu.elements.container.setVisible(false);
        }
      });
      this.menuStack = [];
    }

    /**
     * 检查菜单是否显示
     * @param {string} menuName - 菜单名称
     * @returns {boolean}
     */
    isMenuVisible(menuName) {
      return this.menuStack.some(m => m.name === menuName);
    }

    /**
     * 获取菜单栈顶菜单
     * @returns {object|null}
     */
    getTopMenu() {
      if (this.menuStack.length === 0) {
        return null;
      }
      return this.menuStack[this.menuStack.length - 1];
    }

    /**
     * 创建完整菜单 UI（包括 overlay 和 content container）
     * @private
     * @param {string} menuName - 菜单名称
     * @param {object} menuConfig - 菜单配置
     * @returns {object} { overlay, container }
     */
    createMenuUI(menuName, menuConfig) {
      // 创建背景遮罩（depth=90）
      const overlay = this.createOverlay();

      // 创建菜单容器（depth=100）
      const container = this.scene.add.container(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2
      );
      container.setDepth(this.menuDepth);

      // 创建菜单内容
      this.createMenuContent(menuName, menuConfig, container);

      // 初始隐藏
      overlay.setVisible(false);
      container.setVisible(false);

      return { overlay, container };
    }

    /**
     * 创建背景遮罩
     * @private
     * @returns {Phaser.GameObjects.Rectangle}
     */
    createOverlay() {
      const MenuConfig = require('../config/MenuConfig');
      const overlayConfig = MenuConfig.OVERLAY;
      const depthConfig = MenuConfig.DEPTH;

      const overlay = this.scene.add.rectangle(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        this.scene.cameras.main.width,
        this.scene.cameras.main.height,
        overlayConfig.COLOR,
        overlayConfig.ALPHA
      );

      if (overlayConfig.INTERACTIVE) {
        overlay.setInteractive();  // 阻止鼠标穿透到背后
      }
      overlay.setDepth(depthConfig.OVERLAY);

      return overlay;
    }

    /**
     * 根据菜单名称创建菜单内容
     * @private
     * @param {string} menuName - 菜单名称
     * @param {object} menuConfig - 菜单配置
     * @param {Phaser.GameObjects.Container} container - 菜单容器
     */
    createMenuContent(menuName, menuConfig, container) {
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
        case 'settings':   // 预留扩展
          return this.createSettingsMenuContent(container, menuConfig);
        default:
          return container;
      }
    }

    /**
     * 创建暂停菜单内容
     * @private
     */
    createPauseMenuContent(container, config) {
      // Import MenuConfig if needed
      const MenuConfig = require('../config/MenuConfig');
      const pauseConfig = MenuConfig.PAUSE_MENU;

      // 创建标题
      const title = this.scene.add.text(
        0,
        -100,
        pauseConfig.TITLE,
        {
          fontSize: pauseConfig.TITLE_FONT_SIZE,
          fill: pauseConfig.TITLE_COLOR,
          fontStyle: pauseConfig.TITLE_FONT_STYLE,
          align: 'center'
        }
      ).setOrigin(0.5);
      container.add(title);

      // 创建 Resume 按钮
      const resumeBtn = this.createButton(
        0,
        pauseConfig.RESUME_Y,
        'Resume',
        config.onResume,
        {
          width: pauseConfig.BUTTON_WIDTH,
          height: pauseConfig.BUTTON_HEIGHT,
          fontSize: pauseConfig.BUTTON_FONT_SIZE,
          fillColor: pauseConfig.BUTTON_COLOR,
          textColor: pauseConfig.BUTTON_TEXT_COLOR
        }
      );
      container.add(resumeBtn);

      // 创建 Restart 按钮
      const restartBtn = this.createButton(
        0,
        pauseConfig.RESTART_Y,
        'Restart',
        config.onRestart,
        {
          width: pauseConfig.BUTTON_WIDTH,
          height: pauseConfig.BUTTON_HEIGHT,
          fontSize: pauseConfig.BUTTON_FONT_SIZE,
          fillColor: '#ff6b6b',
          textColor: pauseConfig.BUTTON_TEXT_COLOR
        }
      );
      container.add(restartBtn);

      return container;
    }

    /**
     * 创建游戏结束菜单内容
     * @private
     */
    createGameOverMenuContent(container, config) {
      const MenuConfig = require('../config/MenuConfig');
      const gameOverConfig = MenuConfig.GAMEOVER_MENU;

      // 构建游戏结束消息
      let gameOverMessage = gameOverConfig.TITLE + '\n';
      gameOverMessage += 'Score: ' + config.score + '\n';
      gameOverMessage += 'High Score: ' + config.highScore;
      if (config.isNewRecord) {
        gameOverMessage += '\n🎉 NEW RECORD! 🎉';
      }

      // 创建文本
      const text = this.scene.add.text(
        0,
        gameOverConfig.MESSAGE_Y,
        gameOverMessage,
        {
          fontSize: gameOverConfig.MESSAGE_FONT_SIZE,
          fill: config.isNewRecord ? '#FFD700' : gameOverConfig.MESSAGE_COLOR,
          align: 'center'
        }
      ).setOrigin(0.5);
      container.add(text);

      // 创建 Restart 按钮
      const restartBtn = this.createButton(
        0,
        gameOverConfig.BUTTON_Y,
        'Restart',
        config.onRestart,
        {
          width: gameOverConfig.BUTTON_WIDTH,
          height: gameOverConfig.BUTTON_HEIGHT,
          fontSize: gameOverConfig.BUTTON_FONT_SIZE,
          fillColor: gameOverConfig.BUTTON_COLOR
        }
      );
      container.add(restartBtn);

      return container;
    }

    /**
     * 创建通关菜单内容
     * @private
     */
    createVictoryMenuContent(container, config) {
      const MenuConfig = require('../config/MenuConfig');
      const victoryConfig = MenuConfig.VICTORY_MENU;

      // 创建标题
      const title = this.scene.add.text(
        0,
        victoryConfig.TITLE_Y,
        victoryConfig.TITLE,
        {
          fontSize: victoryConfig.TITLE_FONT_SIZE,
          fill: victoryConfig.TITLE_COLOR,
          fontStyle: victoryConfig.TITLE_FONT_STYLE,
          align: 'center'
        }
      ).setOrigin(0.5);
      container.add(title);

      // 创建统计信息
      const stats = this.scene.add.text(
        0,
        victoryConfig.STATS_Y,
        `Score: ${config.score}\nLives: ${config.lives}`,
        {
          fontSize: victoryConfig.STATS_FONT_SIZE,
          fill: victoryConfig.STATS_COLOR,
          align: 'center'
        }
      ).setOrigin(0.5);
      container.add(stats);

      // 创建 Continue 按钮
      const continueBtn = this.createButton(
        0,
        victoryConfig.BUTTON_Y,
        'Continue',
        config.onContinue,
        {
          width: victoryConfig.BUTTON_WIDTH,
          height: victoryConfig.BUTTON_HEIGHT,
          fontSize: victoryConfig.BUTTON_FONT_SIZE,
          fillColor: victoryConfig.BUTTON_COLOR
        }
      );
      container.add(continueBtn);

      // 创建提示文字
      const hint = this.scene.add.text(
        0,
        victoryConfig.HINT_Y,
        '(Restart from Wave 1)',
        {
          fontSize: victoryConfig.HINT_FONT_SIZE,
          fill: victoryConfig.HINT_COLOR,
          align: 'center'
        }
      ).setOrigin(0.5);
      container.add(hint);

      return container;
    }

    /**
     * 创建升级菜单内容
     *
     * 预期功能（Phase 4）：
     * - 显示 3-4 个升级选项（攻击、防御、特殊能力）
     * - 每个选项显示为卡片/按钮
     * - 用户选择一个升级后游戏继续
     * - 应用升级到玩家属性
     *
     * 使用示例：
     * ```javascript
     * gameScene.uiManager.menuManager.showMenu('upgrade', {
     *   options: [
     *     { name: 'Double Shot', description: 'Fire 2 bullets' },
     *     { name: 'Shield', description: 'Reduce damage by 50%' }
     *   ],
     *   onSelect: (selectedOption) => {
     *     upgradeManager.applyUpgrade(selectedOption);
     *   }
     * });
     * ```
     *
     * @param {Phaser.GameObjects.Container} container - 菜单容器
     * @param {object} config - 配置对象 { options, onSelect }
     * @returns {Phaser.GameObjects.Container} 更新后的容器
     * @private
     * @todo Implement in Phase 4 - Player Upgrade System
     */
    createUpgradeMenuContent(container, config) {
      // TODO: Implement upgrade menu with option cards
      // Reference: MenuConfig.UPGRADE_MENU for style parameters
      return container;
    }

    /**
     * 创建主菜单内容
     *
     * 预期功能（Phase 5）：
     * - 游戏启动时显示
     * - 包含：游戏标题、开始游戏、排行榜、设置按钮
     * - 背景音乐循环播放
     * - 支持菜单嵌套（设置菜单在主菜单内打开）
     *
     * 使用示例：
     * ```javascript
     * // 在 PreloadScene 或单独的 MenuScene 中使用
     * this.uiManager.menuManager.showMenu('main', {
     *   onStart: () => this.scene.start('GameScene'),
     *   onLeaderboard: () => this.uiManager.menuManager.showMenu('leaderboard', ...),
     *   onSettings: () => this.uiManager.menuManager.showMenu('settings', ...)
     * });
     * ```
     *
     * @param {Phaser.GameObjects.Container} container - 菜单容器
     * @param {object} config - 配置对象 { onStart, onLeaderboard, onSettings }
     * @returns {Phaser.GameObjects.Container} 更新后的容器
     * @private
     * @todo Implement in Phase 5 - Main Menu System
     */
    createMainMenuContent(container, config) {
      // TODO: Implement main menu with title and navigation buttons
      // Reference: MenuConfig.MAIN_MENU for style parameters
      return container;
    }

    /**
     * 创建设置菜单内容
     *
     * 预期功能：
     * - 音量控制（背景音乐、音效）
     * - 视频设置（FPS 显示开关等）
     * - 返回上级菜单按钮
     * - 支持菜单栈：可从主菜单或暂停菜单打开
     *
     * 使用示例：
     * ```javascript
     * this.uiManager.menuManager.showMenu('settings', {
     *   currentVolume: 0.8,
     *   showFPS: true,
     *   onSave: (settings) => {
     *     gameConfig.updateSettings(settings);
     *   }
     * });
     * ```
     *
     * @param {Phaser.GameObjects.Container} container - 菜单容器
     * @param {object} config - 配置对象 { currentVolume, showFPS, onSave }
     * @returns {Phaser.GameObjects.Container} 更新后的容器
     * @private
     * @todo Implement in future - Settings Menu System
     */
    createSettingsMenuContent(container, config) {
      // TODO: Implement settings menu with audio and video controls
      // Reference: MenuConfig.SETTINGS_MENU for style parameters (if needed)
      return container;
    }

    /**
     * 创建菜单按钮
     * @protected
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {string} text - 按钮文字
     * @param {function} callback - 点击回调
     * @param {object} options - 选项 { width, height, fontSize, ... }
     * @returns {Phaser.GameObjects.Container} 按钮容器
     */
    createButton(x, y, text, callback, options = {}) {
      const {
        width = 150,
        height = 50,
        fontSize = '24px',
        fillColor = '#4CAF50',
        textColor = '#fff'
      } = options;

      // 创建按钮背景（矩形）
      const bg = this.scene.add.rectangle(x, y, width, height, fillColor);
      bg.setInteractive();

      // 创建按钮文字
      const buttonText = this.scene.add.text(x, y, text, {
        fontSize: fontSize,
        fill: textColor,
        align: 'center'
      }).setOrigin(0.5);

      // 创建按钮容器
      const button = this.scene.add.container(x, y, [bg, buttonText]);

      // 添加交互效果
      bg.on('pointerover', () => {
        bg.setFillStyle(0x45a049);  // 略微变暗
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(fillColor);
      });

      bg.on('pointerdown', () => {
        // 按下效果
        bg.setScale(0.95);
      });

      bg.on('pointerup', () => {
        // 恢复大小
        bg.setScale(1);

        // 执行回调
        if (callback) {
          callback();
        }
      });

      return button;
    }

    /**
     * 清理资源
     */
    shutdown() {
      // 隐藏并销毁所有菜单
      this.menuStack.forEach(menu => {
        if (menu.elements) {
          if (menu.elements.overlay) {
            menu.elements.overlay.destroy();
          }
          if (menu.elements.container) {
            menu.elements.container.destroy();
          }
        }
      });

      this.menuStack = [];
    }
}

module.exports = MenuManager;
