# 🎯 开发计划

这是 Space Invaders 游戏的下一步优化和功能扩展规划。根据当前状态和代码质量评估，列出了优先级不同的任务。

---

## 快速参考

### 启动游戏
```bash
npm start  # http://localhost:8080
npm run build  # 生产构建
```

### 核心文件位置
- **游戏逻辑**: `src/scenes/GameScene.js` (237 行)
- **Webpack 配置**: `webpack.config.js`
- **HTML 模板**: `public/index.html`

---

## 优先级 1: 代码质量 (1-2 小时)

### 1.1 配置提取 → `src/config/GameConfig.js`
**目标**: 消除代码中的魔法数字

**当前魔法数字**:
- 玩家速度: 250 px/s
- 射击冷却: 250 ms
- 敌人速度: ±50 px/s
- 敌人射击间隔: 1000 ms
- 敌人闪烁时长: 80 ms × 3 次
- 得分/敌人: 10 分
- 初始生命: 3 条

**推荐实现**:
```javascript
// src/config/GameConfig.js
module.exports = {
  PLAYER_SPEED: 250,
  SHOOT_COOLDOWN: 250,
  ENEMY_SPEED: 50,
  ENEMY_FIRE_INTERVAL: 1000,
  BLINK_DURATION: 80,
  POINTS_PER_ENEMY: 10,
  INITIAL_LIVES: 3
}
```

**收益**:
- ✅ 参数一目了然
- ✅ 便于平衡游戏难度
- ✅ 易于测试不同配置

### 1.2 物体池优化 → 预创建和复用
**当前问题**: 每次击中敌人或生成子弹都 `create` + `destroy`

**优化方案**:
```javascript
// 在 create() 中预创建
for (let i = 0; i < 100; i++) {
  this.playerBullets.create(0, 0, 'playerBullet')
    .setActive(false)
    .setVisible(false)
}

// 射击时复用而不是创建
const bullet = this.playerBullets.getFirstDead()
if (bullet) {
  bullet.setActive(true).setVisible(true)
  bullet.setPosition(player.x, player.y)
}
```

**收益**:
- ✅ 减少 GC 压力
- ✅ 可支持更多子弹
- ✅ 性能提升 10-20%

---

## 优先级 2: 游戏功能 (2-3 小时)

### 2.1 难度递增系统
**特性**: 游戏进行越久，敌人越强

**实现方式**:
```javascript
// 在 GameScene.create() 中
this.difficulty = 1
this.time.addEvent({
  delay: 30000,  // 每 30 秒难度 +1
  callback: () => {
    this.difficulty++
    // 敌人速度增加
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocityX(enemy.velocityX * 1.1)
    })
  },
  loop: true
})
```

**效果**:
- 敌人移动速度递增
- 敌人射击频率递增
- UI 显示当前难度

### 2.2 多波次系统 (Wave System)
**特性**: 击败所有敌人后生成新一波，难度递增

**伪代码**:
```javascript
checkWaveCleared() {
  if (this.enemies.children.entries.length === 0) {
    this.currentWave++
    this.spawnEnemies()  // 生成数量更多或移动更快的敌人
  }
}
```

### 2.3 敌人 AI 优化 → 目标导向射击
**当前**: 敌人随机射击
**改进**: 敌人射击时瞄准玩家

```javascript
enemyShoot() {
  const enemies = this.enemies.children.entries
  const enemy = enemies[Math.floor(Math.random() * enemies.length)]

  if (enemy) {
    // 计算指向玩家的方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      this.player.x, this.player.y
    )

    const bullet = this.enemyBullets.create(enemy.x, enemy.y, 'enemyBullet')
    bullet.setVelocity(
      Math.cos(angle) * 150,
      Math.sin(angle) * 150
    )
  }
}
```

---

## 优先级 3: 音效和视觉 (1-2 小时)

### 3.1 音效系统
**需要的声音**:
- 射击音 (玩家)
- 击中音 (敌人被击中)
- 爆炸音 (敌人销毁)
- 背景音乐 (循环)
- 游戏结束音

**使用 Phaser Sound API**:
```javascript
// 在 PreloadScene
this.load.audio('shoot', 'assets/shoot.mp3')

// 在 GameScene
this.sound.play('shoot')
```

### 3.2 粒子效果
**改进敌人被击中效果**:
- 替代简单的闪烁动画
- 添加爆炸粒子
- 飘落碎片效果

---

