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

        // 创建UI文本
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '20px',
            fill: '#fff'
        });

        this.livesText = this.add.text(this.cameras.main.width - 150, 10, `Lives: ${GameConfig.GAME.INITIAL_LIVES}`, {
            fontSize: '20px',
            fill: '#fff'
        });

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

        // ESC 键暂停游戏
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });

        // 暂停提示文本
        this.pauseText = this.add.text(400, 300, 'PAUSED\n\nPress ESC to Resume', {
            fontSize: '40px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);

        // 敌人射击定时器
        this.time.addEvent({
            delay: GameConfig.ENEMY.FIRE_INTERVAL,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });
    }

    togglePause() {
        if (this.gameOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.physics.pause();
            this.pauseText.setVisible(true);
        } else {
            this.physics.resume();
            this.pauseText.setVisible(false);
        }
    }

    update() {
        // Update FPS counter if enabled
        if (GameConfig.UI.SHOW_FPS && this.fpsText) {
            this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
        }

        if (this.gameOver || this.isPaused) return;

        // 玩家移动控制
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-GameConfig.PLAYER.SPEED);
        } else if (this.cursors.right.isDown) {
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

        // 检查敌人是否全部消灭
        if (this.enemies.children.entries.length === 0) {
            this.spawnEnemies();
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

        this.score += GameConfig.GAME.POINTS_PER_ENEMY;
        this.scoreText.setText('Score: ' + this.score);
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

        const gameOverText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'GAME OVER\nScore: ' + this.score,
            {
                fontSize: '48px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 添加重启按钮提示
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
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
}

module.exports = GameScene;
