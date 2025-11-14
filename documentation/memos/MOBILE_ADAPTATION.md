# 移动端适配计划

Space Invaders 游戏的移动端适配完整计划和实施进度记录。

---

## 当前状态

| 阶段 | 状态 | 完成时间 |
|------|------|---------|
| MVP（响应式 + 触摸控制） | ✅ 已完成 | 2025-11-14 |
| UI 动态调整 | ❌ 待实施 | - |
| 触摸反馈优化 | ❌ 待实施 | - |
| 暂停按钮 | ❌ 待实施 | - |

---

## MVP 方案（已完成）

### 目标
用最少的代码改动，让游戏能在手机上玩起来。

### 实施内容

#### 1. 响应式缩放（`src/index.js`）

**改动**：添加 Phaser Scale Manager 配置

```javascript
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,          // 保持宽高比缩放
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // ... 其他配置
};
```

**效果**：游戏自动缩放适配任何屏幕尺寸

#### 2. 触摸控制（`src/scenes/GameScene.js`）

**改动 1**：在 `create()` 中添加触摸事件监听

```javascript
create() {
    // ... 现有代码 ...

    // 触摸控制
    this.isTouchLeft = false;
    this.isTouchRight = false;

    this.input.on('pointerdown', (pointer) => {
        const halfWidth = this.cameras.main.width / 2;
        if (pointer.x < halfWidth) {
            this.isTouchLeft = true;
        } else {
            this.isTouchRight = true;
        }
    });

    this.input.on('pointerup', () => {
        this.isTouchLeft = false;
        this.isTouchRight = false;
    });
}
```

**改动 2**：在 `update()` 中整合触摸控制

```javascript
update() {
    // 玩家移动控制（支持键盘 + 触摸）
    if (this.cursors.left.isDown || this.keyA.isDown || this.isTouchLeft) {
        this.player.setVelocityX(-GameConfig.PLAYER.SPEED);
    } else if (this.cursors.right.isDown || this.keyD.isDown || this.isTouchRight) {
        this.player.setVelocityX(GameConfig.PLAYER.SPEED);
    } else {
        this.player.setVelocityX(0);
    }

    // 玩家射击（移动端自动射击）
    if (this.spaceBar.isDown || this.isTouchLeft || this.isTouchRight) {
        this.playerShoot();
    }
}
```

### 操作方式

#### 桌面端（保持不变）
- 方向键 / A-D 键：左右移动
- 空格键：射击

#### 移动端（新增）
- **触摸屏幕左半边**：向左移动 + 自动射击
- **触摸屏幕右半边**：向右移动 + 自动射击
- **松手**：停止移动

### MVP 优势

✅ **代码最少**：总共只改 ~50 行
✅ **实施最快**：1-2 小时完成
✅ **立即可玩**：改完就能在手机上玩
✅ **零风险**：不影响现有功能
✅ **兼容性好**：桌面和移动都支持

### MVP 局限性

⚠️ UI 文字在小屏幕可能偏小（阶段 2 优化）
⚠️ 没有触摸区域视觉反馈（阶段 3 优化）
⚠️ 没有暂停按钮（阶段 4 优化）
⚠️ 固定坐标在极小屏幕可能布局问题（阶段 2 优化）

---

## 阶段 2：UI 动态调整（待实施）

### 目标
让 UI 在所有屏幕尺寸下都清晰可见。

### 实施计划

#### 2.1 相对坐标系统

**修改文件**：`src/config/GameConfig.js`

**改动**：所有固定坐标改为相对坐标（函数形式）

```javascript
PLAYER: {
    SPEED: 250,
    INITIAL_X: (width) => width / 2,      // 改前：400
    INITIAL_Y: (height) => height * 0.92, // 改前：550
    BULLET_SPEED: 400,
    SHOOT_COOLDOWN: 250,
    // ...
}

ENEMY_SPAWN: {
    ROWS: 3,
    COLS: 5,
    SPACING_X: (width) => width * 0.1,    // 改前：80
    SPACING_Y: (height) => height * 0.1,  // 改前：60
    START_X: (width) => width * 0.325,    // 改前：260
    START_Y: (height) => height * 0.14    // 改前：85
}
```

**修改文件**：`src/scenes/GameScene.js`

**改动**：在 `create()` 和其他使用坐标的地方调用函数

```javascript
// 改前
this.player = this.physics.add.sprite(
    GameConfig.PLAYER.INITIAL_X,
    GameConfig.PLAYER.INITIAL_Y,
    'player'
);

// 改后
const width = this.cameras.main.width;
const height = this.cameras.main.height;
this.player = this.physics.add.sprite(
    GameConfig.PLAYER.INITIAL_X(width),
    GameConfig.PLAYER.INITIAL_Y(height),
    'player'
);
```

#### 2.2 动态字体大小

**修改文件**：`src/config/GameConfig.js`

**新增配置**：

```javascript
RESPONSIVE: {
    BASE_WIDTH: 800,
    BASE_HEIGHT: 600,
    FONT_SCALE_FACTOR: (screenWidth) => {
        return Math.max(0.6, Math.min(1.0, screenWidth / 800));
    }
}
```

**修改文件**：`src/scenes/GameScene.js`

**改动**：所有文字大小根据屏幕宽度缩放

