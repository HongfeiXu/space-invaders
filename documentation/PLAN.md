# 🎯 开发计划

Space Invaders 游戏的下一步功能规划和优化方向。

> **📚 已完成功能**：请查看 [`PROGRESS.md`](PROGRESS.md) 和 [`archive/COMPLETED_FEATURES.md`](archive/COMPLETED_FEATURES.md)

---

## 待实现功能（优先级顺序）

### 优先级 1：音效系统（高优先级）

#### 1.1 SFX 音效系统
**需要的声音**:
- 射击音（玩家）
- 击中音（敌人被击中）
- 爆炸音（敌人销毁）
- 玩家被击中音
- 游戏结束音

**实施位置**: `src/managers/AudioManager.js`

---

### 优先级 2：游戏功能

#### 2.1 敌人 AI 优化 → 目标导向射击
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

### 优先级 3：视觉效果

#### 3.1 粒子效果
**改进敌人被击中效果**:
- 替代简单的闪烁动画
- 添加爆炸粒子
- 飘落碎片效果

**实施位置**: `src/managers/EffectsManager.js`

---

### 优先级 4：玩家体验

#### 4.1 游戏菜单和场景
**新增场景**:
- **MenuScene**: 开始画面，显示操作说明
- **GameScene**: 当前游戏场景
- **GameOverScene**: 游戏结束，显示分数和重启按钮

#### 4.2 暂停菜单增强
**当前**: ✅ 已部分实现 (ESC 暂停/继续 + R 重新开始)
**改进**: 显示暂停菜单，可选：
- ✅ 继续游戏 (ESC)
- ✅ 重新开始 (R 键)
- ❌ 返回主菜单 (待实现)

---

### 优先级 5：高级特性

#### 5.1 离线支持 → Service Worker
**功能**: 无网络时也能玩游戏

#### 5.2 排行榜 (需要后端)
**方案**:
- 后端 API 存储分数
- 显示全球/好友排行榜
- 每月/每周重置

#### 5.3 关卡系统
**特性**:
- 多个预设难度关卡
- 关卡编辑器
- 自定义关卡分享

---

## 参考资源

| 资源 | 位置 | 用途 |
|------|------|------|
| 开发进度 | [`PROGRESS.md`](PROGRESS.md) | 历史和架构决策 |
| 已完成功能 | [`archive/COMPLETED_FEATURES.md`](archive/COMPLETED_FEATURES.md) | 已实现的功能归档 |
| 开发指南 | [`memos/GUIDE.md`](memos/GUIDE.md) | 代码修改示例 |
| 部署指南 | [`memos/DEPLOYMENT.md`](memos/DEPLOYMENT.md) | 部署流程 |
| Phase 3 分析 | [`memos/refactoring-plan.md`](memos/refactoring-plan.md) | 未来重构方案 |
| Phaser 文档 | https://photonstorm.github.io/phaser3-docs/ | 游戏 API |

---

## 快速命令

```bash
npm start  # 开发服务器 (http://localhost:8080)
npm run build  # 生产构建
```

*最后更新: 2025-11-21*
