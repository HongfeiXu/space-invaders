const Phaser = require('phaser');
const ScoreManager = require('../managers/ScoreManager');
const AudioManager = require('../managers/AudioManager');

/**
 * MenuScene - 主菜单场景
 *
 * 职责：
 * - 显示游戏标题和操作说明
 * - 显示最高分
 * - 提供"开始游戏"按钮
 * - 播放背景音乐
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // 初始化管理器
        this.scoreManager = new ScoreManager(this);
        this.audioManager = new AudioManager(this);

        // 播放背景音乐
        this.audioManager.playBackgroundMusic();

        // 游戏标题
        this.add.text(
            400,
            150,
            'SPACE INVADERS',
            {
                fontSize: '60px',
                fill: '#00ff00',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 最高分显示
        this.add.text(
            400,
            250,
            `High Score: ${this.scoreManager.getHighScore()}`,
            {
                fontSize: '28px',
                fill: '#ffd700',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 操作说明标题
        this.add.text(
            400,
            350,
            'CONTROLS',
            {
                fontSize: '32px',
                fill: '#fff',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // PC操作说明
        this.add.text(
            400,
            420,
            'PC: ← → Move | SPACE Shoot | ESC Pause | R Restart',
            {
                fontSize: '20px',
                fill: '#aaa',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 移动端操作说明
        this.add.text(
            400,
            460,
            'Mobile: Virtual Buttons | Auto Shoot',
            {
                fontSize: '20px',
                fill: '#aaa',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 创建"开始游戏"按钮
        const startButton = this.createButton(
            400,
            600,
            'START GAME',
            () => {
                // 停止背景音乐（GameScene会重新播放）
                this.audioManager.stopBackgroundMusic();
                // 启动游戏场景
                this.scene.start('GameScene');
            },
            {
                width: 250,
                height: 70,
                fontSize: '32px'
            }
        );

        // 版本信息
        this.add.text(
            400,
            1150,
            'v1.0.0',
            {
                fontSize: '16px',
                fill: '#666',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 注册 shutdown 事件以清理资源
        this.events.on('shutdown', this.shutdown, this);
    }

    /**
     * 创建按钮
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} text - 按钮文字
     * @param {Function} callback - 点击回调
     * @param {object} options - 样式选项
     * @returns {Phaser.GameObjects.Container}
     */
    createButton(x, y, text, callback, options = {}) {
        const config = {
            width: options.width || 250,
            height: options.height || 60,
            fontSize: options.fontSize || '28px',
            bgColor: options.bgColor || 0x00ff00,
            bgAlpha: options.bgAlpha || 0.8,
            textColor: options.textColor || '#000',
            borderColor: options.borderColor || 0xffffff,
            borderWidth: options.borderWidth || 3
        };

        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(config.bgColor, config.bgAlpha);
        bg.lineStyle(config.borderWidth, config.borderColor, 1);
        bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);
        bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);

        const buttonText = this.add.text(0, 0, text, {
            fontSize: config.fontSize,
            fill: config.textColor,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, buttonText]);

        container.setInteractive(
            new Phaser.Geom.Rectangle(-config.width / 2, -config.height / 2, config.width, config.height),
            Phaser.Geom.Rectangle.Contains
        );

        container.on('pointerdown', () => {
            container.setScale(0.95);
            bg.clear();
            bg.fillStyle(config.bgColor, config.bgAlpha + 0.1);
            bg.lineStyle(config.borderWidth, config.borderColor, 1);
            bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);
            bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);
        });

        container.on('pointerup', () => {
            container.setScale(1);
            bg.clear();
            bg.fillStyle(config.bgColor, config.bgAlpha);
            bg.lineStyle(config.borderWidth, config.borderColor, 1);
            bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);
            bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);
            if (callback) {
                callback();
            }
        });

        container.on('pointerout', () => {
            container.setScale(1);
            bg.clear();
            bg.fillStyle(config.bgColor, config.bgAlpha);
            bg.lineStyle(config.borderWidth, config.borderColor, 1);
            bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);
            bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 10);
        });

        return container;
    }

    /**
     * 清理资源
     */
    shutdown() {
        // 清理管理器
        if (this.audioManager) {
            this.audioManager.shutdown();
        }
        if (this.scoreManager) {
            this.scoreManager.shutdown();
        }

        // 移除事件监听器
        this.events.off('shutdown', this.shutdown, this);
    }
}

module.exports = MenuScene;
