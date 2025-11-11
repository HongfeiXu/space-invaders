# Space Invaders - Phaser Game

2D 射击游戏原型，使用 Phaser 3 + Webpack 5。

## 快速开始

```bash
npm install
npm start                    # http://localhost:3000
npm run build               # 生产构建
```

## 游戏状态

| 功能 | 状态 |
|------|------|
| 玩家控制（移动/射击） | ✅ |
| 敌人生成和移动 | ✅ |
| 碰撞检测和伤害 | ✅ |
| 敌人被击中闪烁效果 | ✅ |
| 暂停/继续（ESC） | ✅ |
| 得分和生命系统 | ✅ |
| 游戏结束和重启 | ✅ |

待实现：难度递增、音效、高分记录

## 项目结构

```
src/
├── index.js                 # Phaser 配置 + PreloadScene
└── scenes/GameScene.js     # 游戏逻辑（210行）

public/index.html           # HTML 入口
docs/                       # 文档
```

## 技术栈

- **框架**: Phaser 3 (Arcade Physics)
- **语言**: JavaScript (CommonJS)
- **构建**: Webpack 5 + Dev Server
- **分辨率**: 800x600

## 核心代码架构

### GameScene 主要方法

```javascript
create()              // 初始化: 玩家、敌人、UI、碰撞、输入
update()              // 每帧: 移动、射击、子弹清理
playerShoot()         // 玩家射击 (250ms 冷却)
enemyShoot()          // 敌人随机射击 (1s 间隔)
spawnEnemies()        // 生成 3×5 敌人阵列
hitEnemy()            // 敌人被击中: 闪烁 3 次后消灭
hitPlayer()           // 玩家受伤: -1 血
togglePause()         // ESC 暂停/继续
endGame()             // 游戏结束显示和重启
```

### Phaser 物理组的使用

```javascript
this.enemies = this.physics.add.group()
this.playerBullets = this.physics.add.group()
this.enemyBullets = this.physics.add.group()

// 碰撞检测
this.physics.add.overlap(playerBullets, enemies, hitEnemy)
this.physics.add.overlap(player, enemyBullets, hitPlayer)
```

## 游戏设置

| 参数 | 值 | 位置 |
|------|-----|------|
| 玩家速度 | 250 px/s | `update()` L93-96 |
| 射击冷却 | 250ms | `playerShoot()` L126 |
| 敌人速度 | ±50 px/s | `spawnEnemies()` L111 |
| 敌人射击 | 1s 间隔 | `create()` L67 |
| 敌人闪烁 | 80ms × 3 | `hitEnemy()` L145-146 |
| 生命值 | 3 | `create()` L14 |
| 得分/敌人 | 10 | `hitEnemy()` L154 |

## 扩展指南

### 添加难度递增

```javascript
// 在 create() 中
this.difficulty = 1
this.time.addEvent({
    delay: 30000,
    callback: () => this.difficulty++,
    loop: true
})

// 在 spawnEnemies() 中
enemy.setVelocityX(speed * this.difficulty)
```

### 添加音效

```javascript
// 在 PreloadScene.preload() 中
this.load.audio('shoot', 'assets/shoot.mp3')

// 在 playerShoot() 中
this.sound.play('shoot')
```

### 改进敌人 AI

敌人当前完全随机射击。可改为：
- 更频繁地向玩家方向射击
- 基于玩家位置调整速度
- 分波次增强难度

## 部署

见 `docs/DEPLOYMENT.md`。简单流程：

```bash
npm run build
git push origin main
# GitHub Pages 自动部署到 https://username.github.io/space-invaders/
```

## 性能

- 代码量：~250 行游戏逻辑
- 敌人数量：15 个（可调）
- 目标 FPS：60
- 包大小：~8.2 MB（Phaser 库）

## 代码质量

- ✅ 模块化场景架构
- ⚠️ 使用了魔法数字（可提取到配置）
- ⚠️ 物体池未优化（当前直接 destroy）
- ℹ️ 暂无自动化测试

## 相关资源

- [Phaser 文档](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 示例](https://labs.phaser.io/)
- 本项目文档：`GUIDE.md`（详细）、`PROGRESS.md`（开发过程）

---

*项目创建: 2025-11-11*
*引擎: Phaser 3.90.0*
*构建: Webpack 5.102.1*
