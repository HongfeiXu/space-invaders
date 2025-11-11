# 开发指南

## 项目开发流程

### 快速启动

```bash
# 1. 安装依赖（仅首次）
npm install

# 2. 启动开发服务器
npm start

# 浏览器自动打开 http://localhost:3000
```

### 文件修改工作流

1. 编辑源文件 (`src/` 或 `public/`)
2. Webpack 自动检测变化并重新编译
3. 浏览器自动刷新（HMR）
4. 看到变化立即反馈

### 构建生产版本

```bash
npm run build

# 输出到 dist/ 目录
```

## 代码结构详解

### 入口点: `src/index.js`

这是整个游戏的启动点，主要负责：

1. **创建 Phaser 配置**
   ```javascript
   const config = {
       type: Phaser.AUTO,              // 自动选择 Canvas 或 WebGL
       width: 800,
       height: 600,
       physics: {
           default: 'arcade',          // 使用 Arcade 物理引擎
           arcade: {
               gravity: { y: 0 },      // 无重力（太空游戏）
               debug: false            // 调试模式（改为 true 可看碰撞框）
           }
       },
       scene: [PreloadScene, GameScene], // 场景加载顺序
       parent: 'game',                 // HTML 元素 id
       backgroundColor: '#000'         // 黑色背景
   };
   ```

2. **PreloadScene 场景**
   - 生成游戏所需的纹理（图片）
   - 在这里加载资源、音效等
   - 完成后启动 GameScene

3. **初始化 Phaser**
   ```javascript
   const game = new Phaser.Game(config);
   ```

### 游戏逻辑: `src/scenes/GameScene.js`

**类结构**:
```javascript
class GameScene extends Phaser.Scene {
    constructor() { }      // 初始化
    create() { }           // 场景创建（初始化游戏对象）
    update() { }           // 每帧更新（游戏逻辑）
    // ... 其他方法
}
```

#### `create()` 方法详解

这个方法在场景启动时调用一次，用于初始化游戏对象：

```javascript
create() {
    // 1. 设置背景和基础变量
    this.cameras.main.setBackgroundColor('#000');
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;

    // 2. 创建 UI 文本
    this.scoreText = this.add.text(10, 10, 'Score: 0', {...});
    this.livesText = this.add.text(..., 'Lives: 3', {...});

    // 3. 创建玩家飞船
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 4. 创建物理组（用于管理多个对象）
    this.enemies = this.physics.add.group();
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    // 5. 生成敌人
    this.spawnEnemies();

    // 6. 设置碰撞检测
    this.physics.add.overlap(...);

    // 7. 设置输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 8. 设置定时事件
    this.time.addEvent({
        delay: 1000,
        callback: this.enemyShoot,
        loop: true
    });
}
```

#### `update()` 方法详解

这个方法每帧调用一次（约 60 次/秒），用于更新游戏状态：

```javascript
update() {
    if (this.gameOver) return; // 游戏结束，停止更新

    // 1. 玩家移动控制
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-250);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(250);
    } else {
        this.player.setVelocityX(0);
    }

    // 2. 玩家射击
    if (this.spaceBar.isDown) {
        this.playerShoot();
    }

    // 3. 清理超出屏幕的子弹
    this.playerBullets.children.entries.forEach(bullet => {
        if (bullet.y < 0) bullet.destroy();
    });

    // 4. 检查敌人是否全部消灭
    if (this.enemies.children.entries.length === 0) {
        this.spawnEnemies();
    }
}
```

## 常见修改和扩展

### 修改游戏窗口大小

在 `src/index.js` 中修改 config：

```javascript
const config = {
    width: 1024,   // 改为 1024
    height: 768,   // 改为 768
    // ... 其他配置
};
```

### 修改敌人数量和排列

在 `src/scenes/GameScene.js` 中修改 `spawnEnemies()` 方法：

```javascript
spawnEnemies() {
    const rows = 4;        // 改为 4 行
    const cols = 6;        // 改为 6 列
    const spacingX = 100;  // 增加间距到 100px
    const spacingY = 70;
    // ... 其他代码
}
```

### 修改玩家速度

在 `update()` 方法中：

```javascript
if (this.cursors.left.isDown) {
    this.player.setVelocityX(-350);  // 改为 -350 (从 -250)
}
```

### 修改敌人速度

在 `spawnEnemies()` 方法中：

```javascript
const enemy = this.enemies.create(x, y, 'enemy');
enemy.setVelocityX(Phaser.Math.Between(-100, 100));  // 改为 -100~100
```

### 修改敌人射击频率

在 `create()` 方法中：

```javascript
this.time.addEvent({
    delay: 500,    // 改为 500ms（射击更频繁）
    callback: this.enemyShoot,
    loop: true
});
```

### 修改射击冷却时间

在 `playerShoot()` 方法中：

```javascript
if (currentTime - this.lastShotTime > 150) {  // 改为 150ms（射速更快）
    // ...
}
```

### 修改击杀敌人得分

在 `hitEnemy()` 方法中：

