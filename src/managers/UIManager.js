/**
 * UI Manager
 *
 * Manages all UI elements: HUD text displays, buttons, menus, and game state screens.
 * Handles text updates, pause menu, game over screen, and victory screen.
 */

const Phaser = require('phaser');
const GameConfig = require('../config/GameConfig');
const MenuManager = require('./MenuManager');

class UIManager {
    /**
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     * @param {ScoreManager} scoreManager - Score manager reference for initial values
     */
    constructor(scene, scoreManager) {
        this.scene = scene;
        this.scoreManager = scoreManager;

        // Initialize menu manager
        this.menuManager = new MenuManager(scene);

        // HUD text objects
        this.waveText = null;
        this.highScoreText = null;
        this.scoreText = null;
        this.livesText = null;
        this.fpsText = null;

        // Pause menu objects
        this.pauseText = null;
        this.pauseResumeButton = null;
        this.pauseRestartButton = null;
        this.pauseButton = null;

        // GM test button
        this.gmButton = null;

        // Virtual buttons (mobile only)
        this.virtualButtons = {
            left: null,
            right: null
        };
        this.virtualButtonStates = {
            left: false,
            right: false
        };

        // Initialize HUD
        this.createHUD();
    }

    /**
     * Create all HUD elements
     */
    createHUD() {
        // Wave text (top center)
        this.waveText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            15,
            'WAVE: 1/5', // Will be updated by game logic
            {
                fontSize: '28px',
                fill: '#ffd700',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0);

        // High score (top left)
        this.highScoreText = this.scene.add.text(
            10,
            10,
            `High Score: ${this.scoreManager.getHighScore()}`,
            {
                fontSize: '20px',
                fill: '#ffd700'
            }
        );

        // Current score (below high score)
        this.scoreText = this.scene.add.text(
            10,
            35,
            'Score: 0',
            {
                fontSize: '20px',
                fill: '#fff'
            }
        );

        // Lives (below score, with spacing)
        this.livesText = this.scene.add.text(
            10,
            85,
            `Lives: ${GameConfig.GAME.INITIAL_LIVES}`,
            {
                fontSize: '20px',
                fill: '#fff'
            }
        );

        // FPS counter (if enabled)
        if (GameConfig.UI.SHOW_FPS) {
            this.fpsText = this.scene.add.text(
                GameConfig.UI.FPS_X,
                GameConfig.UI.FPS_Y,
                'FPS: 60',
                {
                    fontSize: '16px',
                    fill: '#0f0',
                    fontFamily: 'monospace'
                }
            );
        }

        // Pause text
        this.pauseText = this.scene.add.text(
            400,
            200,
            'PAUSED',
            {
                fontSize: '50px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5).setVisible(false);

        // Pause menu buttons
        this.pauseResumeButton = this.createButton(
            400,
            300,
            'Resume',
            null, // Callback will be set by showPauseMenu
            { width: 180, height: 50 }
        );
        this.pauseResumeButton.setVisible(false);

        this.pauseRestartButton = this.createButton(
            400,
            370,
            'Restart',
            null, // Callback will be set by showPauseMenu
            { width: 180, height: 50 }
        );
        this.pauseRestartButton.setVisible(false);

        // Pause button (top-right corner)
        this.pauseButton = this.createButton(
            this.scene.cameras.main.width - 80,
            40,
            '❚❚',
            null, // Callback will be set externally
            {
                width: 60,
                height: 40,
                fontSize: '20px'
            }
        );

        // GM test button (below pause button) - only in debug mode
        if (GameConfig.DEBUG.ENABLE_GM_TOOLS) {
            this.gmButton = this.createButton(
                this.scene.cameras.main.width - 80,
                95,
                'GM',
                null, // Callback will be set externally
                {
                    width: 60,
                    height: 40,
                    fontSize: '18px',
                    bgColor: 0xff0000,
                    bgAlpha: 0.8
                }
            );
        }

        // Create virtual buttons for mobile
        this.createVirtualButtons();
    }

    /**
     * Create an interactive button
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {Function} callback - Click callback
     * @param {object} options - Style options
     * @returns {Phaser.GameObjects.Container}
     */
    createButton(x, y, text, callback, options = {}) {
        const config = {
            width: options.width || 200,
            height: options.height || 60,
            fontSize: options.fontSize || '24px',
            bgColor: options.bgColor || 0x000000,
            bgAlpha: options.bgAlpha || 0.7,
            textColor: options.textColor || '#ffffff',
            borderColor: options.borderColor || 0xffffff,
            borderWidth: options.borderWidth || 2
        };

        const container = this.scene.add.container(x, y);
        const bg = this.scene.add.graphics();
        bg.fillStyle(config.bgColor, config.bgAlpha);
        bg.lineStyle(config.borderWidth, config.borderColor, 1);
        bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
        bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);

        const buttonText = this.scene.add.text(0, 0, text, {
            fontSize: config.fontSize,
            fill: config.textColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, buttonText]);

        container.setInteractive(
            new Phaser.Geom.Rectangle(-config.width / 2, -config.height / 2, config.width, config.height),
            Phaser.Geom.Rectangle.Contains
        );

        container.on('pointerdown', () => {
            container.setScale(0.95);
            bg.clear();
            bg.fillStyle(config.bgColor, config.bgAlpha + 0.2);
            bg.lineStyle(config.borderWidth, config.borderColor, 1);
            bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
            bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
        });

        container.on('pointerup', () => {
            container.setScale(1);
            bg.clear();
            bg.fillStyle(config.bgColor, config.bgAlpha);
            bg.lineStyle(config.borderWidth, config.borderColor, 1);
            bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
            bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
            if (callback) {
                callback();
            }
        });

        container.on('pointerout', () => {
            container.setScale(1);
            bg.clear();
            bg.fillStyle(config.bgColor, config.bgAlpha);
            bg.lineStyle(config.borderWidth, config.borderColor, 1);
            bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
            bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
        });

        return container;
    }

    /**
     * Create virtual control buttons for mobile devices
     * Extensible design: easily add more buttons by configuring in GameConfig
     */
    createVirtualButtons() {
        const btnConfig = GameConfig.UI.VIRTUAL_BUTTONS;

        // Only create on mobile if enabled
        if (!btnConfig.ENABLED) {
            return;
        }

        // Check if mobile device
        // const isMobile = !this.scene.sys.game.device.os.desktop;
        // if (!isMobile) {
        //     return; // Skip on desktop
        // }

        // Dynamically calculate button positions based on configuration
        const gameWidth = this.scene.scale.width;
        const rightButtonX = gameWidth - btnConfig.PADDING_RIGHT - btnConfig.BUTTON_WIDTH / 2;
        const leftButtonX = rightButtonX - btnConfig.BUTTON_WIDTH - btnConfig.BUTTON_SPACING;

        // Create Left button
        this.virtualButtons.left = this.createVirtualButton(
            leftButtonX,
            btnConfig.BUTTON_Y,
            btnConfig.LEFT_BUTTON.LABEL,
            'left',
            btnConfig
        );

        // Create Right button
        this.virtualButtons.right = this.createVirtualButton(
            rightButtonX,
            btnConfig.BUTTON_Y,
            btnConfig.RIGHT_BUTTON.LABEL,
            'right',
            btnConfig
        );

        // Future buttons can be added here following the same pattern:
        // this.virtualButtons.fire = this.createVirtualButton(
        //     btnConfig.FIRE_BUTTON.X,
        //     btnConfig.BUTTON_Y,
        //     btnConfig.FIRE_BUTTON.LABEL,
        //     'fire',
        //     btnConfig
        // );
    }

    /**
     * Create a single virtual button (rectangular with rounded corners)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} label - Button label text
     * @param {string} buttonKey - Key for state tracking ('left', 'right', etc.)
     * @param {object} config - Button configuration
     * @returns {Phaser.GameObjects.Container}
     */
    createVirtualButton(x, y, label, buttonKey, config) {
        const container = this.scene.add.container(x, y);
        const width = config.BUTTON_WIDTH;
        const height = config.BUTTON_HEIGHT;
        const radius = config.BUTTON_RADIUS;

        // Create rounded rectangle background
        const rect = this.scene.add.graphics();
        rect.fillStyle(0x000000, config.BUTTON_ALPHA);
        rect.lineStyle(2, 0xffffff, 0.6);
        rect.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        rect.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

        // Create label text
        const buttonText = this.scene.add.text(0, 0, label, {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([rect, buttonText]);

        // Make interactive - use rectangle hit area
        container.setInteractive(
            new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        container.setDepth(100); // Ensure buttons are above game objects

        // Handle touch events
        container.on('pointerdown', () => {
            this.virtualButtonStates[buttonKey] = true;
            container.setAlpha(config.BUTTON_PRESSED_ALPHA);
        });

        container.on('pointerup', () => {
            this.virtualButtonStates[buttonKey] = false;
            container.setAlpha(config.BUTTON_ALPHA);
        });

        container.on('pointerout', () => {
            this.virtualButtonStates[buttonKey] = false;
            container.setAlpha(config.BUTTON_ALPHA);
        });

        return container;
    }

    /**
     * Get virtual button state
     * @param {string} button - Button key ('left', 'right', etc.)
     * @returns {boolean} - Whether button is pressed
     */
    getVirtualButtonState(button) {
        return this.virtualButtonStates[button] || false;
    }

    /**
     * Update score display
     * @param {number} score - Current score
     */
    updateScore(score) {
        if (this.scoreText) {
            this.scoreText.setText('Score: ' + score);
        }
    }

    /**
     * Update high score display
     * @param {number} highScore - High score
     */
    updateHighScore(highScore) {
        if (this.highScoreText) {
            this.highScoreText.setText(`High Score: ${highScore}`);
        }
    }

    /**
     * Update lives display
     * @param {number} lives - Remaining lives
     */
    updateLives(lives) {
        if (this.livesText) {
            this.livesText.setText(`Lives: ${lives}`);
        }
    }

    /**
     * Update wave display
     * @param {number} current - Current wave
     * @param {number} max - Max waves
     */
    updateWave(current, max) {
        if (this.waveText) {
            this.waveText.setText(`WAVE: ${current}/${max}`);
        }
    }

    /**
     * Update FPS display
     * @param {number} fps - Current FPS
     */
    updateFPS(fps) {
        if (this.fpsText) {
            this.fpsText.setText('FPS: ' + fps);
        }
    }

    /**
     * Show pause menu (delegated to MenuManager)
     * @param {Function} onResume - Resume callback
     * @param {Function} onRestart - Restart callback
     */
    showPauseMenu(onResume, onRestart) {
        this.menuManager.showMenu('pause', {
            onResume: onResume,
            onRestart: onRestart
        });
    }

    /**
     * Hide pause menu (delegated to MenuManager)
     */
    hidePauseMenu() {
        this.menuManager.hideMenu('pause');
    }

    /**
     * Get pause button (for external callback registration)
     * @returns {Phaser.GameObjects.Container}
     */
    getPauseButton() {
        return this.pauseButton;
    }

    /**
     * Get GM test button (for external callback registration)
     * @returns {Phaser.GameObjects.Container}
     */
    getGMButton() {
        return this.gmButton;
    }

    /**
     * Update pause button icon based on game state
     * @param {boolean} isPaused - Whether the game is paused
     */
    updatePauseButtonIcon(isPaused) {
        if (!this.pauseButton) return;

        // Determine icon based on pause state
        const icon = isPaused ? '▶' : '❚❚';

        // Find and update the text child in the button container
        const buttonChildren = this.pauseButton.list;
        const textObject = buttonChildren.find(child => child.type === 'Text');

        if (textObject) {
            textObject.setText(icon);
        }
    }

    /**
     * Show game over screen (delegated to MenuManager)
     * @param {number} score - Final score
     * @param {number} highScore - High score
     * @param {boolean} isNewRecord - Whether it's a new record
     * @param {Function} onRestart - Restart callback
     */
    showGameOver(score, highScore, isNewRecord, onRestart) {
        this.menuManager.showMenu('gameOver', {
            score: score,
            highScore: highScore,
            isNewRecord: isNewRecord,
            onRestart: onRestart
        });
    }

    /**
     * Show victory screen (delegated to MenuManager)
     * @param {number} score - Final score
     * @param {number} lives - Remaining lives
     * @param {Function} onContinue - Continue callback
     */
    showVictory(score, lives, onContinue) {
        this.menuManager.showMenu('victory', {
            score: score,
            lives: lives,
            onContinue: onContinue
        });
    }

    /**
     * Cleanup all UI resources
     */
    shutdown() {
        // Cleanup menu manager
        if (this.menuManager) {
            this.menuManager.shutdown();
        }

        // Destroy HUD elements
        if (this.waveText) this.waveText.destroy();
        if (this.highScoreText) this.highScoreText.destroy();
        if (this.scoreText) this.scoreText.destroy();
        if (this.livesText) this.livesText.destroy();
        if (this.fpsText) this.fpsText.destroy();

        // Destroy pause menu
        if (this.pauseText) this.pauseText.destroy();
        if (this.pauseResumeButton) this.pauseResumeButton.destroy();
        if (this.pauseRestartButton) this.pauseRestartButton.destroy();
        if (this.pauseButton) this.pauseButton.destroy();

        // Destroy GM button
        if (this.gmButton) this.gmButton.destroy();

        // Destroy virtual buttons
        if (this.virtualButtons.left) this.virtualButtons.left.destroy();
        if (this.virtualButtons.right) this.virtualButtons.right.destroy();

        // Clear references
        this.waveText = null;
        this.highScoreText = null;
        this.scoreText = null;
        this.livesText = null;
        this.fpsText = null;
        this.pauseText = null;
        this.pauseResumeButton = null;
        this.pauseRestartButton = null;
        this.pauseButton = null;
        this.gmButton = null;
        this.virtualButtons = { left: null, right: null };
        this.virtualButtonStates = { left: false, right: false };
    }
}

module.exports = UIManager;
