/**
 * Bullet Manager
 *
 * Manages player and enemy bullet lifecycle: creation, physics groups, shooting, and cleanup.
 * Handles shooting cooldowns and out-of-bounds cleanup.
 */

const Phaser = require('phaser');
const GameConfig = require('../config/GameConfig');

class BulletManager {
    /**
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     * @param {boolean} isMobileDevice - Whether the device is mobile (affects shoot cooldown)
     */
    constructor(scene, isMobileDevice) {
        this.scene = scene;
        this.isMobileDevice = isMobileDevice;

        // Create bullet physics groups
        this.playerBullets = scene.physics.add.group();
        this.enemyBullets = scene.physics.add.group();

        // Shooting cooldown tracking
        this.lastShotTime = 0;
    }

    /**
     * Get player bullets group (for collision detection)
     * @returns {Phaser.Physics.Arcade.Group}
     */
    getPlayerBullets() {
        return this.playerBullets;
    }

    /**
     * Get enemy bullets group (for collision detection)
     * @returns {Phaser.Physics.Arcade.Group}
     */
    getEnemyBullets() {
        return this.enemyBullets;
    }

    /**
     * Shoot a player bullet from specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean} - True if shot, false if on cooldown
     */
    shootPlayerBullet(x, y) {
        const currentTime = this.scene.time.now;

        // Different cooldown for mobile vs PC
        const shootCooldown = this.isMobileDevice
            ? GameConfig.PLAYER.MOBILE_SHOOT_COOLDOWN
            : GameConfig.PLAYER.SHOOT_COOLDOWN;

        if (currentTime - this.lastShotTime > shootCooldown) {
            const bullet = this.playerBullets.create(x, y, 'playerBullet');
            bullet.setVelocityY(-GameConfig.PLAYER.BULLET_SPEED);
            this.lastShotTime = currentTime;
            return true;
        }

        return false;
    }

    /**
     * Shoot an enemy bullet from specified position
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    shootEnemyBullet(x, y) {
        const bullet = this.enemyBullets.create(x, y, 'enemyBullet');
        bullet.setVelocityY(GameConfig.ENEMY.BULLET_SPEED);
    }

    /**
     * Select a random enemy and shoot a bullet
     * @param {Phaser.Physics.Arcade.Group} enemies - Enemy group
     */
    shootRandomEnemy(enemies) {
        if (enemies.children.entries.length === 0) return;

        const randomEnemy = Phaser.Utils.Array.GetRandom(enemies.children.entries);
        this.shootEnemyBullet(randomEnemy.x, randomEnemy.y + 10);
    }

    /**
     * Remove bullets that are out of screen bounds
     * Should be called every frame from GameScene.update()
     */
    cleanupOutOfBounds() {
        const screenHeight = this.scene.cameras.main.height;

        // Remove player bullets above screen
        this.playerBullets.children.entries.forEach(bullet => {
            if (bullet.y < 0) {
                bullet.destroy();
            }
        });

        // Remove enemy bullets below screen
        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.y > screenHeight) {
                bullet.destroy();
            }
        });
    }

    /**
     * Cleanup bullet groups
     */
    shutdown() {
        // Groups are automatically cleaned up by Phaser
        // Just clear our references
        this.playerBullets = null;
        this.enemyBullets = null;
    }
}

module.exports = BulletManager;
