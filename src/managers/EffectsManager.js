/**
 * Effects Manager
 *
 * Manages all visual effects including blink animations, text effects, and tweens.
 * Handles sprite animations, UI transitions, and temporary visual feedback.
 */

const GameConfig = require('../config/GameConfig');

class EffectsManager {
    /**
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.playerBlinkTween = null;
    }

    /**
     * Create a simple blink effect on a sprite (for enemy hits)
     * @param {Phaser.GameObjects.Sprite} sprite - The sprite to blink
     * @param {Function} onComplete - Callback when blink completes (typically destroys sprite)
     */
    blinkSprite(sprite, onComplete) {
        this.scene.tweens.add({
            targets: sprite,
            alpha: GameConfig.EFFECTS.BLINK_ALPHA,
            duration: GameConfig.EFFECTS.BLINK_DURATION,
            yoyo: true,
            repeat: GameConfig.EFFECTS.BLINK_REPEAT,
            onComplete: () => {
                if (onComplete) {
                    onComplete();
                }
            }
        });
    }

    /**
     * Create player hit effect with two-stage blink and respawn
     * @param {Phaser.GameObjects.Sprite} player - The player sprite
     * @param {Function} onInvincibilityEnd - Callback when invincibility ends
     */
    playerHitEffect(player, onInvincibilityEnd) {
        // Clean up previous blink animation if exists
        if (this.playerBlinkTween) {
            this.playerBlinkTween.stop();
            this.playerBlinkTween = null;
        }

        // Ensure player is visible
        player.setAlpha(1);

        // Stage 1: Blink while hit (0.5s)
        const blinkDuration = GameConfig.PLAYER.HIT_BLINK_DURATION;
        const blinkCycleDuration = GameConfig.EFFECTS.BLINK_CYCLE_DURATION;
        const blinkCycles = Math.floor(blinkDuration / blinkCycleDuration);

        this.playerBlinkTween = this.scene.tweens.add({
            targets: player,
            alpha: { from: 1, to: GameConfig.EFFECTS.BLINK_ALPHA },
            duration: blinkCycleDuration / 2,
            yoyo: true,
            repeat: blinkCycles - 1,
            onComplete: () => {
                // Respawn player at initial position
                player.setPosition(GameConfig.PLAYER.INITIAL_X, GameConfig.PLAYER.INITIAL_Y);
                player.setVelocity(0, 0);
                player.setAlpha(1);

                // Stage 2: Blink during invincibility (0.5s)
                const invincibleBlinkDuration = GameConfig.PLAYER.INVINCIBLE_DURATION;
                const invincibleBlinkCycles = Math.floor(invincibleBlinkDuration / blinkCycleDuration);

                this.playerBlinkTween = this.scene.tweens.add({
                    targets: player,
                    alpha: { from: 1, to: GameConfig.EFFECTS.BLINK_ALPHA },
                    duration: blinkCycleDuration / 2,
                    yoyo: true,
                    repeat: invincibleBlinkCycles - 1,
                    onComplete: () => {
                        // Restore normal state
                        player.setAlpha(1);
                        this.playerBlinkTween = null;
                        if (onInvincibilityEnd) {
                            onInvincibilityEnd();
                        }
                    }
                });
            }
        });
    }

    /**
     * Show HIT! text at screen center
     */
    showHitText() {
        const hitText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            'HIT!',
            {
                fontSize: '60px',
                fill: '#ff0000',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Auto-destroy after duration
        this.scene.time.delayedCall(GameConfig.PLAYER.HIT_TEXT_DURATION, () => {
            if (hitText && hitText.active) {
                hitText.destroy();
            }
        });
    }

    /**
     * Show wave announcement with scale and fade animation
     * @param {number} waveNumber - Wave number to display
     */
    showWaveAnnouncement(waveNumber) {
        const waveAnnouncement = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            `WAVE ${waveNumber}`,
            {
                fontSize: '60px',
                fill: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Scale-in + fade-out animation
        this.scene.tweens.add({
            targets: waveAnnouncement,
            scale: { from: 0.5, to: 1.2 },
            alpha: { from: 1, to: 0 },
            duration: 1000,
            onComplete: () => {
                waveAnnouncement.destroy();
            }
        });
    }

    /**
     * Show custom text effect at specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text to display
     * @param {object} options - Text style and animation options
     */
    showTextEffect(x, y, text, options = {}) {
        const config = {
            fontSize: options.fontSize || '40px',
            fill: options.fill || '#FFD700',
            fontStyle: options.fontStyle || 'bold',
            align: options.align || 'center',
            scaleFrom: options.scaleFrom || 0.5,
            scaleTo: options.scaleTo || 1.0,
            duration: options.duration || 1000,
            fadeOut: options.fadeOut !== false
        };

        const textObj = this.scene.add.text(x, y, text, {
            fontSize: config.fontSize,
            fill: config.fill,
            fontStyle: config.fontStyle,
            align: config.align
        }).setOrigin(0.5);

        // Animation
        const tweenConfig = {
            targets: textObj,
            scale: { from: config.scaleFrom, to: config.scaleTo },
            duration: config.duration,
            onComplete: () => {
                textObj.destroy();
            }
        };

        if (config.fadeOut) {
            tweenConfig.alpha = { from: 1, to: 0 };
        }

        this.scene.tweens.add(tweenConfig);
    }

    /**
     * Stop all player effects
     */
    stopPlayerEffects() {
        if (this.playerBlinkTween) {
            this.playerBlinkTween.stop();
            this.playerBlinkTween = null;
        }
    }

    /**
     * Cleanup all effects
     */
    shutdown() {
        this.stopPlayerEffects();
    }
}

module.exports = EffectsManager;
