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
   * TODO: Phase 2 实现具体内容，现在返回占位符
   * @private
   */
  createPauseMenuContent(container, config) {
    // 占位符：Phase 2 时实现
    return container;
  }

  /**
   * 创建游戏结束菜单内容
   * TODO: Phase 2 实现具体内容，现在返回占位符
   * @private
   */
  createGameOverMenuContent(container, config) {
    // 占位符：Phase 2 时实现
    return container;
  }

  /**
   * 创建通关菜单内容
   * TODO: Phase 2 实现具体内容，现在返回占位符
   * @private
   */
  createVictoryMenuContent(container, config) {
    // 占位符：Phase 2 时实现
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
