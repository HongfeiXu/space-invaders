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

        // Touch event handlers (only on mobile)
        this.touchDownHandler = null;
        this.touchUpHandler = null;

        // Pause callback
        this.pauseCallback = null;

        // Initialize touch controls if mobile
        if (this._isMobileDevice) {
            this.initializeTouchControls();
        }
    }

    /**
     * Initialize touch controls for mobile devices
     */
    initializeTouchControls() {
        // Save handler references for cleanup
        this.touchDownHandler = (pointer) => {
            // Don't handle touch if game is paused or over
            // (checked in GameScene, but we can filter here too if needed)

            const halfWidth = this.scene.cameras.main.width / 2;
            if (pointer.x < halfWidth) {
                this.isTouchLeft = true;
            } else {
                this.isTouchRight = true;
            }
        };

        this.touchUpHandler = () => {
            this.isTouchLeft = false;
            this.isTouchRight = false;
        };

        this.scene.input.on('pointerdown', this.touchDownHandler);
        this.scene.input.on('pointerup', this.touchUpHandler);
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
     * Cleanup input resources
     */
    shutdown() {
        // Remove touch event listeners
        if (this.touchDownHandler) {
            this.scene.input.off('pointerdown', this.touchDownHandler);
            this.touchDownHandler = null;
        }
        if (this.touchUpHandler) {
            this.scene.input.off('pointerup', this.touchUpHandler);
            this.touchUpHandler = null;
        }

        // Remove pause callback
        if (this.pauseCallback) {
            this.scene.input.keyboard.off('keydown-ESC', this.pauseCallback);
            this.pauseCallback = null;
        }
    }
}

module.exports = InputManager;
