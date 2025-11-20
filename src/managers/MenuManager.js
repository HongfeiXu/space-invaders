/**
 * MenuManager - 通用菜单系统管理器
 * 职责：
 * - 管理游戏菜单的显示、隐藏、栈管理
 * - 统一处理菜单的 depth、overlay、背景遮罩
 * - 支持菜单嵌套（菜单栈）
 * - 为各类菜单提供统一的创建和销毁接口
 */

class MenuManager {
  constructor(scene) {
    this.scene = scene;
    this.menuStack = [];        // 菜单栈：[{ name, config, elements }, ...]
    this.overlayDepth = 90;     // 背景遮罩深度
    this.menuDepth = 100;       // 菜单容器深度
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
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,    // 黑色
      0.7          // 70% 不透明度
    );

    overlay.setInteractive();  // 阻止鼠标穿透到背后
    overlay.setDepth(this.overlayDepth);  // depth = 90

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
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // 创建标题
    const title = this.scene.add.text(
      0,
      -100,
      'PAUSED',
      {
        fontSize: '50px',
        fill: '#fff',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);
    container.add(title);

    // 创建 Resume 按钮
    const resumeBtn = this.createButton(
      0,
      0,
      'Resume',
      config.onResume,
      { width: 180, height: 50, fontSize: '24px', fillColor: '#4CAF50' }
    );
    container.add(resumeBtn);

    // 创建 Restart 按钮
    const restartBtn = this.createButton(
      0,
      70,
      'Restart',
      config.onRestart,
      { width: 180, height: 50, fontSize: '24px', fillColor: '#ff6b6b' }
    );
    container.add(restartBtn);

    return container;
  }

  /**
   * 创建游戏结束菜单内容
   * @private
   */
  createGameOverMenuContent(container, config) {
    // 构建游戏结束消息
    let gameOverMessage = 'GAME OVER\n';
    gameOverMessage += 'Score: ' + config.score + '\n';
    gameOverMessage += 'High Score: ' + config.highScore;
    if (config.isNewRecord) {
      gameOverMessage += '\n🎉 NEW RECORD! 🎉';
    }

    // 创建文本
    const text = this.scene.add.text(
      0,
      -60,
      gameOverMessage,
      {
        fontSize: '40px',
        fill: config.isNewRecord ? '#FFD700' : '#fff',
        align: 'center'
      }
    ).setOrigin(0.5);
    container.add(text);

    // 创建 Restart 按钮
    const restartBtn = this.createButton(
      0,
      100,
      'Restart',
      config.onRestart,
      { width: 200, height: 60, fontSize: '28px', fillColor: '#ff6b6b' }
    );
    container.add(restartBtn);

    return container;
  }

  /**
   * 创建通关菜单内容
   * @private
   */
  createVictoryMenuContent(container, config) {
    // 创建标题
    const title = this.scene.add.text(
      0,
      -100,
      '🎉 恭喜通关！🎉',
      {
        fontSize: '50px',
        fill: '#FFD700',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);
    container.add(title);

    // 创建统计信息
    const stats = this.scene.add.text(
      0,
      0,
      `Score: ${config.score}\nLives: ${config.lives}`,
      {
        fontSize: '30px',
        fill: '#fff',
        align: 'center'
      }
    ).setOrigin(0.5);
    container.add(stats);

    // 创建 Continue 按钮
    const continueBtn = this.createButton(
      0,
      110,
      'Continue',
      config.onContinue,
      { width: 200, height: 60, fontSize: '28px', fillColor: '#FFD700' }
    );
    container.add(continueBtn);

    // 创建提示文字
    const hint = this.scene.add.text(
      0,
      180,
      '(Restart from Wave 1)',
      {
        fontSize: '18px',
        fill: '#aaa',
        align: 'center'
      }
    ).setOrigin(0.5);
    container.add(hint);

    return container;
  }

  /**
   * 创建升级菜单内容
   * TODO: Phase 4 实现
   * @private
   */
  createUpgradeMenuContent(container, config) {
    // 占位符
    return container;
  }

  /**
   * 创建主菜单内容
   * TODO: Phase 5 实现
   * @private
   */
  createMainMenuContent(container, config) {
    // 占位符
    return container;
  }

  /**
   * 创建设置菜单内容
   * TODO: 未来实现
   * @private
   */
  createSettingsMenuContent(container, config) {
    // 占位符
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
      if (menu.elements.overlay) {
        menu.elements.overlay.destroy();
      }
      if (menu.elements.container) {
        menu.elements.container.destroy();
      }
    });

    this.menuStack = [];
  }
}

module.exports = MenuManager;
