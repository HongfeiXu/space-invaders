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
    INITIAL_Y: 550,       // Spawn position Y
    BULLET_SPEED: 400,    // Upward velocity of player bullets (px/s)
    SHOOT_COOLDOWN: 250   // Minimum delay between shots (ms)
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
    START_X: 100,         // X position of first enemy
    START_Y: 50           // Y position of first enemy
  },

  // Visual effects
  EFFECTS: {
    BLINK_ALPHA: 0.3,     // Transparency when hit (0.0-1.0)
    BLINK_DURATION: 80,   // Duration of each blink (ms)
    BLINK_REPEAT: 3       // Number of blink cycles
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
    FPS_Y: 580            // FPS position Y (changed from 40 to 580 for bottom-left)
  },

  // Audio configuration
  AUDIO: {
    BACKGROUND_MUSIC_VOLUME: 0.5,  // Background music volume (0.0-1.0)
    BACKGROUND_MUSIC_LOOP: true    // Background music loops
  }
};
