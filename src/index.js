const Phaser = require('phaser');
const GameScene = require('./scenes/GameScene');

// 创建简单图形的预加载场景
class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // 预加载音频文件
        // 背景音乐来自: Eric Matyas (www.soundimage.org)
        this.load.audio('backgroundMusic', '/assets/audio/Jewel-Thieves.mp3');
    }

    create() {
        // 创建玩家飞船纹理（白色三角形）
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0xffffff);
        playerGraphics.beginPath();
        playerGraphics.moveTo(20, 0);
        playerGraphics.lineTo(0, 40);
        playerGraphics.lineTo(40, 40);
        playerGraphics.closePath();
        playerGraphics.fillPath();
        playerGraphics.generateTexture('player', 40, 40);
        playerGraphics.destroy();

        // 创建敌人纹理（绿色矩形）
        const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        enemyGraphics.fillStyle(0x00ff00);
        enemyGraphics.fillRect(0, 0, 30, 30);
        enemyGraphics.generateTexture('enemy', 30, 30);
        enemyGraphics.destroy();

        // 创建玩家子弹纹理（黄色）
        const playerBulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerBulletGraphics.fillStyle(0xffff00);
        playerBulletGraphics.fillRect(0, 0, 6, 15);
        playerBulletGraphics.generateTexture('playerBullet', 6, 15);
        playerBulletGraphics.destroy();

        // 创建敌人子弹纹理（红色）
        const enemyBulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        enemyBulletGraphics.fillStyle(0xff0000);
        enemyBulletGraphics.fillRect(0, 0, 6, 15);
        enemyBulletGraphics.generateTexture('enemyBullet', 6, 15);
        enemyBulletGraphics.destroy();

        // 启动游戏场景
        this.scene.start('GameScene');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [PreloadScene, GameScene],
    parent: 'game',
    backgroundColor: '#000'
};

const game = new Phaser.Game(config);

module.exports = game;
