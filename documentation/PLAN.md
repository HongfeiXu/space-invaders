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

## ~~优先级 1: 代码质量~~ ✅ 已完成

### ~~1.1 配置提取~~ ✅ 已完成（会话 3）
**状态**: ✅ 已实现 `src/config/GameConfig.js`

详见 [`PROGRESS.md`](PROGRESS.md) 会话 3。

### ~~1.2 物体池优化~~ ❌ 已测试但不采用

**状态**: ❌ 经测试后决定不采用

**原因**: 实测显示对象池反而增加内存占用（24.5 MB → 26.5 MB），且内存波动增大。详见 [`memos/OBJECT_POOL_OPTIMIZATION.md`](memos/OBJECT_POOL_OPTIMIZATION.md)。

**结论**: 当前游戏规模下（15 个敌人，~30-50 个子弹），动态创建/销毁方式更优。

---

## ~~优先级 2: 游戏功能~~ ✅ 部分完成

### ~~2.1 难度递增系统~~ ✅ 已完成（会话 3）
**状态**: ✅ 已通过波次系统实现

详见 [`PROGRESS.md`](PROGRESS.md) 会话 3 - 敌人射击间隔逐波递减。

### ~~2.2 多波次系统~~ ✅ 已完成（会话 3）
**状态**: ✅ 已实现 5 波循环系统

详见 [`PROGRESS.md`](PROGRESS.md) 会话 3 - Wave System 实现。

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

## 优先级 3: 音效和视觉

### ~~3.1 背景音乐~~ ✅ 已完成（会话 3）
**状态**: ✅ 已实现背景音乐循环播放和暂停控制

详见 [`PROGRESS.md`](PROGRESS.md) 会话 3。

### 3.1.1 SFX 音效系统（待实现）
**需要的声音**:
- ❌ 射击音 (玩家)
- ❌ 击中音 (敌人被击中)
- ❌ 爆炸音 (敌人销毁)
- ❌ 玩家被击中音
- ❌ 游戏结束音

**优先级**: 中

### 3.2 粒子效果
**改进敌人被击中效果**:
- 替代简单的闪烁动画
- 添加爆炸粒子
- 飘落碎片效果

---

## 优先级 4: 玩家体验

### ~~4.1 高分记录~~ ✅ 已完成（会话 3）
**状态**: ✅ 已实现 localStorage 持久化 + 破纪录动画

详见 [`PROGRESS.md`](PROGRESS.md) 会话 3。

### ~~4.1.1 玩家被击中反馈~~ ✅ 已完成（会话 4.5）
**状态**: ✅ 已实现视觉反馈系统

**已实现**:
- ✅ 闪烁效果 + 1秒无敌时间（两段闪烁动画）
- ✅ 红色 "HIT!" 文字提示
- ✅ 支持敌人直接碰撞伤害

**待实现** (可选):
- ❌ 被击中音效
- ❌ 屏幕震动

详见 [`PROGRESS.md`](PROGRESS.md) 会话 4.5。

### 4.2 游戏菜单和场景
**新增场景**:
- **MenuScene**: 开始画面，显示操作说明
- **GameScene**: 当前游戏场景
- **GameOverScene**: 游戏结束，显示分数和重启按钮

### 4.3 暂停菜单增强
**当前**: ✅ 已部分实现 (ESC 暂停/继续 + R 重新开始)
**改进**: 显示暂停菜单，可选：
- ✅ 继续游戏 (ESC)
- ✅ 重新开始 (R 键)
- ❌ 返回主菜单 (待实现)

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

| 项 | 状态 | 备注 |
|---|------|------|
| 配置提取 | ✅ 已完成 | 会话 3 |
| 物体池优化 | ❌ 已测试不采用 | 反增内存（详见 memos） |
| 背景音乐 | ✅ 已完成 | 会话 3 |
| SFX 音效 | ❌ 待实现 | 优先级中 |
| 难度递增 | ✅ 已完成 | 波次射击加速（会话 3） |
| 高分记录 | ✅ 已完成 | localStorage + 动画（会话 3） |
| 高分保存优化 | ✅ 已完成 | 破纪录立即保存（会话 4.5） |
| 波次系统 | ✅ 已完成 | 5 波循环（会话 3） |
| WASD 控制 | ✅ 已完成 | A/D 键（会话 4） |
| 暂停重启 | ✅ 已完成 | R 键重启（会话 4） |
| UI 布局优化 | ✅ 已完成 | 敌人位置居中（会话 4） |
| 玩家被击中反馈 | ✅ 已完成 | 视觉反馈系统（会话 4.5） |
| 内存泄漏防护 | ✅ 已完成 | 资源清理机制（会话 4.5） |
| Phase 2 重构 | ✅ 已完成 | Input/Bullet/UI 管理器（2025-11-15） |
| 敌人 AI 优化 | ❌ 待实现 | 目标射击 |
| 菜单系统 | ❌ 待实现 | 优先级中 |
| 响应式设计 | ❌ 待实现 | 优先级低 |
| Service Worker | ❌ 待实现 | 优先级低 |

---

## 性能基准

**当前状态** (2025-11-15):
```
代码量: ~380 行 (GameScene.js) - Phase 2 重构后
管理器: 6 个 (Audio, Score, Effects, Input, Bullet, UI)
敌人数: 15 个 (可支持 50+)
FPS: 60+ 稳定
Peak Memory: ~24.5 MB (隐身模式测试)
加载时间: ~2s (Phaser 库)
Bundle Size: 1.16 MB (已压缩)
```

