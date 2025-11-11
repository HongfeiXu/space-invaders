const Phaser = require('phaser');

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 设置游戏背景
        this.cameras.main.setBackgroundColor('#000');

        // 初始化游戏变量
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;

        // 创建UI文本
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '20px',
            fill: '#fff'
        });

        this.livesText = this.add.text(this.cameras.main.width - 150, 10, 'Lives: 3', {
            fontSize: '20px',
            fill: '#fff'
        });

        // 创建玩家飞船
        this.player = this.physics.add.sprite(400, 550, 'player');
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

        // 敌人射击定时器
        this.time.addEvent({
            delay: 1000,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.gameOver) return;

        // 玩家移动控制
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-250);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(250);
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
        const rows = 3;
        const cols = 5;
        const spacingX = 80;
        const spacingY = 60;
        const startX = 100;
        const startY = 50;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;
                const enemy = this.enemies.create(x, y, 'enemy');
                enemy.setVelocityX(Phaser.Math.Between(-50, 50));
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
        if (currentTime - this.lastShotTime > 250) {
            const bullet = this.playerBullets.create(this.player.x, this.player.y - 10, 'playerBullet');
            bullet.setVelocityY(-400);
            this.lastShotTime = currentTime;
        }
    }

    enemyShoot() {
        if (this.enemies.children.entries.length === 0) return;

        const randomEnemy = Phaser.Utils.Array.GetRandom(this.enemies.children.entries);
        const bullet = this.enemyBullets.create(randomEnemy.x, randomEnemy.y + 10, 'enemyBullet');
        bullet.setVelocityY(200);
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.score += 10;
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
                player.setPosition(400, 550);
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
