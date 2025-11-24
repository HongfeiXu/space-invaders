/**
 * Game Configuration
 *
 * Centralized configuration for all game parameters.
 * Modify values here to adjust gameplay without touching game logic.
 */

module.exports = {
  // Player configuration
  PLAYER: {
    SPEED: 250,           // Movement speed (px/s)
    INITIAL_X: 400,       // Spawn position X
    INITIAL_Y: 800,      // Spawn position Y (moved up to avoid bottom buttons)
    BULLET_SPEED: 400,    // Upward velocity of player bullets (px/s)
    SHOOT_COOLDOWN: 250,  // Minimum delay between shots (ms) - PC
    MOBILE_SHOOT_COOLDOWN: 500,  // Minimum delay between shots (ms) - Mobile (auto-fire)
    HIT_BLINK_DURATION: 500,    // Duration of blink when hit (ms)
    INVINCIBLE_DURATION: 500,   // Duration of invincibility after respawn (ms)
    HIT_TEXT_DURATION: 500      // Duration of HIT! text display (ms)
  },

  // Enemy configuration
  ENEMY: {
    SPEED_MIN: -50,       // Minimum horizontal velocity (px/s)
    SPEED_MAX: 50,        // Maximum horizontal velocity (px/s)
    BULLET_SPEED: 200,    // Downward velocity of enemy bullets (px/s)
    FIRE_INTERVAL: 1000,  // Interval between enemy shots (ms)

    // 射击系统（模块化配置，支持多种AI方案切换）
    SHOOTING: {
        CURRENT_MODE: 'AIMED',  // 'RANDOM' | 'AIMED' | 'FORMATION' | 'POSITIONING'

        // 方案1：预测性射击
        AIMED: {
            ENABLED: true,              // 启用瞄准射击
            START_WAVE: 2,              // 从 Wave 2 开始启用
            BASE_PROBABILITY: 0.3,      // Wave 2 初始瞄准概率 30%
            PROBABILITY_INCREMENT: 0.15, // 每波增加 15% 瞄准概率
            PREDICTION_FACTOR: 0.3,     // 预判系数（0.3 = 保守）
            ACCURACY: 0.8,              // 瞄准精度 80%
            SHOW_WARNING: true,         // 射击前显示视觉警告
            WARNING_DURATION: 200,      // 警告持续时间 (ms)

            // 视觉警告效果配置
            WARNING_VISUALS: {
                BORDER_WIDTH: 4,        // 边框宽度 (px)
                BORDER_COLOR: 0xff0000, // 边框颜色（红色）
                BORDER_PADDING: 3,      // 边框与敌人的间距 (px)
                SCALE_FACTOR: 1.3,      // 敌人放大倍数
                BLINK_COUNT: 4          // 闪烁次数
            }
        },

        // 方案2：编队射击（预留）
        FORMATION: {
            ENABLED: false,                // 暂未实现
            COLUMN_SALVO_PROBABILITY: 0.3, // 纵列齐射概率
            FAN_PATTERN_ANGLES: [-15, 0, 15] // 扇形弹幕角度
        },

        // 方案3：智能站位（预留）
        POSITIONING: {
            ENABLED: false,     // 暂未实现
            START_WAVE: 3,      // 从第3波开始
            STRATEGY: 'SPREAD'  // 'SPREAD'(分散) | 'CLUSTER'(聚集)
        }
    }
  },

  // Enemy spawn formation layout
  ENEMY_SPAWN: {
    ROWS: 3,              // Number of enemy rows
    COLS: 5,              // Number of enemy columns
    SPACING_X: 80,        // Horizontal spacing between enemies (px)
    SPACING_Y: 60,        // Vertical spacing between enemies (px)
    START_X: 260,         // X position of first enemy (centered on 800px canvas)
    START_Y: 185           // Y position of first enemy (避免与顶部 UI 重叠)
  },

  // Visual effects
  EFFECTS: {
    BLINK_ALPHA: 0.3,           // Transparency when hit (0.0-1.0)
    BLINK_DURATION: 80,         // Duration of each blink (ms)
    BLINK_REPEAT: 3,            // Number of blink cycles
    BLINK_CYCLE_DURATION: 50    // Duration of each blink cycle (ms)
  },

  // Game rules
  GAME: {
    INITIAL_LIVES: 3,     // Starting lives
    POINTS_PER_ENEMY: 10  // Score for destroying an enemy
  },

  // UI configuration
  UI: {
    SHOW_FPS: true,       // Display FPS counter
    FPS_X: 10,            // FPS position X
    FPS_Y: 1100,            // FPS position Y (top-left, to avoid button area)

    // Virtual button configuration (all platforms, extensible)
    VIRTUAL_BUTTONS: {
      ENABLED: true,                // Enable virtual buttons on all platforms
      BUTTON_WIDTH: 195,            // Button width (px)
      BUTTON_HEIGHT: 180,            // Button height (px)
      BUTTON_RADIUS: 0,            // Border radius for rounded corners (px)
      BUTTON_SPACING: 1,           // Spacing between buttons (px)
      PADDING_RIGHT: 20,            // Padding from right edge (px)
      PADDING_BOTTOM: 20,           // Padding from bottom edge (px)
      BUTTON_Y: 1000,                // Y position of button centers
      BUTTON_ALPHA: 0.5,            // Button transparency (0.0-1.0)
      BUTTON_PRESSED_ALPHA: 0.7,    // Button transparency when pressed

      // Left button (X position calculated dynamically)
      LEFT_BUTTON: {
        LABEL: '←'                  // Display label
      },

      // Right button (X position calculated dynamically)
      RIGHT_BUTTON: {
        LABEL: '→'                  // Display label
      }

      // Future buttons can be added here, e.g.:
      // FIRE_BUTTON: { X: 400, LABEL: '🔥' }
    }
  },

  // Audio configuration
  AUDIO: {
    BACKGROUND_MUSIC_VOLUME: 0.5,  // Background music volume (0.0-1.0)
    BACKGROUND_MUSIC_LOOP: true    // Background music loops
  },

  // Wave system configuration
  WAVE: {
    INITIAL_WAVE: 1,           // Starting wave number
    MAX_WAVE: 5,               // Maximum wave (victory after this)
    FIRE_RATE_MULTIPLIER: 0.85, // Enemy fire interval reduction per wave
    MIN_FIRE_INTERVAL: 400,    // Minimum enemy fire interval (ms)
    TRANSITION_DELAY: 2000     // Delay before spawning next wave (ms)
  },

  // Debug and development tools
  DEBUG: {
    ENABLE_GM_TOOLS: true      // Enable GM test button (set to false in production)
  }
};
