# 开发指南

## 快速开发流程

```bash
npm start                   # 开发服务器 + HMR
npm run build              # 生产构建
```

编辑 `src/` 文件自动热更新。

## 代码概览

### GameScene 架构

```
create()                  # 初始化阶段
├── UI 文本
├── 玩家/敌人/子弹对象
├── 碰撞检测
├── 输入键位
└── 定时器（敌人射击）

update()                  # 每帧更新
├── 玩家移动（↑↓← →）
├── 射击逻辑（250ms 冷却）
├── 子弹清理（超出屏幕）
└── 敌人补充
```

### Phaser 常用 API

```javascript
// 精灵
this.add.sprite(x, y, 'texture')
sprite.setVelocityX(speed)
sprite.setCollideWorldBounds(true)

// 物理组
this.physics.add.group()
group.create(x, y, 'texture')
group.children.entries   // 遍历组内对象

// 碰撞检测
this.physics.add.overlap(group1, group2, callback)

// 动画 (Tween)
this.tweens.add({
    targets: object,
    alpha: 0.5,
    duration: 100,
    yoyo: true,
    repeat: 3
})

// 输入
this.input.keyboard.createCursorKeys()
this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
this.input.keyboard.on('keydown-ESC', callback)

// 定时器
this.time.addEvent({
    delay: 1000,
    callback: func,
    loop: true
})
```

## 常见修改

### 修改游戏参数

所有参数在 `src/scenes/GameScene.js` 中：

| 参数 | 当前值 | 位置 | 修改示例 |
|------|--------|------|---------|
| 玩家速度 | 250 | L93-96 | 改为 350 |
| 射击冷却 | 250ms | L126 | 改为 150 |
| 敌人速度 | ±50 | L111 | 改为 ±100 |
| 敌人射击间隔 | 1000ms | L67 | 改为 500 |
| 敌人闪烁时间 | 80ms | L145 | 改为 100 |
| 生命值 | 3 | L14 | 改为 5 |
| 得分 | 10 | L154 | 改为 50 |
| 游戏分辨率 | 800x600 | src/index.js L54-55 | 改为 1024x768 |

### 实现难度递增

在 `create()` 方法添加：

```javascript
this.difficulty = 1

this.time.addEvent({
    delay: 30000,           // 每 30 秒
    callback: () => {
        this.difficulty++
        console.log('Difficulty:', this.difficulty)
    },
    loop: true
})
```

在 `spawnEnemies()` 中修改敌人速度：

```javascript
const speed = 50 * this.difficulty   // 随难度增加
enemy.setVelocityX(Phaser.Math.Between(-speed, speed))
```

### 添加音效

1. 在 `src/index.js` 的 `PreloadScene.preload()` 中加载：

```javascript
preload() {
    this.load.audio('shoot', 'assets/sounds/shoot.mp3')
    this.load.audio('explosion', 'assets/sounds/explosion.mp3')
}
```

2. 在 `GameScene` 中播放：

```javascript
// 射击时
playerShoot() {
    // ...
    this.sound.play('shoot')
}

// 敌人消灭时
hitEnemy() {
    // ...
    this.sound.play('explosion')
}
```

### 改进敌人 AI

当前敌人完全随机射击。改为向玩家方向射击：

```javascript
enemyShoot() {
    if (this.enemies.children.entries.length === 0) return

    const randomEnemy = Phaser.Utils.Array.GetRandom(this.enemies.children.entries)

    // 计算射击方向（指向玩家）
    const angle = Phaser.Math.Angle.Between(
        randomEnemy.x, randomEnemy.y,
        this.player.x, this.player.y
    )

    const bullet = this.enemyBullets.create(randomEnemy.x, randomEnemy.y + 10, 'enemyBullet')

    // 按角度射击
    this.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), 200, bullet.body.velocity)
}
```

### 提取配置到单独文件

创建 `src/config/GameConfig.js`：

```javascript
module.exports = {
    GAME: {
        WIDTH: 800,
        HEIGHT: 600,
        FPS: 60
    },
    PLAYER: {
        SPEED: 250,
        SHOOT_DELAY: 250
    },
    ENEMY: {
        SPEED: 50,
        SHOOT_DELAY: 1000
    },
    BULLET: {
        PLAYER_SPEED: 400,
        ENEMY_SPEED: 200
    }
}
```

在 GameScene 中使用：

```javascript
const config = require('../config/GameConfig')

this.player.setVelocityX(config.PLAYER.SPEED)
```

## 物体池优化

当前直接 `destroy()` 子弹，大量创建销毁影响性能。改为预创建对象池：

```javascript
// 在 create() 中预创建
this.playerBullets = this.physics.add.group()
for (let i = 0; i < 100; i++) {
    const bullet = this.playerBullets.create(0, 0, 'playerBullet')
    bullet.setActive(false).setVisible(false)
}

// 射击时复用
playerShoot() {
    const bullet = this.playerBullets.getFirst(false)  // 获取非活跃子弹
    if (bullet) {
        bullet.setActive(true).setVisible(true)
        bullet.setPosition(this.player.x, this.player.y - 10)
        bullet.setVelocityY(-400)
    }
}

// 超出屏幕时回收
update() {
    this.playerBullets.children.entries.forEach(bullet => {
        if (bullet.y < 0 && bullet.active) {
            bullet.setActive(false).setVisible(false)
        }
    })
}
```

## 调试技巧

### 显示碰撞体

在 `src/index.js` 中修改：

```javascript
arcade: {
    gravity: { y: 0 },
    debug: true    // 显示碰撞框
}
```

### 输出日志

```javascript
// 敌人被击中时
console.log('Enemy hit. Score:', this.score)

// 游戏状态
console.log('Enemies:', this.enemies.children.entries.length)
console.log('Player bullets:', this.playerBullets.children.entries.length)
```

在浏览器 DevTools (F12) → Console 查看。

### 临时禁用敌人射击

在 `create()` 中注释掉：

```javascript
// this.time.addEvent({...})  // 注释此行
```

## 性能优化清单

- [ ] 提取魔法数字到配置文件
- [ ] 实现物体池（子弹复用）
- [ ] 限制敌人最大数量
- [ ] 使用 Canvas 而非 WebGL（如需更好兼容性）
- [ ] 压缩图片资源
- [ ] 删除未使用的代码

## 常见错误

**错误**: `Cannot read property 'x' of undefined`
**原因**: 对象被销毁后仍被访问
**修复**: 检查对象是否存在

```javascript
if (this.player && this.player.x > 400) { }
```

**错误**: 子弹一直射出不停
**原因**: `lastShotTime` 未正确更新
**修复**: 在射击后更新时间

```javascript
this.lastShotTime = this.time.now
```

## 相关资源

- [Phaser 3 API 文档](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 示例集](https://labs.phaser.io/)
- [物理引擎文档](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.html)

---

*最后更新: 2025-11-11*
