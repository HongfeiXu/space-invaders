/**
 * Score Manager
 *
 * Manages game score tracking, high score persistence, and new record detection.
 * Handles localStorage interactions for high score data.
 */

const GameConfig = require('../config/GameConfig');

class ScoreManager {
    /**
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.highScore = 0;
        this.initialHighScore = 0;
        this.hasShownNewRecordAnimation = false;

        this.loadHighScore();
    }

    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        const storedHighScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.initialHighScore = storedHighScore;
        this.highScore = storedHighScore;
    }

    /**
     * Get current score
     * @returns {number}
     */
    getScore() {
        return this.score;
    }

    /**
     * Get high score
     * @returns {number}
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Add points to score
     * @param {number} points - Points to add
     * @returns {boolean} - True if new high score was achieved
     */
    addScore(points) {
        this.score += points;

        // Check if new high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            // Save to localStorage immediately
            localStorage.setItem('highScore', this.highScore.toString());
            return true;
        }

        return false;
    }

    /**
     * Reset score to 0
     */
    resetScore() {
        this.score = 0;
        this.hasShownNewRecordAnimation = false;
    }

    /**
     * Check if new record animation should be shown
     * @returns {boolean}
     */
    shouldShowNewRecordAnimation() {
        return !this.hasShownNewRecordAnimation && this.score > this.initialHighScore;
    }

    /**
     * Mark new record animation as shown
     */
    markNewRecordAnimationShown() {
        this.hasShownNewRecordAnimation = true;
    }

    /**
     * Show new high score animation
     * This method creates and animates the "NEW HIGH SCORE!" text
     */
    showNewRecordAnimation() {
        if (this.hasShownNewRecordAnimation) {
            return;
        }

        this.hasShownNewRecordAnimation = true;

        // Display new record text at top center (below wave text)
        const newRecordText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            100,
            '⭐ NEW HIGH SCORE! ⭐',
            {
                fontSize: '40px',
                fill: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Scale-in animation
        this.scene.tweens.add({
            targets: newRecordText,
            scale: { from: 0.5, to: 1.0 },
            duration: 200,
            onComplete: () => {
                // Blink effect
                this.scene.tweens.add({
                    targets: newRecordText,
                    alpha: { from: 1, to: 0.5 },
                    duration: 100,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        // Fade out
                        this.scene.tweens.add({
                            targets: newRecordText,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => {
                                newRecordText.destroy();
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Cleanup resources
     */
    shutdown() {
        // No resources to clean up (localStorage persists)
    }
}

module.exports = ScoreManager;
