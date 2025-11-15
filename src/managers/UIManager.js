/**
 * UI Manager
 *
 * Manages all UI elements: HUD text displays, buttons, menus, and game state screens.
 * Handles text updates, pause menu, game over screen, and victory screen.
 */

const Phaser = require('phaser');
const GameConfig = require('../config/GameConfig');

class UIManager {
    /**
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     * @param {ScoreManager} scoreManager - Score manager reference for initial values
     */
    constructor(scene, scoreManager) {
        this.scene = scene;
        this.scoreManager = scoreManager;

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

        // Victory screen objects
        this.victoryTitle = null;
        this.statsText = null;
        this.continueButton = null;
        this.continueHint = null;

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
        const isMobile = !this.scene.sys.game.device.os.desktop;
        if (!isMobile) {
            return; // Skip on desktop
        }

        // Create Left button
        this.virtualButtons.left = this.createVirtualButton(
            btnConfig.LEFT_BUTTON.X,
            btnConfig.BUTTON_Y,
            btnConfig.LEFT_BUTTON.LABEL,
            'left',
            btnConfig
        );

        // Create Right button
        this.virtualButtons.right = this.createVirtualButton(
            btnConfig.RIGHT_BUTTON.X,
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
     * Create a single virtual button (circular)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} label - Button label text
     * @param {string} buttonKey - Key for state tracking ('left', 'right', etc.)
     * @param {object} config - Button configuration
     * @returns {Phaser.GameObjects.Container}
     */
    createVirtualButton(x, y, label, buttonKey, config) {
        const container = this.scene.add.container(x, y);
        const radius = config.BUTTON_SIZE / 2;

        // Create circle background
        const circle = this.scene.add.graphics();
        circle.fillStyle(0x333333, config.BUTTON_ALPHA);
        circle.lineStyle(3, 0xffffff, 0.8);
        circle.fillCircle(0, 0, radius);
        circle.strokeCircle(0, 0, radius);

        // Create label text
        const buttonText = this.scene.add.text(0, 0, label, {
            fontSize: '40px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([circle, buttonText]);

        // Make interactive
        container.setInteractive(
            new Phaser.Geom.Circle(0, 0, radius),
            Phaser.Geom.Circle.Contains
        );
        container.setDepth(100); // Ensure buttons are above game objects

        // Handle touch events
        container.on('pointerdown', () => {
            this.virtualButtonStates[buttonKey] = true;
            container.setAlpha(config.BUTTON_PRESSED_ALPHA);
        });

        container.on('pointerup', () => {
            this.virtualButtonStates[buttonKey] = false;
            container.setAlpha(1.0);
        });

        container.on('pointerout', () => {
            this.virtualButtonStates[buttonKey] = false;
            container.setAlpha(1.0);
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
     * Show pause menu
     * @param {Function} onResume - Resume callback
     * @param {Function} onRestart - Restart callback
     */
    showPauseMenu(onResume, onRestart) {
        if (this.pauseText) {
            this.pauseText.setVisible(true);
        }
        if (this.pauseResumeButton) {
            // Update callback and show
            this.pauseResumeButton.removeAllListeners('pointerup');
            this.pauseResumeButton.on('pointerup', () => {
                this.pauseResumeButton.setScale(1);
                onResume();
            });
            this.pauseResumeButton.setVisible(true);
        }
        if (this.pauseRestartButton) {
            // Update callback and show
            this.pauseRestartButton.removeAllListeners('pointerup');
            this.pauseRestartButton.on('pointerup', () => {
                this.pauseRestartButton.setScale(1);
                onRestart();
            });
            this.pauseRestartButton.setVisible(true);
        }
    }

    /**
     * Hide pause menu
     */
    hidePauseMenu() {
        if (this.pauseText) {
            this.pauseText.setVisible(false);
        }
        if (this.pauseResumeButton) {
            this.pauseResumeButton.setVisible(false);
        }
        if (this.pauseRestartButton) {
            this.pauseRestartButton.setVisible(false);
        }
    }

    /**
     * Get pause button (for external callback registration)
     * @returns {Phaser.GameObjects.Container}
     */
    getPauseButton() {
        return this.pauseButton;
    }

    /**
     * Show game over screen
     * @param {number} score - Final score
     * @param {number} highScore - High score
     * @param {boolean} isNewRecord - Whether it's a new record
     * @param {Function} onRestart - Restart callback
     */
    showGameOver(score, highScore, isNewRecord, onRestart) {
        let gameOverMessage = 'GAME OVER\n';
        gameOverMessage += 'Score: ' + score + '\n';
        gameOverMessage += 'High Score: ' + highScore;
        if (isNewRecord) {
            gameOverMessage += '\n🎉 NEW RECORD! 🎉';
        }

        const gameOverText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 60,
            gameOverMessage,
            {
                fontSize: '40px',
                fill: isNewRecord ? '#FFD700' : '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Restart button
        this.createButton(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 100,
            'Restart',
            onRestart,
            { width: 200, height: 60, fontSize: '28px' }
        );
    }

    /**
     * Show victory screen
     * @param {number} score - Final score
     * @param {number} lives - Remaining lives
     * @param {Function} onContinue - Continue callback
     */
    showVictory(score, lives, onContinue) {
        // Clean up any existing victory elements
        this.hideVictory();

        this.victoryTitle = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            '🎉 恭喜通关！🎉',
            {
                fontSize: '50px',
                fill: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.statsText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            `Score: ${score}\nLives: ${lives}`,
            {
                fontSize: '30px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.continueButton = this.createButton(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 110,
            'Continue',
            onContinue,
            { width: 200, height: 60, fontSize: '28px' }
        );

        this.continueHint = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 180,
            '(Restart from Wave 1)',
            {
                fontSize: '18px',
                fill: '#aaa',
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    /**
     * Hide victory screen
     */
    hideVictory() {
        if (this.victoryTitle) {
            this.victoryTitle.destroy();
            this.victoryTitle = null;
        }
        if (this.statsText) {
            this.statsText.destroy();
            this.statsText = null;
        }
        if (this.continueButton) {
            this.continueButton.destroy();
            this.continueButton = null;
        }
        if (this.continueHint) {
            this.continueHint.destroy();
            this.continueHint = null;
        }
    }

    /**
     * Cleanup all UI resources
     */
    shutdown() {
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

        // Destroy virtual buttons
        if (this.virtualButtons.left) this.virtualButtons.left.destroy();
        if (this.virtualButtons.right) this.virtualButtons.right.destroy();

        // Destroy victory screen
        this.hideVictory();

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
        this.virtualButtons = { left: null, right: null };
        this.virtualButtonStates = { left: false, right: false };
    }
}

module.exports = UIManager;
