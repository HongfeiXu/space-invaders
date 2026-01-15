/**
 * MenuConfig - 通用菜单系统配置
 * 集中管理所有菜单的样式参数、深度设置等
 */

const MenuConfig = {
  // ==================== Depth 配置 ====================
  DEPTH: {
    OVERLAY: 90,   // 背景遮罩层
    MENU: 100      // 菜单容器层
  },

  // ==================== 背景遮罩配置 ====================
  OVERLAY: {
    COLOR: 0x000000,    // 黑色
    ALPHA: 0.7,         // 70% 不透明度
    INTERACTIVE: true   // 阻止鼠标穿透
  },

  // ==================== 暂停菜单配置 ====================
  PAUSE_MENU: {
    TITLE: 'PAUSED',
    TITLE_FONT_SIZE: '50px',
    TITLE_COLOR: '#fff',
    TITLE_FONT_STYLE: 'bold',

    BUTTON_WIDTH: 180,
    BUTTON_HEIGHT: 50,
    BUTTON_SPACING: 15,  // 按钮之间的间距
    BUTTON_FONT_SIZE: '24px',
    BUTTON_COLOR: '#4CAF50',
    BUTTON_TEXT_COLOR: '#fff',

    // 按钮位置（相对于菜单中心）
    TITLE_Y: -120,      // 标题位置
    RESUME_Y: 0,        // 第一个按钮
    RESTART_Y: 65,      // 第二个按钮 (50高度 + 15间距)
    MAINMENU_Y: 130     // 第三个按钮 (50高度 + 15间距)
  },

  // ==================== 游戏结束菜单配置 ====================
  GAMEOVER_MENU: {
    TITLE: 'GAME OVER',
    TITLE_FONT_SIZE: '40px',
    TITLE_COLOR: '#ff6b6b',
    TITLE_FONT_STYLE: 'bold',

    MESSAGE_FONT_SIZE: '28px',
    MESSAGE_COLOR: '#fff',

    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 60,
    BUTTON_FONT_SIZE: '28px',
    BUTTON_COLOR: '#FF6B6B',

    // 文本位置（相对于菜单中心）
    MESSAGE_Y: -50,
    BUTTON_Y: 80
  },

  // ==================== 通关菜单配置 ====================
  VICTORY_MENU: {
    TITLE: '🎉 恭喜通关！🎉',
    TITLE_FONT_SIZE: '50px',
    TITLE_COLOR: '#FFD700',
    TITLE_FONT_STYLE: 'bold',

    STATS_FONT_SIZE: '30px',
    STATS_COLOR: '#fff',

    BUTTON_WIDTH: 200,
    BUTTON_HEIGHT: 60,
    BUTTON_FONT_SIZE: '28px',
    BUTTON_COLOR: '#FFD700',

    HINT_FONT_SIZE: '18px',
    HINT_COLOR: '#aaa',

    // 元素位置（相对于菜单中心）
    TITLE_Y: -100,
    STATS_Y: 0,
    BUTTON_Y: 110,
    HINT_Y: 180
  },

  // ==================== 升级菜单配置（预留扩展） ====================
  UPGRADE_MENU: {
    TITLE: 'Choose Your Upgrade:',
    TITLE_FONT_SIZE: '40px',
    TITLE_COLOR: '#fff',

    OPTION_GRID_COLS: 3,
    OPTION_CARD_WIDTH: 150,
    OPTION_CARD_HEIGHT: 180,
    OPTION_CARD_SPACING: 50
  },

  // ==================== 主菜单配置（预留扩展） ====================
  MAIN_MENU: {
    TITLE: 'SPACE INVADERS',
    TITLE_FONT_SIZE: '60px',
    TITLE_COLOR: '#00ff00',
    TITLE_FONT_STYLE: 'bold',

    BUTTON_WIDTH: 250,
    BUTTON_HEIGHT: 60,
    BUTTON_SPACING: 80,
    BUTTON_FONT_SIZE: '28px',
    BUTTON_COLOR: '#00ff00',
    BUTTON_TEXT_COLOR: '#000'
  },

  // ==================== 设置菜单配置（预留扩展） ====================
  SETTINGS_MENU: {
    TITLE: 'Settings',
    TITLE_FONT_SIZE: '50px',
    TITLE_COLOR: '#fff',
    TITLE_FONT_STYLE: 'bold',

    LABEL_FONT_SIZE: '24px',
    LABEL_COLOR: '#fff',

    SLIDER_WIDTH: 200,
    SLIDER_HEIGHT: 10,

    BUTTON_WIDTH: 150,
    BUTTON_HEIGHT: 50,
    BUTTON_FONT_SIZE: '24px',
    BUTTON_COLOR: '#4CAF50'
  },

  // ==================== 确认对话框配置 ====================
  CONFIRM_MENU: {
    MESSAGE_FONT_SIZE: '24px',
    MESSAGE_COLOR: '#fff',

    BUTTON_WIDTH: 120,
    BUTTON_HEIGHT: 50,
    BUTTON_FONT_SIZE: '22px',
    BUTTON_SPACING: 30,

    CONFIRM_BUTTON_COLOR: '#FF6B6B',
    CANCEL_BUTTON_COLOR: '#4CAF50',
    BUTTON_TEXT_COLOR: '#fff',

    // 元素位置（相对于菜单中心）
    MESSAGE_Y: -40,
    CONFIRM_Y: 50,
    CANCEL_Y: 50
  }
};

module.exports = MenuConfig;