```javascript
createUITexts() {
    const width = this.cameras.main.width;
    const fontScale = GameConfig.RESPONSIVE.FONT_SCALE_FACTOR(width);

    this.waveText = this.add.text(
        width / 2,
        15,
        `WAVE: ${this.currentWave}/${GameConfig.WAVE.MAX_WAVE}`,
        {
            fontSize: Math.round(28 * fontScale) + 'px',
            fill: '#ffd700',
            fontStyle: 'bold'
        }
    ).setOrigin(0.5, 0);

    // ... 其他 UI 文字类似处理
}
```

### 预期效果

✅ 所有屏幕尺寸下布局合理
✅ 小屏幕（320px）文字清晰可读
✅ 大屏幕（2K+）不会UI过大

### 预计时间

2-3 小时

---

## 阶段 3：触摸反馈优化（待实施）

### 目标
让玩家清楚知道触摸了哪里，提升操作手感。

### 实施计划

#### 3.1 触摸区域视觉提示

**修改文件**：`src/scenes/GameScene.js`

**新增**：在屏幕底部显示左右控制区域边界线

```javascript
create() {
    // ... 现有代码 ...

    // 触摸区域提示线（半透明）
    const halfWidth = this.cameras.main.width / 2;
    const height = this.cameras.main.height;

    this.touchGuide = this.add.graphics();
    this.touchGuide.lineStyle(2, 0xffffff, 0.3);
    this.touchGuide.lineBetween(halfWidth, 0, halfWidth, height);
    this.touchGuide.setDepth(-1);  // 背景层
}
```

#### 3.2 触摸反馈动画

**改动**：触摸时显示圆形涟漪效果

```javascript
this.input.on('pointerdown', (pointer) => {
    // 原有逻辑 ...

    // 触摸反馈动画
    const circle = this.add.circle(pointer.x, pointer.y, 20, 0xffffff, 0.5);
    this.tweens.add({
        targets: circle,
        scale: { from: 1, to: 2 },
        alpha: { from: 0.5, to: 0 },
        duration: 300,
        onComplete: () => circle.destroy()
    });
});
```

#### 3.3 震动反馈（可选）

**改动**：玩家被击中时手机震动

```javascript
hitPlayer(player, bulletOrEnemy) {
    // ... 原有逻辑 ...

    // 震动反馈（如果设备支持）
    if (navigator.vibrate) {
        navigator.vibrate(200);  // 震动 200ms
    }
}
```

### 预期效果

✅ 玩家清楚触摸区域
✅ 触摸有视觉反馈
✅ 被击中有震动反馈（可选）

### 预计时间

2-3 小时

---

## 阶段 4：UI 交互优化（待实施）

### 目标
添加移动端友好的 UI 按钮。

### 实施计划

#### 4.1 暂停按钮

**修改文件**：`src/scenes/GameScene.js`

**新增**：右上角暂停按钮

```javascript
create() {
    // ... 现有代码 ...

    // 暂停按钮（移动端）
    const btnSize = 50;
    const pauseBtn = this.add.rectangle(
        this.cameras.main.width - btnSize / 2 - 10,
        btnSize / 2 + 10,
        btnSize,
        btnSize,
        0x333333,
        0.7
    ).setInteractive();

    const pauseText = this.add.text(
        pauseBtn.x,
        pauseBtn.y,
        '||',
        { fontSize: '24px', fill: '#fff' }
    ).setOrigin(0.5);

    pauseBtn.on('pointerdown', () => {
        this.togglePause();
    });
}
```

#### 4.2 重启按钮

**改动**：暂停菜单中添加可点击的重启按钮

```javascript
togglePause() {
    if (this.isPaused) {
        // ... 显示暂停菜单 ...

        // 添加重启按钮
        const restartBtn = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
            200,
            50,
            0x444444
        ).setInteractive();

        const restartText = this.add.text(
            restartBtn.x,
            restartBtn.y,
            'Restart',
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5);

        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}
```

### 预期效果

✅ 移动端有暂停按钮
✅ 暂停菜单有重启按钮
✅ 键盘控制保持不变

### 预计时间

1-2 小时

---

## 性能目标

所有阶段完成后，性能指标应保持：

| 指标 | 目标 | 备注 |
|------|------|------|
| **FPS** | 60+ | 移动端和桌面端 |
| **内存** | < 30 MB | 峰值内存 |
| **加载时间** | < 3s | 首次加载 |
| **响应延迟** | < 50ms | 触摸响应时间 |

---

## 测试清单

### 设备测试

- [ ] iPhone (iOS Safari)
- [ ] Android 手机 (Chrome)
- [ ] iPad (iOS Safari)
- [ ] Android 平板 (Chrome)
- [ ] 桌面浏览器 (Chrome/Firefox/Safari)

### 分辨率测试

- [ ] 320px 宽度（小屏手机）
- [ ] 375px 宽度（iPhone 标准）
- [ ] 768px 宽度（平板竖屏）
- [ ] 1024px 宽度（平板横屏）
- [ ] 1920px 宽度（桌面）

### 功能测试

- [ ] 触摸左移正常
- [ ] 触摸右移正常
- [ ] 自动射击正常
- [ ] 暂停/恢复正常
- [ ] 游戏结束/重启正常
- [ ] 键盘控制正常（桌面端）

---

## 参考资源

- [Phaser Scale Manager 文档](https://photonstorm.github.io/phaser3-docs/Phaser.Scale.ScaleManager.html)
- [Phaser Input 文档](https://photonstorm.github.io/phaser3-docs/Phaser.Input.InputPlugin.html)
- [移动端游戏设计最佳实践](https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch)

---

*文档创建时间: 2025-11-14*
*最后更新: 2025-11-14*
*当前阶段: MVP 完成*
