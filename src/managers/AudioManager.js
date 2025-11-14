/**
 * Audio Manager
 *
 * Manages all audio playback including background music and sound effects.
 * Handles music lifecycle, volume control, and pause/resume functionality.
 */

const GameConfig = require('../config/GameConfig');

class AudioManager {
    /**
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.backgroundMusic = null;
    }

    /**
     * Play background music
     */
    playBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            return;
        }

        this.backgroundMusic = this.scene.sound.add('backgroundMusic', {
            volume: GameConfig.AUDIO.BACKGROUND_MUSIC_VOLUME,
            loop: GameConfig.AUDIO.BACKGROUND_MUSIC_LOOP
        });

        this.backgroundMusic.play();
    }

    /**
     * Pause background music
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.pause();
        }
    }

    /**
     * Resume background music
     */
    resumeBackgroundMusic() {
        if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
            this.backgroundMusic.resume();
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
    }

    /**
     * Set background music volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(volume);
        }
    }

    /**
     * Check if background music is currently playing
     * @returns {boolean}
     */
    isPlaying() {
        return this.backgroundMusic && this.backgroundMusic.isPlaying;
    }

    /**
     * Cleanup audio resources
     */
    shutdown() {
        this.stopBackgroundMusic();

        if (this.backgroundMusic) {
            this.backgroundMusic.destroy();
            this.backgroundMusic = null;
        }
    }
}

module.exports = AudioManager;
