/**
 * Input Manager
 *
 * Manages all input sources: keyboard controls, touch controls, and device detection.
 * Provides unified input state queries for game logic.
 */

const Phaser = require('phaser');

class InputManager {
    /**
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     */
    constructor(scene) {
        this.scene = scene;

        // Device detection (cached)
        this._isMobileDevice = !scene.sys.game.device.os.desktop;

        // Keyboard input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.spaceBar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // WASD keys
        this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // Touch input state
        this.isTouchLeft = false;
        this.isTouchRight = false;

        // Touch target tracking (for mobile auto-movement)
        this.touchTargetX = null;
        this.hasTouchTarget = false;

        // Touch event handlers (only on mobile)
        this.touchDownHandler = null;
        this.touchUpHandler = null;
        this.touchMoveHandler = null;

        // DOM touch event handlers (for capturing touches outside canvas)
        this.domTouchStartHandler = null;
        this.domTouchMoveHandler = null;
        this.domTouchEndHandler = null;

        // Pause callback
        this.pauseCallback = null;

        // Initialize touch controls if mobile
        if (this._isMobileDevice) {
            this.initializeTouchControls();
        }
    }

    /**
     * Initialize touch controls for mobile devices
     * Uses DOM touch events to capture touches even outside the game canvas (e.g., letterbox areas)
     */
    initializeTouchControls() {
        // DOM touch event handlers
        this.domTouchStartHandler = (e) => {
            // Prevent default behavior (like scrolling)
            e.preventDefault();

            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const gameX = this.screenToGameX(touch.clientX);

                this.touchTargetX = gameX;
                this.hasTouchTarget = true;
            }
        };

        this.domTouchMoveHandler = (e) => {
            e.preventDefault();

            if (this.hasTouchTarget && e.touches.length > 0) {
                const touch = e.touches[0];
                const gameX = this.screenToGameX(touch.clientX);

                this.touchTargetX = gameX;
            }
        };

        this.domTouchEndHandler = (e) => {
            e.preventDefault();

            // Clear touch target when all touches end
            if (e.touches.length === 0) {
                this.touchTargetX = null;
                this.hasTouchTarget = false;

                // Legacy support
                this.isTouchLeft = false;
                this.isTouchRight = false;
            }
        };

        // Listen to window touch events to capture touches outside canvas
        window.addEventListener('touchstart', this.domTouchStartHandler, { passive: false });
        window.addEventListener('touchmove', this.domTouchMoveHandler, { passive: false });
        window.addEventListener('touchend', this.domTouchEndHandler, { passive: false });
    }

    /**
     * Convert screen coordinates to game world coordinates
     * Handles Phaser's scale mode (FIT) and canvas offset (letterboxing)
     * @param {number} screenX - Screen X coordinate from touch event
     * @returns {number} - Game world X coordinate (0-800)
     */
    screenToGameX(screenX) {
        const canvas = this.scene.game.canvas;
        const scale = this.scene.scale;

        // Get canvas position on screen
        const canvasRect = canvas.getBoundingClientRect();

        // Convert screen coordinate to canvas coordinate
        const canvasX = screenX - canvasRect.left;

        // Convert canvas coordinate to game world coordinate
        // displayScale accounts for the FIT scale mode
        const gameX = canvasX / scale.displayScale.x;

        // Clamp to game bounds (0 to game width)
        return Phaser.Math.Clamp(gameX, 0, scale.gameSize.width);
    }

    /**
     * Register callback for pause requests (ESC key)
     * @param {Function} callback - Function to call when pause is requested
     */
    onPauseRequested(callback) {
        this.pauseCallback = callback;
        this.scene.input.keyboard.on('keydown-ESC', callback);
    }

    /**
     * Check if left movement is active (keyboard or touch)
     * @returns {boolean}
     */
    isLeftPressed() {
        return this.cursors.left.isDown || this.keyA.isDown || this.isTouchLeft;
    }

    /**
     * Check if right movement is active (keyboard or touch)
     * @returns {boolean}
     */
    isRightPressed() {
        return this.cursors.right.isDown || this.keyD.isDown || this.isTouchRight;
    }

    /**
     * Check if up movement is active (reserved for future use)
     * @returns {boolean}
     */
    isUpPressed() {
        return this.cursors.up.isDown || this.keyW.isDown;
    }

    /**
     * Check if down movement is active (reserved for future use)
     * @returns {boolean}
     */
    isDownPressed() {
        return this.cursors.down.isDown || this.keyS.isDown;
    }

    /**
     * Check if shoot action is active
     * On PC: Space bar
     * On Mobile: Always true (auto-fire handled by game logic)
     * @returns {boolean}
     */
    isShootPressed() {
        if (this._isMobileDevice) {
            // Mobile: auto-fire (always return true)
            return true;
        } else {
            // PC: manual shooting with space bar
            return this.spaceBar.isDown;
        }
    }

    /**
     * Check if device is mobile/tablet
     * @returns {boolean}
     */
    isMobileDevice() {
        return this._isMobileDevice;
    }

    /**
     * Get touch target X position (for mobile auto-movement)
     * @returns {number|null} - Touch target X position, or null if no target
     */
    getTouchTargetX() {
        return this.hasTouchTarget ? this.touchTargetX : null;
    }

    /**
     * Check if there is an active touch target
     * @returns {boolean}
     */
    hasTouchTargetActive() {
        return this.hasTouchTarget;
    }

    /**
     * Cleanup input resources
     */
    shutdown() {
        // Remove DOM touch event listeners
        if (this.domTouchStartHandler) {
            window.removeEventListener('touchstart', this.domTouchStartHandler);
            this.domTouchStartHandler = null;
        }
        if (this.domTouchMoveHandler) {
            window.removeEventListener('touchmove', this.domTouchMoveHandler);
            this.domTouchMoveHandler = null;
        }
        if (this.domTouchEndHandler) {
            window.removeEventListener('touchend', this.domTouchEndHandler);
            this.domTouchEndHandler = null;
        }

        // Remove pause callback
        if (this.pauseCallback) {
            this.scene.input.keyboard.off('keydown-ESC', this.pauseCallback);
            this.pauseCallback = null;
        }
    }
}

module.exports = InputManager;
