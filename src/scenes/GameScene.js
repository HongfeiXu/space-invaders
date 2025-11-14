const Phaser = require('phaser');
const GameConfig = require('../config/GameConfig');
const AudioManager = require('../managers/AudioManager');
const ScoreManager = require('../managers/ScoreManager');
const EffectsManager = require('../managers/EffectsManager');

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

        // 创建UI文本
        this.createUITexts();

        // Create FPS counter if enabled
        if (GameConfig.UI.SHOW_FPS) {
            this.fpsText = this.add.text(GameConfig.UI.FPS_X, GameConfig.UI.FPS_Y, 'FPS: 60', {
                fontSize: '16px',
                fill: '#0f0',
                fontFamily: 'monospace'
            });
        }

        // 创建玩家飞船
        this.player = this.physics.add.sprite(GameConfig.PLAYER.INITIAL_X, GameConfig.PLAYER.INITIAL_Y, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDrag(0.99);

        // 创建敌人组
        this.enemies = this.physics.add.group();

        // 创建子弹组
        this.playerBullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        // 生成敌人
        this.spawnEnemies();

        // 设置碰撞检测
        this.physics.add.overlap(this.playerBullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

        // 输入控制
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // WASD 键控制
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        // ESC 键暂停游戏
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });

        // 暂停提示文本
        this.pauseText = this.add.text(400, 200, 'PAUSED', {
            fontSize: '50px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);

        // 暂停菜单按钮
        this.pauseResumeButton = this.createButton(
            400,
            300,
            'Resume',
            () => this.togglePause(),
            { width: 180, height: 50 }
        );
        this.pauseResumeButton.setVisible(false);

        this.pauseRestartButton = this.createButton(
            400,
            370,
            'Restart',
            () => this.scene.restart(),
            { width: 180, height: 50 }
        );
        this.pauseRestartButton.setVisible(false);

        // 敌人射击定时器
        this.enemyFireTimer = this.time.addEvent({
            delay: GameConfig.ENEMY.FIRE_INTERVAL,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });

        // 播放背景音乐
        // 音乐来自: Eric Matyas (www.soundimage.org)
        this.audioManager.playBackgroundMusic();

        // 触摸控制（移动端适配）- 只在非桌面设备上启用
        this.isTouchLeft = false;
        this.isTouchRight = false;

        // 检测是否为移动设备（保存为实例变量供 update() 使用）
        this.isMobileDevice = !this.sys.game.device.os.desktop;

        // 只在移动设备上启用触摸控制
        if (this.isMobileDevice) {
            // 保存事件处理器引用以便清理
            this.touchDownHandler = (pointer) => {
                if (this.gameOver || this.isPaused) return;

                const halfWidth = this.cameras.main.width / 2;
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

            this.input.on('pointerdown', this.touchDownHandler);
            this.input.on('pointerup', this.touchUpHandler);
        }

        // 创建暂停按钮（右上角）
        this.pauseButton = this.createButton(
            this.cameras.main.width - 80,
            40,
            '❚❚',
            () => this.togglePause(),
            {
                width: 60,
                height: 40,
                fontSize: '20px'
            }
        );
    }

    /**
     * 创建可点击按钮
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} text - 按钮文字
     * @param {Function} callback - 点击回调函数
     * @param {object} options - 可选配置 {width, height, fontSize, bgColor, textColor}
     * @returns {Phaser.GameObjects.Container} 按钮容器
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

        // 创建容器
        const container = this.add.container(x, y);

        // 创建背景
        const bg = this.add.graphics();
        bg.fillStyle(config.bgColor, config.bgAlpha);
        bg.lineStyle(config.borderWidth, config.borderColor, 1);
        bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
        bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);

        // 创建文本
        const buttonText = this.add.text(0, 0, text, {
            fontSize: config.fontSize,
            fill: config.textColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 添加到容器
        container.add([bg, buttonText]);

        // 设置交互区域（自定义 hitArea，以容器中心为原点）
        container.setInteractive(
            new Phaser.Geom.Rectangle(-config.width / 2, -config.height / 2, config.width, config.height),
            Phaser.Geom.Rectangle.Contains
        );

        // 添加点击效果
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
            callback();
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

    togglePause() {
        if (this.gameOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.pauseText.setVisible(true);
            this.pauseResumeButton.setVisible(true);
            this.pauseRestartButton.setVisible(true);
            // 暂停背景音乐
            this.audioManager.pauseBackgroundMusic();
            // 暂停敌人射击定时器
            if (this.enemyFireTimer) {
                this.enemyFireTimer.paused = true;
            }
        } else {
            this.physics.resume();
            this.pauseText.setVisible(false);
            this.pauseResumeButton.setVisible(false);
            this.pauseRestartButton.setVisible(false);
            // 恢复背景音乐
            this.audioManager.resumeBackgroundMusic();
            // 恢复敌人射击定时器
            if (this.enemyFireTimer) {
                this.enemyFireTimer.paused = false;
            }
        }
    }

    update() {
        // Update FPS counter if enabled
        if (GameConfig.UI.SHOW_FPS && this.fpsText) {
            this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
        }

        if (this.gameOver || this.isPaused) return;

        // 玩家移动控制 (支持方向键、WASD 和触摸)
        if (this.cursors.left.isDown || this.keyA.isDown || this.isTouchLeft) {
            this.player.setVelocityX(-GameConfig.PLAYER.SPEED);
        } else if (this.cursors.right.isDown || this.keyD.isDown || this.isTouchRight) {
            this.player.setVelocityX(GameConfig.PLAYER.SPEED);
        } else {
            this.player.setVelocityX(0);
        }

        // 玩家射击
        if (this.isMobileDevice) {
            // 移动端：持续自动射击
            this.playerShoot();
        } else {
            // PC 端：按空格键射击
            if (this.spaceBar.isDown) {
                this.playerShoot();
            }
        }

        // 移除超出屏幕的子弹
        this.playerBullets.children.entries.forEach(bullet => {
            if (bullet.y < 0) {
                bullet.destroy();
            }
        });

        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.y > this.cameras.main.height) {
                bullet.destroy();
            }
        });

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

    playerShoot() {
        // 防止连续射击太快
        if (!this.lastShotTime) {
            this.lastShotTime = 0;
        }

        const currentTime = this.time.now;
        // 根据设备类型使用不同的射击冷却时间
        const shootCooldown = this.isMobileDevice
            ? GameConfig.PLAYER.MOBILE_SHOOT_COOLDOWN
            : GameConfig.PLAYER.SHOOT_COOLDOWN;

        if (currentTime - this.lastShotTime > shootCooldown) {
            const bullet = this.playerBullets.create(this.player.x, this.player.y - 10, 'playerBullet');
            bullet.setVelocityY(-GameConfig.PLAYER.BULLET_SPEED);
            this.lastShotTime = currentTime;
        }
    }

    enemyShoot() {
        if (this.enemies.children.entries.length === 0) return;

        const randomEnemy = Phaser.Utils.Array.GetRandom(this.enemies.children.entries);
        const bullet = this.enemyBullets.create(randomEnemy.x, randomEnemy.y + 10, 'enemyBullet');
        bullet.setVelocityY(GameConfig.ENEMY.BULLET_SPEED);
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
        this.livesText.setText('Lives: ' + this.lives);

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

    endGame() {
        this.gameOver = true;
        this.physics.pause();

        // 停止背景音乐
        this.audioManager.stopBackgroundMusic();

        // 清理玩家效果
        this.effectsManager.stopPlayerEffects();
        // 恢复玩家可见性
        if (this.player) {
            this.player.setAlpha(1);
        }

        // 检查是否破纪录（当前分数 > 游戏开始时的最高分）
        const currentScore = this.scoreManager.getScore();
        const highScore = this.scoreManager.getHighScore();
        const isNewRecord = this.scoreManager.shouldShowNewRecordAnimation();

        // 构建 Game Over 文本
        let gameOverMessage = 'GAME OVER\n';
        gameOverMessage += 'Score: ' + currentScore + '\n';
        gameOverMessage += 'High Score: ' + highScore;
        if (isNewRecord) {
            gameOverMessage += '\n🎉 NEW RECORD! 🎉';
        }

        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 60,
            gameOverMessage,
            {
                fontSize: '40px',
                fill: isNewRecord ? '#FFD700' : '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 添加 Restart 按钮
        this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Restart',
            () => this.scene.restart(),
            { width: 200, height: 60, fontSize: '28px' }
        );
    }

    // ==================== UI系统 ====================

    createUITexts() {
        // 顶部中央：波次显示
        this.waveText = this.add.text(
            this.cameras.main.width / 2,
            15,
            `WAVE: ${this.currentWave}/${GameConfig.WAVE.MAX_WAVE}`,
            {
                fontSize: '28px',
                fill: '#ffd700',  // 金色
                fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0);

        // 左上角：最高分
        this.highScoreText = this.add.text(10, 10, `High Score: ${this.scoreManager.getHighScore()}`, {
            fontSize: '20px',
            fill: '#ffd700'  // 金色
        });

        // 左上角：当前分数（在最高分下方）
        this.scoreText = this.add.text(10, 35, 'Score: 0', {
            fontSize: '20px',
            fill: '#fff'
        });

        // 左上角：生命值（在分数下方，空一行距离）
        this.livesText = this.add.text(10, 85, `Lives: ${GameConfig.GAME.INITIAL_LIVES}`, {
            fontSize: '20px',
            fill: '#fff'
        });
    }

    updateScore(points) {
        const isNewHighScore = this.scoreManager.addScore(points);
        this.scoreText.setText('Score: ' + this.scoreManager.getScore());

        // 如果是新纪录，更新最高分显示
        if (isNewHighScore) {
            this.highScoreText.setText(`High Score: ${this.scoreManager.getHighScore()}`);

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
        this.waveText.setText(`WAVE: ${this.currentWave}/${GameConfig.WAVE.MAX_WAVE}`);

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
            callback: this.enemyShoot,
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

        // 清理之前的通关文本（如果存在）
        this.cleanupVictoryTexts();

        // 显示通关信息
        this.victoryTitle = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 100,
            '🎉 恭喜通关！🎉',
            {
                fontSize: '50px',
                fill: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        this.statsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Score: ${this.scoreManager.getScore()}\nLives: ${this.lives}`,
            {
                fontSize: '30px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 添加 Continue 按钮
        this.continueButton = this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 110,
            'Continue',
            () => this.restartWaveCycle(),
            { width: 200, height: 60, fontSize: '28px' }
        );

        // 添加提示文字
        this.continueHint = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 180,
            '(Restart from Wave 1)',
            {
                fontSize: '18px',
                fill: '#aaa',
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    restartWaveCycle() {
        // 清理通关文本
        this.cleanupVictoryTexts();

        // 重置波次为 1
        this.currentWave = GameConfig.WAVE.INITIAL_WAVE;
        this.waveText.setText(`WAVE: ${this.currentWave}/${GameConfig.WAVE.MAX_WAVE}`);

        // 重置射击间隔为初始值
        if (this.enemyFireTimer) {
            this.enemyFireTimer.remove();
        }
        this.enemyFireTimer = this.time.addEvent({
            delay: GameConfig.ENEMY.FIRE_INTERVAL,
            callback: this.enemyShoot,
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

    cleanupVictoryTexts() {
        // 清理通关文本对象（防止内存泄漏）
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

        // 停止敌人射击定时器
        if (this.enemyFireTimer) {
            this.enemyFireTimer.remove();
        }

        // 清理触摸事件监听器（防止内存泄漏）
        if (this.touchDownHandler) {
            this.input.off('pointerdown', this.touchDownHandler);
            this.touchDownHandler = null;
        }
        if (this.touchUpHandler) {
            this.input.off('pointerup', this.touchUpHandler);
            this.touchUpHandler = null;
        }

        // 清理通关文本对象
        this.cleanupVictoryTexts();

        // 移除事件监听器
        this.events.off('shutdown', this.shutdown, this);
    }
}

module.exports = GameScene;