**优化收益**:
- ✅ 配置提取：代码可读性提升，易于调整
- ✅ 波次系统：游戏可玩性提升
- ✅ 高分记录：玩家留存率提升

---

## 下一步推荐

### 优先实现顺序
1. **SFX 音效系统** (高优先级) - 添加被击中、射击、游戏结束音效
2. **敌人 AI 优化** (中优先级) - 目标导向射击，增加游戏挑战性
3. **菜单系统** (中优先级) - 开始画面、暂停菜单完善
4. **粒子效果** (低优先级) - 爆炸粒子、视觉优化
5. **响应式设计** (低优先级) - 适配不同屏幕尺寸

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

---

## Phase 3 重构方案（备选 - 按需执行）

### 📊 当前状态评估

**Phase 2 完成后**:
- GameScene.js: 725 行 → **380 行** (-47.6%)
- 已提取管理器: 6 个
  - AudioManager (音频管理)
  - ScoreManager (分数管理)
  - EffectsManager (视觉效果)
  - InputManager (输入管理)
  - BulletManager (子弹管理)
  - UIManager (UI 管理)
- 代码清晰度: ⭐⭐⭐⭐⭐ (高)
- 扩展性: ⭐⭐⭐⭐ (良好)

### 🎯 核心建议: **暂缓执行 Phase 3**

**原因**:
1. 当前架构已经足够清晰（380 行代码，职责明确）
2. PLAN.md 中的高优先级功能（音效/AI/菜单）不需要 Phase 3
3. 过度拆分成本 > 收益（文件数增加，依赖复杂化）
4. 收益递减（Phase 1 ROI 极高，Phase 2 ROI 高，Phase 3 ROI 中低）

### 🔔 Phase 3 触发条件

**满足以下任一条件时，再启动 Phase 3**:

#### 条件 1: 计划添加**关卡系统**
- 需要自定义关卡布局
- 不同关卡不同敌人配置
- **提取模块**: WaveManager → LevelManager

#### 条件 2: 计划添加**多种敌人类型**
- 不同血量/射速/移动模式的敌人
- 敌人工厂模式
- **提取模块**: EnemyManager

#### 条件 3: 计划添加**玩家技能/升级系统**
- 技能树/武器升级/护盾系统
- 多种武器切换
- **提取模块**: PlayerManager

#### 条件 4: 计划添加**存档系统**
- 存档/读档功能
- 游戏状态序列化
- **提取模块**: GameStateManager

#### 条件 5: GameScene.js 再次超过 **500 行**
- 新增功能导致代码膨胀
- 需要重新评估拆分策略

### 📋 可提取模块清单（按优先级排序）

| 模块 | 代码量 | ROI | 依赖复杂度 | 优先级 |
|------|-------|-----|----------|--------|
| **WaveManager** | ~120 行 | 高 | 中 (3-4 依赖) | ⭐⭐⭐⭐⭐ 1st |
| **EnemyManager** | ~20 行 (当前), ~100+ 行 (未来) | 高 | 低 (1 依赖) | ⭐⭐⭐⭐ 2nd |
| **GameStateManager** | ~60 行 | 中高 | 中 (2-3 依赖) | ⭐⭐⭐ 3rd |
| **PlayerManager** | ~30 行 | 中低 | 中 (2 依赖) | ⭐⭐ 4th |
| **CollisionManager** | ~80 行 | 中低 | 高 (7 依赖) | ⭐ 不推荐 |

### 🛠️ Phase 3 实施建议（如果触发）

**分步执行顺序**:

#### Step 1: EnemyManager（最简单，先做）
- 提取敌人生成逻辑
- 估计时间: 1-2 小时
- 风险: 低

#### Step 2: WaveManager（最有价值）
- 提取波次系统和定时器管理
- 估计时间: 2-3 小时
- 风险: 中（定时器管理需要小心）

#### Step 3: GameStateManager（可选）
- 提取游戏状态管理
- 估计时间: 1.5-2 小时
- 风险: 低

#### Step 4: PlayerManager（可选）
- 提取玩家控制逻辑
- 估计时间: 1 小时
- 风险: 低

#### ~~Step 5: CollisionManager（不推荐）~~
- 理由: 依赖太多（7 个参数），ROI 低

### 📊 扩展性影响分析

| 功能类型 | 当前扩展难度 | Phase 3 后扩展难度 | 提升幅度 |
|---------|------------|------------------|---------|
| **音效系统** | 容易 (AudioManager 扩展) | 容易 | 无变化 |
| **敌人 AI** | 容易 (BulletManager 扩展) | 容易 | 无变化 |
| **菜单系统** | 容易 (场景切换) | 容易 | 无变化 |
| **玩家技能** | 中等 (需修改 GameScene) | 容易 (PlayerManager) | ⬆️ 提升 |
| **敌人类型** | 中等 (需修改 spawnEnemies) | 容易 (EnemyManager) | ⬆️ 提升 |
| **关卡系统** | 困难 (波次系统耦合) | 容易 (WaveManager) | ⬆️⬆️ 大幅提升 |

### 💡 结论

**Phase 3 应该等待具体功能需求驱动，而不是为了重构而重构。**

- ✅ **当前架构质量**: 已经很好（380 行，6 个管理器）
- ✅ **高优先级功能**: 可以在现有架构下实现（音效/AI/菜单）
- ⏸️ **Phase 3 时机**: 等待关卡系统/多种敌人/存档系统等需求出现
- ✅ **下一步行动**: 专注实现 PLAN.md 功能，而非继续重构

**参考文档**: `documentation/memos/refactoring-plan.md` (详细 Phase 3 分析)

*最后更新: 2025-11-15*
