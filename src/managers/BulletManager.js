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

        // 当前波次（影响AI瞄准概率）
        this.currentWave = 1;
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
     * 设置当前波次（影响瞄准概率）
     * @param {number} wave - 当前波次
     */
    setCurrentWave(wave) {
        this.currentWave = wave;
    }

    /**
     * 显示射击警告效果（敌人变红闪烁）
     * @param {Phaser.GameObjects.Sprite} enemy - 敌人精灵
     * @param {number} duration - 持续时间 (ms)
     */
    showShootWarning(enemy, duration) {
        // 创建红色边框（在敌人周围）
        const warningBox = this.scene.add.graphics();
        warningBox.lineStyle(4, 0xff0000, 1); // 4px 红色边框
        warningBox.strokeRect(enemy.x - 20, enemy.y - 20, 40, 40); // 比敌人大一圈

        // 放大敌人（更明显）
        const originalScale = enemy.scale;
        enemy.setScale(originalScale * 1.3);

        // 添加快速闪烁效果
        const blinkCount = 4;
        const blinkInterval = duration / (blinkCount * 2);

        let currentBlink = 0;
        const blinkTimer = this.scene.time.addEvent({
            delay: blinkInterval,
            callback: () => {
                if (!enemy.active) {
                    warningBox.destroy();
                    blinkTimer.remove();
                    return;
                }

                // 更新边框位置（敌人可能在移动）
                warningBox.clear();
                warningBox.lineStyle(4, 0xff0000, currentBlink % 2 === 0 ? 0.5 : 1); // 闪烁透明度
                warningBox.strokeRect(enemy.x - 20, enemy.y - 20, 40, 40);

                currentBlink++;

                // 闪烁结束后恢复
                if (currentBlink >= blinkCount * 2) {
                    enemy.setScale(originalScale); // 恢复大小
                    warningBox.destroy(); // 销毁边框
                    blinkTimer.remove();
                }
            },
            loop: true
        });
    }

    /**
     * 计算瞄准子弹的速度向量（方案1：预测性射击）
     * @param {number} enemyX - 敌人X坐标
     * @param {number} enemyY - 敌人Y坐标
     * @param {Phaser.GameObjects.Sprite} player - 玩家对象
     * @returns {{vx: number, vy: number}} - 速度分量
     */
    calculateAimedVelocity(enemyX, enemyY, player) {
        const config = GameConfig.ENEMY.SHOOTING.AIMED;

        // 边界检查
        if (!player || !player.body || !player.active) {
            return { vx: 0, vy: GameConfig.ENEMY.BULLET_SPEED };
        }

        // 计算当前波次的瞄准概率（渐进式）
        const aimProbability = Math.min(
            config.BASE_PROBABILITY + (this.currentWave - config.START_WAVE) * config.PROBABILITY_INCREMENT,
            0.95  // 最大95%，保留5%随机性
        );

        // 随机决定是否瞄准
        if (Math.random() > aimProbability) {
            // 不瞄准，直线射击
            return { vx: 0, vy: GameConfig.ENEMY.BULLET_SPEED };
        }

        // 预测玩家未来位置
        const distance = Phaser.Math.Distance.Between(enemyX, enemyY, player.x, player.y);
        const timeToReach = distance / GameConfig.ENEMY.BULLET_SPEED;
        const predictedX = player.x + player.body.velocity.x * timeToReach * config.PREDICTION_FACTOR;

        // 计算方向向量
        let dx = predictedX - enemyX;
        let dy = player.y - enemyY;

        // 添加精度偏差（80%精度 = ±20%随机偏移）
        const inaccuracy = 1 - config.ACCURACY;
        dx += (Math.random() - 0.5) * inaccuracy * 100;
        dy += (Math.random() - 0.5) * inaccuracy * 100;

        // 归一化并保持速度恒定
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        const speed = GameConfig.ENEMY.BULLET_SPEED;

        return {
            vx: (dx / newDistance) * speed,
            vy: (dy / newDistance) * speed
        };
    }

    /**
     * 方案1：预测性射击
     * @param {Phaser.Physics.Arcade.Group} enemies - 敌人组
     * @param {Phaser.GameObjects.Sprite} player - 玩家对象
     */
    shootAimed(enemies, player) {
        const config = GameConfig.ENEMY.SHOOTING.AIMED;

        // 检查是否启用 & 当前波次是否达到
        if (!config.ENABLED || this.currentWave < config.START_WAVE) {
            this.shootRandom(enemies);
            return;
        }

        const randomEnemy = Phaser.Utils.Array.GetRandom(enemies.children.entries);

        // 视觉警告
        if (config.SHOW_WARNING) {
            this.showShootWarning(randomEnemy, config.WARNING_DURATION);
        }

        // 延迟射击（给玩家反应时间）
        this.scene.time.delayedCall(config.WARNING_DURATION, () => {
            if (!randomEnemy.active) return; // 敌人可能已被击杀

            const { vx, vy } = this.calculateAimedVelocity(
                randomEnemy.x,
                randomEnemy.y,
                player
            );

            const bullet = this.enemyBullets.create(randomEnemy.x, randomEnemy.y + 10, 'enemyBullet');
            bullet.setVelocity(vx, vy);
        });
    }

    /**
     * 原始随机射击（保留用于 Wave 1 或回退模式）
     * @param {Phaser.Physics.Arcade.Group} enemies - 敌人组
     */
    shootRandom(enemies) {
        const randomEnemy = Phaser.Utils.Array.GetRandom(enemies.children.entries);
        const bullet = this.enemyBullets.create(randomEnemy.x, randomEnemy.y + 10, 'enemyBullet');
        bullet.setVelocityY(GameConfig.ENEMY.BULLET_SPEED);
    }

    /**
     * 射击模式路由器（根据配置选择不同的AI方案）
     * @param {Phaser.Physics.Arcade.Group} enemies - 敌人组
     * @param {Phaser.GameObjects.Sprite} player - 玩家对象（用于瞄准）
     */
    shootRandomEnemy(enemies, player) {
        if (enemies.children.entries.length === 0) return;

        const mode = GameConfig.ENEMY.SHOOTING.CURRENT_MODE;

        switch (mode) {
            case 'AIMED':
                this.shootAimed(enemies, player);
                break;
            case 'FORMATION':
                // 方案2待实现
                console.warn('FORMATION mode not implemented yet, falling back to RANDOM');
                this.shootRandom(enemies);
                break;
            case 'POSITIONING':
                // 方案3待实现
                console.warn('POSITIONING mode not implemented yet, falling back to RANDOM');
                this.shootRandom(enemies);
                break;
            case 'RANDOM':
            default:
                this.shootRandom(enemies);
                break;
        }
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