## 优先级 4: 玩家体验 (1.5-2 小时)

### 4.1 高分记录 → localStorage
**功能**:
- 游戏结束时保存分数
- 显示历史最高分
- 本地持久化（不需要服务器）

```javascript
// 保存
localStorage.setItem('highScore', this.score)

// 读取
const highScore = localStorage.getItem('highScore') || 0
```

### 4.2 游戏菜单和场景
**新增场景**:
- **MenuScene**: 开始画面，显示操作说明
- **GameScene**: 当前游戏场景
- **GameOverScene**: 游戏结束，显示分数和重启按钮

### 4.3 暂停菜单增强
**当前**: 仅按 ESC 暂停/继续
**改进**: 显示暂停菜单，可选：
- 继续游戏
- 重新开始
- 返回主菜单

---

## 优先级 5: 响应式和兼容性

### 5.1 响应式设计
**目标**: 适配不同屏幕尺寸

**方案**:
```javascript
// webpack.config.js 中修改
const width = window.innerWidth > 800 ? 800 : window.innerWidth - 20
const height = (width / 800) * 600
```

### 5.2 移动设备支持
- 触摸控制 (左右滑动移动，点击射击)
- 加速度计控制 (倾斜手机移动)

### 5.3 浏览器兼容性
- 测试 Chrome, Firefox, Safari, Edge
- IE11 支持 (如果需要)

---

## 优先级 6: 高级特性

### 6.1 离线支持 → Service Worker
**功能**: 无网络时也能玩游戏

### 6.2 排行榜 (需要后端)
**方案**:
- 后端 API 存储分数
- 显示全球/好友排行榜
- 每月/每周重置

### 6.3 关卡系统
**特性**:
- 多个预设难度关卡
- 关卡编辑器
- 自定义关卡分享

---

## 当前状态总结

| 项 | 状态 | 优先级 |
|---|------|--------|
| 代码组织 | ✅ | 已完成 |
| 配置提取 | ✅ | 已完成 |
| 物体池 | ⏸️ | 暂置* |
| 音效 | ✅ | 已完成 |
| 难度递增 | ✅ | 已完成 (通过波次射击加速) |
| 高分记录 | ✅ | 已完成 |
| 波次系统 | ✅ | 已完成 |
| 菜单系统 | ❌ | 中 |
| 响应式设计 | ❌ | 低 |
| Service Worker | ❌ | 低 |

*物体池优化：测试表明反而增加内存占用（24.5→26.5MB），已记录教训于 `documentation/memos/OBJECT_POOL_OPTIMIZATION.md`

---

## 性能基准

```
当前代码量: 237 行 (GameScene.js)
当前敌人数: 15 个 (可支持 50+)
FPS: 60 稳定
加载时间: ~2s (Phaser 库)
热更新: ~30ms
```

优化后预期:
- 敌人数: 100+ (物体池优化)
- 加载时间: ~1.5s (代码分割)

---

## 开发建议

### 推荐开发顺序
1. **配置提取** (快速胜利，改进代码质量)
2. **物体池** (性能基础)
3. **难度递增** (核心玩法)
4. **音效系统** (提升体验)
5. **高分记录** (完整度)

### 测试方法
```bash
npm start  # 开发服务器

# 开发时
# 1. 修改 GameScene.js
# 2. 浏览器自动刷新
# 3. F12 打开控制台检查错误

npm run build  # 构建前测试生产版本
```

### 版本管理
```bash
git add .
git commit -m "功能: 配置提取到 GameConfig.js"
git push origin main
# GitHub Pages 自动更新（1-2 分钟）
```

---

## 参考资源

| 资源 | 位置 | 用途 |
|------|------|------|
| 项目概览 | `../README.md` | 功能和架构 |
| 开发指南 | `memos/GUIDE.md` | 修改示例 |
| 部署指南 | `memos/DEPLOYMENT.md` | 部署流程 |
| Webpack 配置 | `memos/WEBPACK_CONFIG.md` | 构建系统 |
| 开发进度 | `PROGRESS.md` | 历史和架构决策 |
| Phaser 文档 | https://photonstorm.github.io/phaser3-docs/ | 游戏 API |

---

## 下一次会话待做

- [ ] 选择优先级 1 的任务开始实现
- [ ] 根据进度更新 PROGRESS.md
- [ ] 定期 commit 保持 git 历史清晰
- [ ] 功能完成后更新此计划文档

*最后更新: 2025-11-12*
