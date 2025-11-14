const Phaser = require('phaser');
const GameConfig = require('../config/GameConfig');

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 设置游戏背景
        this.cameras.main.setBackgroundColor('#000');

        // 初始化游戏变量
        this.score = 0;
        this.lives = GameConfig.GAME.INITIAL_LIVES;
        this.gameOver = false;
        this.isPaused = false;

        // 波次系统变量
        this.currentWave = GameConfig.WAVE.INITIAL_WAVE;
        this.isTransitioning = false;
        this.isVictoryScreen = false;

        // 注册 shutdown 事件以清理资源
        // 说明：this.scene.restart() 时触发此事件，在重新调用 create() 之前
        this.events.on('shutdown', this.shutdown, this);

        // 初始化最高分系统
        this.initHighScoreSystem();

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
        this.pauseText = this.add.text(400, 300, 'PAUSED\n\nPress ESC to Resume\nPress R to Restart', {
            fontSize: '40px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);

        // 敌人射击定时器
        this.enemyFireTimer = this.time.addEvent({
            delay: GameConfig.ENEMY.FIRE_INTERVAL,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });

        // 播放背景音乐
        // 音乐来自: Eric Matyas (www.soundimage.org)
        this.backgroundMusic = this.sound.add('backgroundMusic');
        this.backgroundMusic.play({
            loop: GameConfig.AUDIO.BACKGROUND_MUSIC_LOOP,
            volume: GameConfig.AUDIO.BACKGROUND_MUSIC_VOLUME
        });
    }

    togglePause() {
        if (this.gameOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.pauseText.setVisible(true);
            // 暂停背景音乐
            if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
                this.backgroundMusic.pause();
            }
            // 暂停敌人射击定时器
            if (this.enemyFireTimer) {
                this.enemyFireTimer.paused = true;
            }
            // 添加 R 键重启监听器
            this.restartKeyListener = this.input.keyboard.on('keydown-R', () => {
                this.scene.restart();
            });
        } else {
            this.physics.resume();
            this.pauseText.setVisible(false);
            // 恢复背景音乐
            if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
                this.backgroundMusic.resume();
            }
            // 恢复敌人射击定时器
            if (this.enemyFireTimer) {
                this.enemyFireTimer.paused = false;
            }
            // 移除 R 键重启监听器
            if (this.restartKeyListener) {
                this.input.keyboard.off('keydown-R', this.restartKeyListener);
                this.restartKeyListener = null;
            }
        }
    }

    update() {
        // Update FPS counter if enabled
        if (GameConfig.UI.SHOW_FPS && this.fpsText) {
            this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
        }

        if (this.gameOver || this.isPaused) return;

        // 玩家移动控制 (支持方向键和 WASD)
        if (this.cursors.left.isDown || this.keyA.isDown) {
            this.player.setVelocityX(-GameConfig.PLAYER.SPEED);
        } else if (this.cursors.right.isDown || this.keyD.isDown) {
            this.player.setVelocityX(GameConfig.PLAYER.SPEED);
        } else {
            this.player.setVelocityX(0);
        }

        // 玩家射击
        if (this.spaceBar.isDown) {
            this.playerShoot();
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
        if (currentTime - this.lastShotTime > GameConfig.PLAYER.SHOOT_COOLDOWN) {
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
        this.tweens.add({
            targets: enemy,
            alpha: GameConfig.EFFECTS.BLINK_ALPHA,
            duration: GameConfig.EFFECTS.BLINK_DURATION,
            yoyo: true,
            repeat: GameConfig.EFFECTS.BLINK_REPEAT,
            onComplete: () => {
                enemy.destroy();
            }
        });

        this.updateScore(GameConfig.GAME.POINTS_PER_ENEMY);
    }

    hitPlayer(player, bullet) {
        // 只有敌人子弹会伤害玩家
        if (bullet.texture.key === 'enemyBullet') {
            bullet.destroy();
            this.lives--;
            this.livesText.setText('Lives: ' + this.lives);

            if (this.lives <= 0) {
                this.endGame();
            } else {
                // 重置玩家位置
                player.setPosition(GameConfig.PLAYER.INITIAL_X, GameConfig.PLAYER.INITIAL_Y);
                player.setVelocity(0, 0);
            }
        }
    }

    endGame() {
        this.gameOver = true;
        this.physics.pause();

        // 停止背景音乐
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
        }

        // 保存最高分到 localStorage
        localStorage.setItem('highScore', this.highScore.toString());

        // 检查是否破纪录（当前分数 > 游戏开始时的最高分）
        const isNewRecord = this.hasShownNewRecordAnimation;

        // 构建 Game Over 文本
        let gameOverMessage = 'GAME OVER\n';
        gameOverMessage += 'Score: ' + this.score + '\n';
        gameOverMessage += 'High Score: ' + this.highScore;
        if (isNewRecord) {
            gameOverMessage += '\n🎉 NEW RECORD! 🎉';
        }

        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 40,
            gameOverMessage,
            {
                fontSize: '40px',
                fill: isNewRecord ? '#FFD700' : '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 添加重启按钮提示
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 120,
            'Press SPACE to restart',
            {
                fontSize: '20px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 按空格重启
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.restart();
        });
    }

    // ==================== 最高分系统 ====================

    initHighScoreSystem() {
        // 从 localStorage 读取最高分
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.hasShownNewRecordAnimation = false;  // 控制动画是否已显示
    }

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
        this.highScoreText = this.add.text(10, 10, `High Score: ${this.highScore}`, {
            fontSize: '20px',
            fill: '#ffd700'  // 金色
        });

        // 左上角：当前分数（在最高分下方）
        this.scoreText = this.add.text(10, 35, 'Score: 0', {
            fontSize: '20px',
            fill: '#fff'
        });

        // 右上角：生命值
        this.livesText = this.add.text(this.cameras.main.width - 150, 10, `Lives: ${GameConfig.GAME.INITIAL_LIVES}`, {
            fontSize: '20px',
            fill: '#fff'
        });
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);

        // 实时检查是否破纪录，持续更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText(`High Score: ${this.highScore}`);

            // 只显示一次动画
            if (!this.hasShownNewRecordAnimation) {
                this.hasShownNewRecordAnimation = true;
                this.showNewRecordAnimation();
            }
        }
    }

    showNewRecordAnimation() {
        // 在屏幕顶部中间显示破纪录提示（下移避免与Wave重叠）
        const newRecordText = this.add.text(
            this.cameras.main.width / 2,
            100,
            '⭐ NEW HIGH SCORE! ⭐',
            {
                fontSize: '40px',
                fill: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 缩放 + 闪烁动画，1秒后消失
        this.tweens.add({
            targets: newRecordText,
            scale: { from: 0.5, to: 1.0 },
            duration: 200,
            onComplete: () => {
                // 闪烁效果
                this.tweens.add({
                    targets: newRecordText,
                    alpha: { from: 1, to: 0.5 },
                    duration: 100,
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        // 淡出消失
                        this.tweens.add({
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

    // ==================== 波次系统 ====================

    startWaveTransition() {
        this.isTransitioning = true;

        // 显示波次切换动画
        const nextWave = this.currentWave + 1;
        const waveAnnouncement = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `WAVE ${nextWave}`,
            {
                fontSize: '60px',
                fill: '#FFD700',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 缩放 + 淡出动画
        this.tweens.add({
            targets: waveAnnouncement,
            scale: { from: 0.5, to: 1.2 },
            alpha: { from: 1, to: 0 },
            duration: 1000,
            onComplete: () => {
                waveAnnouncement.destroy();
            }
        });

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
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.pause();
        }

        // 停止敌人射击定时器
        if (this.enemyFireTimer) {
            this.enemyFireTimer.paused = true;
        }

        // 显示通关信息
        const victoryTitle = this.add.text(
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

        const statsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            `Score: ${this.score}\nLives: ${this.lives}`,
            {
                fontSize: '30px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        const continueHint = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Press SPACE to Continue\n(Restart from Wave 1)',
            {
                fontSize: '20px',
                fill: '#aaa',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 监听 SPACE 键继续
        this.input.keyboard.once('keydown-SPACE', () => {
            this.restartWaveCycle();
            victoryTitle.destroy();
            statsText.destroy();
            continueHint.destroy();
        });
    }

    restartWaveCycle() {
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
        if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
            this.backgroundMusic.resume();
        }

        // 生成敌人
        this.spawnEnemies();
    }

    // ==================== 生命周期管理 ====================

    shutdown() {
        // 停止并销毁背景音乐（防止内存泄漏）
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic.destroy();
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
