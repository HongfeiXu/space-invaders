const Phaser = require('phaser');

/**
 * GameOverScene - 游戏结束场景
 *
 * 职责：
 * - 显示游戏结束信息
 * - 显示最终分数和最高分
 * - 新纪录动画
 * - 提供"重新开始"和"返回主菜单"按钮
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    /**
     * 初始化场景，接收从GameScene传递的数据
     * @param {object} data - { score, highScore, isNewRecord }
     */
    init(data) {
        this.score = data.score || 0;
        this.highScore = data.highScore || 0;
        this.isNewRecord = data.isNewRecord || false;
    }

    create() {
        // 游戏结束标题
        this.add.text(
            400,
            200,
            'GAME OVER',
            {
                fontSize: '60px',
                fill: '#ff6b6b',
                fontStyle: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 显示最终分数
        this.add.text(
            400,
            350,
            `Score: ${this.score}`,
            {
                fontSize: '36px',
                fill: '#fff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 显示最高分
        const highScoreColor = this.isNewRecord ? '#FFD700' : '#aaa';
        this.add.text(
            400,
            410,
            `High Score: ${this.highScore}`,
            {
                fontSize: '28px',
                fill: highScoreColor,
                align: 'center'
            }
        ).setOrigin(0.5);

        // 如果是新纪录，显示特殊动画
        if (this.isNewRecord) {
            const newRecordText = this.add.text(
                400,
                480,
                '🎉 NEW RECORD! 🎉',
                {
                    fontSize: '40px',
                    fill: '#FFD700',
                    fontStyle: 'bold',
                    align: 'center'
                }
            ).setOrigin(0.5);

            // 新纪录文字闪烁动画
            this.tweens.add({
                targets: newRecordText,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // 创建"重新开始"按钮
        const restartButton = this.createButton(
            300,
            650,
            'RESTART',
            () => {
                // 重新启动游戏场景
                this.scene.start('GameScene');
            },
            {
                width: 200,
                height: 70,
                fontSize: '28px',
                bgColor: 0xff6b6b
            }
        );

        // 创建"返回主菜单"按钮
        const mainMenuButton = this.createButton(
            500,
            650,
            'MAIN MENU',
            () => {
                // 返回主菜单
                this.scene.start('MenuScene');
            },
            {
                width: 200,
                height: 70,
                fontSize: '24px',
                bgColor: 0x4caf50
            }
        );

        // 提示信息
        this.add.text(
            400,
            900,
            'Press SPACE to restart',
            {
                fontSize: '20px',
                fill: '#666',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 监听空格键快速重启
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
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
            width: options.width || 200,
            height: options.height || 60,
            fontSize: options.fontSize || '24px',
            bgColor: options.bgColor || 0x4caf50,
            bgAlpha: options.bgAlpha || 0.8,
            textColor: options.textColor || '#fff',
            borderColor: options.borderColor || 0xffffff,
            borderWidth: options.borderWidth || 2
        };

        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(config.bgColor, config.bgAlpha);
        bg.lineStyle(config.borderWidth, config.borderColor, 1);
        bg.fillRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);
        bg.strokeRoundedRect(-config.width / 2, -config.height / 2, config.width, config.height, 8);

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
            if (callback) {
                callback();
            }
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
}

module.exports = GameOverScene;
