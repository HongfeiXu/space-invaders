const Phaser = require('phaser');
const GameConfig = require('../config/GameConfig');
const AudioManager = require('../managers/AudioManager');
const ScoreManager = require('../managers/ScoreManager');
const EffectsManager = require('../managers/EffectsManager');
const InputManager = require('../managers/InputManager');
const BulletManager = require('../managers/BulletManager');
const UIManager = require('../managers/UIManager');

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 设置游戏背景
        this.cameras.main.setBackgroundColor('#000');

        // 初始化管理器
        this.audioManager = new AudioManager(this);
        this.scoreManager = new ScoreManager(this);
        this.effectsManager = new EffectsManager(this);
        this.inputManager = new InputManager(this);
        this.bulletManager = new BulletManager(this, this.inputManager.isMobileDevice());
        this.uiManager = new UIManager(this, this.scoreManager);

        // 初始化游戏变量
        this.lives = GameConfig.GAME.INITIAL_LIVES;
        this.gameOver = false;
        this.isPaused = false;

        // 波次系统变量
        this.currentWave = GameConfig.WAVE.INITIAL_WAVE;
        this.isTransitioning = false;
        this.isVictoryScreen = false;

        // 玩家无敌状态管理
        this.isInvincible = false;

        // 注册 shutdown 事件以清理资源
        // 说明：this.scene.restart() 时触发此事件，在重新调用 create() 之前
        this.events.on('shutdown', this.shutdown, this);

        // 创建玩家飞船
        this.player = this.physics.add.sprite(GameConfig.PLAYER.INITIAL_X, GameConfig.PLAYER.INITIAL_Y, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDrag(0.99);

        // 创建敌人组
        this.enemies = this.physics.add.group();

        // 生成敌人
        this.spawnEnemies();

        // 设置碰撞检测
        this.physics.add.overlap(this.bulletManager.getPlayerBullets(), this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.bulletManager.getEnemyBullets(), this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

        // 注册暂停控制 (ESC键 + 暂停按钮)
        this.inputManager.onPauseRequested(() => this.togglePause());

        // Register pause button callback
        const pauseButton = this.uiManager.getPauseButton();
        pauseButton.removeAllListeners('pointerup');
        pauseButton.on('pointerup', () => {
            pauseButton.setScale(1);
            this.togglePause();
        });

        // Register GM test button callback
        const gmButton = this.uiManager.getGMButton();
        gmButton.removeAllListeners('pointerup');
        gmButton.on('pointerup', () => {
            gmButton.setScale(1);
            if (!this.gameOver && !this.isPaused) {
                this.killAllEnemies();
            }
        });

        // 同步当前波次到 BulletManager（影响瞄准概率）
        this.bulletManager.setCurrentWave(this.currentWave);

        // 敌人射击定时器
        this.enemyFireTimer = this.time.addEvent({
            delay: GameConfig.ENEMY.FIRE_INTERVAL,
            callback: () => this.bulletManager.shootRandomEnemy(this.enemies, this.player),
            callbackScope: this,
            loop: true
        });

        // 播放背景音乐
        // 音乐来自: Eric Matyas (www.soundimage.org)
        this.audioManager.playBackgroundMusic();
    }

    togglePause() {
        if (this.gameOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.uiManager.showPauseMenu(
                () => this.togglePause(),  // Resume callback
                () => this.scene.restart()  // Restart callback
            );
            // 暂停背景音乐
            this.audioManager.pauseBackgroundMusic();
            // 暂停敌人射击定时器
            if (this.enemyFireTimer) {
                this.enemyFireTimer.paused = true;
            }
            // 更新暂停按钮图标为"播放"
            this.uiManager.updatePauseButtonIcon(true);
        } else {
            this.physics.resume();
            this.uiManager.hidePauseMenu();
            // 恢复背景音乐
            this.audioManager.resumeBackgroundMusic();
            // 恢复敌人射击定时器
            if (this.enemyFireTimer) {
                this.enemyFireTimer.paused = false;
            }
            // 更新暂停按钮图标为"暂停"
            this.uiManager.updatePauseButtonIcon(false);
        }
    }

    update() {
        // Update FPS counter if enabled
        if (GameConfig.UI.SHOW_FPS) {
            this.uiManager.updateFPS(Math.round(this.game.loop.actualFps));
        }

        if (this.gameOver || this.isPaused) return;

        // 玩家移动控制 (键盘方向键/WASD 或 移动端虚拟按钮)
        if (this.inputManager.isLeftPressed()) {
            this.player.setVelocityX(-GameConfig.PLAYER.SPEED);
        } else if (this.inputManager.isRightPressed()) {
            this.player.setVelocityX(GameConfig.PLAYER.SPEED);
        } else {
            this.player.setVelocityX(0);
        }

        // 玩家射击 (PC: Space键, 移动端: 自动)
        if (this.inputManager.isShootPressed()) {
            this.bulletManager.shootPlayerBullet(this.player.x, this.player.y - 10);
        }

        // 清理越界子弹
        this.bulletManager.cleanupOutOfBounds();

        // 检查敌人是否全部消灭（波次系统）
        if (this.enemies.children.entries.length === 0 && !this.isTransitioning && !this.isVictoryScreen) {
            if (this.currentWave < GameConfig.WAVE.MAX_WAVE) {
                this.startWaveTransition();
            } else {
                this.showVictoryScreen();
            }
        }
    }

    spawnEnemies() {
        const config = GameConfig.ENEMY_SPAWN;

        for (let row = 0; row < config.ROWS; row++) {
            for (let col = 0; col < config.COLS; col++) {
                const x = config.START_X + col * config.SPACING_X;
                const y = config.START_Y + row * config.SPACING_Y;
                const enemy = this.enemies.create(x, y, 'enemy');
                enemy.setVelocityX(Phaser.Math.Between(GameConfig.ENEMY.SPEED_MIN, GameConfig.ENEMY.SPEED_MAX));
                enemy.setBounce(1, 1);
                enemy.setCollideWorldBounds(true);
            }
        }
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();

        // 敌人被击中闪烁效果
        this.effectsManager.blinkSprite(enemy, () => {
            enemy.destroy();
        });

        this.updateScore(GameConfig.GAME.POINTS_PER_ENEMY);
    }

    hitPlayer(player, bulletOrEnemy) {
        // 如果玩家处于无敌状态，忽略伤害
        if (this.isInvincible) {
            return;
        }

        // 检查 bulletOrEnemy 是否存在
        if (!bulletOrEnemy) {
            return;
        }

        // 检查是子弹还是敌人直接碰撞
        const isBullet = bulletOrEnemy.texture && bulletOrEnemy.texture.key === 'enemyBullet';
        const isEnemy = bulletOrEnemy.texture && bulletOrEnemy.texture.key === 'enemy';

        // 只有敌人子弹或敌人直接碰撞才会伤害玩家
        if (!isBullet && !isEnemy) {
            return;
        }

        // 销毁子弹（如果是子弹）
        if (isBullet) {
            bulletOrEnemy.destroy();
        }

        // 减少生命值
        this.lives--;
        this.uiManager.updateLives(this.lives);

        // 如果生命值归零，游戏结束
        if (this.lives <= 0) {
            this.endGame();
            return;
        }

        // 设置无敌状态，防止重复触发
        this.isInvincible = true;

        // 显示 HIT! 文字
        this.effectsManager.showHitText();

        // 玩家受击效果（闪烁 + 重生）
        this.effectsManager.playerHitEffect(player, () => {
            // 无敌状态结束
            this.isInvincible = false;
        });
    }

    /**
     * GM 测试功能：一键击杀当前波次所有敌人
     */
    killAllEnemies() {
        const enemies = this.enemies.getChildren();
        enemies.forEach(enemy => {
            // 使用闪烁效果
            this.effectsManager.blinkSprite(enemy, () => {
                enemy.destroy();
            });
            // 增加分数
            this.updateScore(GameConfig.GAME.POINTS_PER_ENEMY);
        });
    }

    endGame() {
        this.gameOver = true;
        this.physics.pause();

        // 停止背景音乐
        this.audioManager.stopBackgroundMusic();

        // 停止敌人射击定时器
        if (this.enemyFireTimer) {
            this.enemyFireTimer.paused = true;
        }

        // 清理玩家效果
        this.effectsManager.stopPlayerEffects();
        // 恢复玩家可见性
        if (this.player) {
            this.player.setAlpha(1);
        }

        // 检查是否破纪录
        const currentScore = this.scoreManager.getScore();
        const highScore = this.scoreManager.getHighScore();
        const isNewRecord = this.scoreManager.shouldShowNewRecordAnimation();

        // 显示游戏结束界面
        this.uiManager.showGameOver(currentScore, highScore, isNewRecord, () => this.scene.restart());
    }

    // ==================== UI系统 ====================
    // (All UI managed by UIManager)

    updateScore(points) {
        const isNewHighScore = this.scoreManager.addScore(points);
        this.uiManager.updateScore(this.scoreManager.getScore());

        // 如果是新纪录，更新最高分显示
        if (isNewHighScore) {
            this.uiManager.updateHighScore(this.scoreManager.getHighScore());

            // 显示新纪录动画（只显示一次）
            if (this.scoreManager.shouldShowNewRecordAnimation()) {
                this.scoreManager.showNewRecordAnimation();
            }
        }
    }

    // ==================== 波次系统 ====================

    startWaveTransition() {
        this.isTransitioning = true;

        // 显示波次切换动画
        const nextWave = this.currentWave + 1;
        this.effectsManager.showWaveAnnouncement(nextWave);

        // 延迟后生成下一波
        this.time.delayedCall(GameConfig.WAVE.TRANSITION_DELAY, () => {
            this.spawnNextWave();
        });
    }

    spawnNextWave() {
        // 增加波次
        this.currentWave++;

        // 更新 UI
        this.uiManager.updateWave(this.currentWave, GameConfig.WAVE.MAX_WAVE);

        // 同步波次到 BulletManager（影响瞄准概率）
        this.bulletManager.setCurrentWave(this.currentWave);

        // 计算新的敌人射击间隔（逐波递减）
        const baseInterval = GameConfig.ENEMY.FIRE_INTERVAL;
        const newInterval = Math.max(
            baseInterval * Math.pow(GameConfig.WAVE.FIRE_RATE_MULTIPLIER, this.currentWave - 1),
            GameConfig.WAVE.MIN_FIRE_INTERVAL
        );

        // 更新射击定时器
        if (this.enemyFireTimer) {
            this.enemyFireTimer.remove();
        }
        this.enemyFireTimer = this.time.addEvent({
            delay: newInterval,
            callback: () => this.bulletManager.shootRandomEnemy(this.enemies, this.player),
            callbackScope: this,
            loop: true
        });

        // 生成敌人
        this.spawnEnemies();

        // 结束切换状态
        this.isTransitioning = false;
    }

    showVictoryScreen() {
        this.isVictoryScreen = true;
        this.physics.pause();

        // 停止背景音乐
        this.audioManager.pauseBackgroundMusic();

        // 停止敌人射击定时器
        if (this.enemyFireTimer) {
            this.enemyFireTimer.paused = true;
        }

        // 显示通关界面
        this.uiManager.showVictory(this.scoreManager.getScore(), this.lives, () => this.restartWaveCycle());
    }

    restartWaveCycle() {
        // 清理通关界面
        this.uiManager.hideVictory();

        // 重置波次为 1
        this.currentWave = GameConfig.WAVE.INITIAL_WAVE;
        this.uiManager.updateWave(this.currentWave, GameConfig.WAVE.MAX_WAVE);

        // 同步波次到 BulletManager（重置为 Wave 1）
        this.bulletManager.setCurrentWave(this.currentWave);

        // 重置射击间隔为初始值
        if (this.enemyFireTimer) {
            this.enemyFireTimer.remove();
        }
        this.enemyFireTimer = this.time.addEvent({
            delay: GameConfig.ENEMY.FIRE_INTERVAL,
            callback: () => this.bulletManager.shootRandomEnemy(this.enemies, this.player),
            callbackScope: this,
            loop: true
        });

        // 保留分数和生命（不重置！）
        // this.score 保持
        // this.lives 保持

        // 恢复游戏
        this.isVictoryScreen = false;
        this.physics.resume();

        // 恢复背景音乐
        this.audioManager.resumeBackgroundMusic();

        // 生成敌人
        this.spawnEnemies();
    }

    // ==================== 生命周期管理 ====================

    shutdown() {
        // 清理管理器资源
        if (this.audioManager) {
            this.audioManager.shutdown();
        }
        if (this.scoreManager) {
            this.scoreManager.shutdown();
        }
        if (this.effectsManager) {
            this.effectsManager.shutdown();
        }
        if (this.inputManager) {
            this.inputManager.shutdown();
        }
        if (this.bulletManager) {
            this.bulletManager.shutdown();
        }
        if (this.uiManager) {
            this.uiManager.shutdown();
        }

        // 停止敌人射击定时器
        if (this.enemyFireTimer) {
            this.enemyFireTimer.remove();
        }

        // 移除事件监听器
        this.events.off('shutdown', this.shutdown, this);
    }
}

module.exports = GameScene;