```javascript
hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.score += 50;  // 改为 50 分
    this.scoreText.setText('Score: ' + this.score);
}
```

### 修改初始生命值

在 `create()` 方法中：

```javascript
this.lives = 5;  // 改为 5 条命
```

## 添加新功能的步骤

### 例子：添加敌人被击中时的闪烁效果

**步骤 1**: 在 `hitEnemy()` 方法中添加闪烁代码

```javascript
hitEnemy(bullet, enemy) {
    bullet.destroy();

    // 添加闪烁效果
    this.tweens.add({
        targets: enemy,
        alpha: 0.5,        // 透明度变为 0.5
        duration: 100,     // 100ms
        yoyo: true,        // 往返
        repeat: 3          // 重复 3 次
    });

    // 然后消灭敌人
    this.time.delayedCall(400, () => {
        enemy.destroy();
    });

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
}
```

**步骤 2**: 在浏览器中测试修改是否生效

### 例子：添加难度递增

**步骤 1**: 在 `create()` 中添加难度追踪

```javascript
create() {
    // ... 其他代码
    this.difficulty = 1;  // 难度等级
    this.enemyBaseSpeed = 50;  // 敌人基础速度

    // 每 30 秒增加难度
    this.time.addEvent({
        delay: 30000,
        callback: () => {
            this.difficulty++;
            console.log('Difficulty increased to:', this.difficulty);
        },
        loop: true
    });
}
```

**步骤 2**: 在生成敌人时使用难度

```javascript
spawnEnemies() {
    // ...
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;
            const enemy = this.enemies.create(x, y, 'enemy');

            // 根据难度调整速度
            const speed = this.enemyBaseSpeed * this.difficulty;
            enemy.setVelocityX(Phaser.Math.Between(-speed, speed));

            enemy.setBounce(1, 1);
            enemy.setCollideWorldBounds(true);
        }
    }
}
```

## 调试技巧

### 启用物理调试模式

在 `src/index.js` 中修改：

```javascript
arcade: {
    gravity: { y: 0 },
    debug: true  // 改为 true
}
```

这样会显示所有碰撞体的边框，方便调试碰撞问题。

### 输出日志

在关键位置添加 `console.log()`:

```javascript
hitEnemy(bullet, enemy) {
    console.log('Enemy hit! Score:', this.score);
    // ... 其他代码
}
```

在浏览器的开发者工具（F12）的 Console 标签查看输出。

### 检查游戏对象数量

在 `update()` 中添加：

```javascript
// 临时调试（记得删除）
if (Math.random() < 0.01) {  // 每秒随机输出一次
    console.log('Enemies:', this.enemies.children.entries.length);
    console.log('Player bullets:', this.playerBullets.children.entries.length);
    console.log('Enemy bullets:', this.enemyBullets.children.entries.length);
}
```

## 性能优化建议

### 1. 使用对象池（Object Pool）

当前实现每次创建新对象，频繁销毁会影响性能。

```javascript
// 预创建子弹池
this.playerBullets = this.physics.add.group();
for (let i = 0; i < 100; i++) {
    const bullet = this.playerBullets.create(0, 0, 'playerBullet');
    bullet.setActive(false).setVisible(false);
}
```

射击时复用而不是创建：

```javascript
playerShoot() {
    const bullet = this.playerBullets.getFirst(false);  // 获取非活跃子弹
    if (bullet) {
        bullet.setActive(true).setVisible(true);
        bullet.setPosition(this.player.x, this.player.y - 10);
        bullet.setVelocityY(-400);
    }
}
```

### 2. 减少物理计算

关闭不需要的碰撞检测：

```javascript
// 只在需要时启用敌人之间的碰撞
// this.physics.add.collider(this.enemies, this.enemies);
```

### 3. 限制敌人数量

```javascript
spawnEnemies() {
    const maxEnemies = 30;  // 最多 30 个敌人
    if (this.enemies.children.entries.length > maxEnemies) {
        return;
    }
    // ... 生成代码
}
```

## 常见错误和解决方案

### 错误 1: "Cannot read property 'x' of undefined"

**原因**: 尝试访问不存在的对象属性

**解决**:
```javascript
// ❌ 错误
if (this.player.x > 400) { }

// ✅ 正确
if (this.player && this.player.x > 400) { }
```

### 错误 2: "Texture not found: 'player'"

**原因**: 纹理在 PreloadScene 中没有正确生成

**解决**: 确保 PreloadScene 中正确调用了 `generateTexture()`

### 错误 3: 子弹一直射出不停

**原因**: 射击冷却时间逻辑错误

**解决**:
```javascript
// ✅ 正确的冷却逻辑
if (!this.lastShotTime) this.lastShotTime = 0;
const currentTime = this.time.now;
if (currentTime - this.lastShotTime > 250) {
    // 射击
    this.lastShotTime = currentTime;  // 不要忘记更新时间
}
```

## 下一步学习资源

- [Phaser 官方文档](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 示例](https://labs.phaser.io/)
- [WebGL 和 Canvas 教程](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

*最后更新: 2025-11-11*
