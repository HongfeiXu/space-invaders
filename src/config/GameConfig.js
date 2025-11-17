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
    FIRE_INTERVAL: 1000   // Interval between enemy shots (ms)
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
  }
};
