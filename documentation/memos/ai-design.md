# 敌人AI设计方案

**创建时间**: 2025-11-17  
**状态**: 设计阶段（待实施）  
**相关文件**: 
- `src/scenes/GameScene.js` - 游戏主逻辑
- `src/managers/BulletManager.js` - 子弹管理
- `src/config/GameConfig.js` - 游戏配置

---

## 📊 当前状态分析

### ✓ 当前实现（事实）

从代码分析得出的当前AI行为：
- **移动模式**: 水平随机漂移（-50~50 px/s）+ 边界反弹
- **射击模式**: 随机选择敌人，固定间隔垂直向下射击
- **难度递增**: 仅通过射击频率加快（每波 ×0.85，最小400ms）
- **波次系统**: 5波循环，消灭所有敌人进入下一波

### 🤔 当前问题分析（推理）

基于"玩家只能左右移动"的限制：

1. **可预测性不足**: 完全随机射击导致玩家无法通过技巧规避，过度依赖运气
2. **空间压力缺失**: 敌人随机漂移未形成有效的空间控制
3. **挑战性单一**: 仅靠射速提升，缺乏模式变化
4. **策略深度不足**: 所有敌人行为一致，无法创造决策点

---

## 🎮 AI设计核心原则

### 1. 可预测性 vs 突发性平衡

| 极端情况 | 问题 | 体验 |
|---------|------|------|
| 完全随机 | 无法规避，纯靠运气 | ❌ 挫败感 |
| 完全确定 | 可记忆模式，太简单 | ❌ 无聊 |
| **混合模式** | 可读取的模式 + 偶尔突发 | ✅ **心流状态** |

**设计目标**: 70%可预测 + 30%随机元素

### 2. 空间压力设计

玩家只能左右移动，所以AI重点是**控制横向活动空间**：

- **理想状态**: 玩家始终有20-30%的"相对安全区域"
- **危险状态**: 安全区域 <10%，迫使玩家移动
- **失败状态**: 完全无安全区域（设计失败，应避免）

### 3. 反应时间窗口

| 难度 | 反应窗口 | 适用波次 |
|------|---------|---------|
| 新手 | 1.0-1.5秒 | Wave 1 |
| 普通 | 0.6-1.0秒 | Wave 2-3 |
| 困难 | 0.4-0.6秒 | Wave 4 |
| 地狱 | 0.3-0.4秒 | Wave 5 |

**计算公式**: `反应时间 = 距离 / 子弹速度 + 射击延迟`

---

## 💡 具体AI设计方案

### 🎯 方案1: 预测性射击系统（推荐优先实施）

**难度**: ⭐⭐ (简单)  
**收益**: ⭐⭐⭐⭐⭐ (极高)  
**实施优先级**: **第一优先**

#### 设计思路

敌人射击时瞄准玩家位置，但给予反应窗口：

```javascript
// 伪代码示例 - 需要在 BulletManager 中实现
shootAtPlayer(enemy, player) {
  // 1. 计算延迟时间（给玩家反应窗口）
  const reactionWindow = 300 - (currentWave * 30); // 波次越高，反应时间越短
  
  this.time.delayedCall(reactionWindow, () => {
    // 2. 瞄准玩家位置（带轻微预判）
    const predictedX = player.x + player.body.velocity.x * 0.3;
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y, 
      predictedX, player.y
    );
    
    // 3. 发射子弹
    const bullet = this.enemyBullets.create(enemy.x, enemy.y, 'enemyBullet');
    bullet.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );
  });
}
```

#### 平衡参数（需配置到 GameConfig.js）

```javascript
ENEMY: {
  // ... 现有配置
  
  // 预测性射击配置
  TARGETING: {
    ENABLED_FROM_WAVE: 2,        // 从第2波开始启用瞄准
    REACTION_BASE: 500,          // 基础反应窗口 (ms)
    REACTION_DECAY_PER_WAVE: 50, // 每波递减 (ms)
    REACTION_MIN: 200,           // 最小反应窗口 (ms)
    PREDICTION_FACTOR: 0.3,      // 预判系数 (0-1)
    ACCURACY: 0.8                // 瞄准精度 (0-1, 1为完美精准)
  }
}
```

#### 可视化反馈（提升体验）

```javascript
// 射击前给予视觉警告
showShootWarning(enemy) {
  // 敌人变红色闪烁
  enemy.setTint(0xff0000);
  
  this.time.delayedCall(200, () => {
    enemy.clearTint();
  });
}
```

#### 实施步骤

1. 修改 `src/config/GameConfig.js` - 添加配置
2. 修改 `src/managers/BulletManager.js` - 添加 `shootAtPlayer()` 方法
3. 修改 `src/scenes/GameScene.js` - 根据波次切换射击模式
4. 测试平衡性：录制游玩视频，检查反应时间是否合理

#### 适用波次建议

- **Wave 1**: 保持随机射击（新手引导）
- **Wave 2-5**: 启用预测射击，逐波减少反应窗口

---

### 🌊 方案2: 编队射击模式

**难度**: ⭐⭐⭐ (中等)  
**收益**: ⭐⭐⭐⭐ (高)  
**实施优先级**: 第二优先

#### 设计思路

不同波次采用不同的弹幕模式，创造视觉和玩法多样性。

#### 模式A: 纵列齐射（适用Wave 2-3）

```javascript
// 随机选择一列，所有敌人同时射击
shootColumnSalvo() {
  const col = Phaser.Math.Between(0, 4); // 5列随机选一列
  const enemies = this.enemies.children.entries;
  
  enemies.forEach(enemy => {
    // 计算敌人所在列
    const enemyCol = Math.floor((enemy.x - GameConfig.ENEMY_SPAWN.START_X) / 
                                 GameConfig.ENEMY_SPAWN.SPACING_X);
    
    if (enemyCol === col) {
      this.shootStraightDown(enemy);
    }
  });
}
```

**特点**: 
- 创造"弹幕墙"效果
- 玩家需要快速判断安全列
- 反应时间充足（直线下落可预测）

#### 模式B: 扇形弹幕（适用Wave 4）

```javascript
// 单个敌人发射3连发散射子弹
shootFanPattern(enemy) {
  const angles = [-15, 0, 15]; // 扇形角度（度）
  const baseSpeed = 180;
  
  angles.forEach(offset => {
    const bullet = this.enemyBullets.create(enemy.x, enemy.y, 'enemyBullet');
    const angleRad = Phaser.Math.DegToRad(90 + offset); // 90度为向下
    
    bullet.setVelocity(
      Math.cos(angleRad) * baseSpeed,
      Math.sin(angleRad) * baseSpeed
    );
  });
}
```

**特点**:
- 增加横向躲避难度
- 子弹数量 ×3（需注意性能）
- 适合"地狱难度"波次

#### 模式C: 追踪+直线混合（适用Wave 3-4）

```javascript
// 混合射击模式
shootMixedPattern(enemies, player) {
  enemies.forEach((enemy, index) => {
    if (index % 2 === 0) {
      // 偶数位：瞄准射击
      this.shootAtPlayer(enemy, player);
    } else {
      // 奇数位：垂直射击
      this.shootStraightDown(enemy);
    }
  });
}
```

**特点**:
- 迫使玩家同时处理可预测和不可预测威胁
- 考验注意力分配能力

#### 推荐5波配置

| 波次 | 射击模式 | 射速 | 难度 |
|------|---------|------|------|
| Wave 1 | 随机垂直射击 | 1000ms | ⭐ 教学 |
| Wave 2 | 50%瞄准 + 50%垂直 | 850ms | ⭐⭐ 入门 |
| Wave 3 | 纵列齐射 | 720ms | ⭐⭐⭐ 普通 |
| Wave 4 | 扇形弹幕 | 610ms | ⭐⭐⭐⭐ 困难 |
| Wave 5 | 混合模式（全部） | 400ms | ⭐⭐⭐⭐⭐ 地狱 |

---

### 🧠 方案3: 智能站位系统

**难度**: ⭐⭐⭐⭐ (较难)  
**收益**: ⭐⭐⭐ (中)  
**实施优先级**: 第三优先

#### 设计思路

敌人主动移动到战略位置，封锁玩家活动空间。

```javascript
// 在 GameScene.update() 中调用
updateEnemyPositioning() {
  const enemies = this.enemies.children.entries;
  const playerX = this.player.x;
  
  enemies.forEach((enemy, index) => {
    // 策略1: 均匀分布在玩家可移动范围
    const idealX = (index / enemies.length) * 800;
    
    // 策略2: 向玩家方向聚集（可选）
    // const idealX = playerX + (index - enemies.length/2) * 60;
    
    // 如果距离理想位置太远，移动过去
    const distance = Math.abs(enemy.x - idealX);
    if (distance > 50) {
      const speed = Phaser.Math.Clamp(distance / 2, 30, 100); // 距离越远速度越快
      const direction = enemy.x < idealX ? 1 : -1;
      enemy.setVelocityX(direction * speed);
    } else {
      enemy.setVelocityX(0); // 到达位置后停止
    }
  });
}
```

#### 配置参数

```javascript
ENEMY: {
  // ... 现有配置
  
  POSITIONING: {
    ENABLED: true,                  // 启用智能站位
    ENABLED_FROM_WAVE: 3,           // 从第3波开始启用
    UPDATE_INTERVAL: 100,           // 更新间隔 (ms)
    POSITION_TOLERANCE: 50,         // 位置容差 (px)
    MOVE_SPEED_MIN: 30,             // 最小移动速度
    MOVE_SPEED_MAX: 100,            // 最大移动速度
    STRATEGY: 'SPREAD'              // 'SPREAD'(分散) | 'CLUSTER'(聚集)
  }
}
```

#### 🤔 推理：实施风险评估

**优势**:
- 创造持续空间压力
- 增加策略深度（"安全区在哪？"）
- 配合瞄准射击效果极佳

**风险**:
- 性能开销（每帧计算15个敌人位置）
  - **缓解方案**: 使用定时器，每100ms更新一次
- 可能过于困难（无处可躲）
  - **缓解方案**: 保留20%横向空间作为"缓冲区"
- 破坏原有的"弹球"视觉效果
  - **缓解方案**: 仅在Wave 3+启用，保留Wave 1-2的随机漂移

---

### ⚡ 方案4: 角色分工系统

**难度**: ⭐⭐⭐⭐⭐ (复杂)  
**收益**: ⭐⭐⭐⭐⭐ (极高)  
**实施优先级**: 第四优先（适合后期扩展）

#### 设计思路

赋予敌人不同角色，创造战术选择。

#### 角色定义

| 角色 | 行为特征 | 视觉标识 | 血量 | 射速 | 精度 | 移速 | 占比 |
|------|---------|---------|------|------|------|------|------|
| 🎯 **狙击手** | 精准瞄准，低射速 | 红色 | 1 | 2000ms | 95% | 慢 | 20% |
| 🔥 **机枪手** | 高射速，低精度 | 黄色 | 1 | 500ms | 30% | 中 | 30% |
| 🛡️ **坦克** | 高血量，慢速直射 | 绿色加粗 | 2 | 1500ms | 100% | 极慢 | 20% |
| 💨 **闪避兵** | 快速移动，不射击 | 蓝色 | 1 | - | - | 极快 | 30% |

#### 实现示例

```javascript
// 生成敌人时分配角色
spawnEnemiesWithRoles() {
  const roles = ['sniper', 'gunner', 'tank', 'dodger'];
  const weights = [0.2, 0.3, 0.2, 0.3]; // 对应占比
  
  for (let i = 0; i < 15; i++) {
    const enemy = this.enemies.create(x, y, 'enemy');
    const role = this.weightedRandom(roles, weights);
    
    enemy.setData('role', role);
    this.applyRoleAttributes(enemy, role);
  }
}

applyRoleAttributes(enemy, role) {
  const roleConfig = {
    sniper: {
      tint: 0xff0000,
      health: 1,
      fireRate: 2000,
      accuracy: 0.95,
      speed: 30
    },
    gunner: {
      tint: 0xffff00,
      health: 1,
      fireRate: 500,
      accuracy: 0.30,
      speed: 60
    },
    tank: {
      tint: 0x00ff00,
      health: 2,
      fireRate: 1500,
      accuracy: 1.0,
      speed: 20,
      scale: 1.3 // 视觉上更大
    },
    dodger: {
      tint: 0x00ffff,
      health: 1,
      fireRate: Infinity, // 不射击
      accuracy: 0,
      speed: 150
    }
  };
  
  const config = roleConfig[role];
  enemy.setTint(config.tint);
  enemy.setData('health', config.health);
  enemy.setData('fireRate', config.fireRate);
  enemy.setData('accuracy', config.accuracy);
  enemy.setData('speed', config.speed);
  
  if (config.scale) {
    enemy.setScale(config.scale);
  }
}
```

#### 游戏性影响

**优先级决策**:
- 玩家需要判断："先打哪个？"
- 狙击手威胁最大 → 优先击杀
- 坦克血厚 → 需要2发子弹 → 考验资源管理
- 闪避兵快速移动 → 难以瞄准 → 练习技巧

**配置建议**:
- Wave 1-2: 全部普通敌人（无角色）
- Wave 3: 引入2种角色（狙击手+机枪手）
- Wave 4: 引入3种角色（+坦克）
- Wave 5: 全部4种角色混合

#### 🤔 推理：平衡性考量

**风险点**:
1. **坦克过强** → 需要2发击杀，可能导致弹幕堆积
   - **解决方案**: 坦克移速极慢，射速也慢
2. **狙击手过弱** → 玩家秒杀后威胁消失
   - **解决方案**: 生成时优先放在后排中央位置
3. **闪避兵无意义** → 不射击，只是送分
   - **解决方案**: 快速移动干扰玩家视线和瞄准

---

### 🎲 方案5: 动态难度调整（DDA）

**难度**: ⭐⭐⭐ (中等)  
**收益**: ⭐⭐⭐ (中，适合休闲玩家)  
**实施优先级**: 可选（按需实施）

#### 设计思路

根据玩家实时表现调整AI强度，保持"心流状态"。

```javascript
// 在 ScoreManager 中添加性能追踪
class ScoreManager {
  constructor(scene) {
    // ... 现有代码
    this.playerShots = 0;      // 玩家射击次数
    this.playerHits = 0;       // 玩家命中次数
  }
  
  calculatePerformance() {
    const hitRate = this.playerHits / Math.max(this.playerShots, 1);
    const survivalRate = this.scene.lives / GameConfig.GAME.INITIAL_LIVES;
    const progress = this.scene.currentWave / GameConfig.WAVE.MAX_WAVE;
    
    // 综合评分 (0-1)
    return (hitRate * 0.4) + (survivalRate * 0.4) + (progress * 0.2);
  }
}

// 在 GameScene 中应用难度调整
calculateDifficultyMultiplier() {
  const performance = this.scoreManager.calculatePerformance();
  
  // 表现优秀 (>0.7) → 提高难度
  if (performance > 0.7) {
    return 1.3; // 射速+30%
  }
  // 表现良好 (0.4-0.7) → 标准难度
  else if (performance >= 0.4) {
    return 1.0;
  }
  // 表现不佳 (<0.4) → 降低难度
  else {
    return 0.7; // 射速-30%
  }
}

// 应用到敌人射击定时器
updateDifficulty() {
  const multiplier = this.calculateDifficultyMultiplier();
  const adjustedDelay = this.enemyFireTimer.delay / multiplier;
  
  this.enemyFireTimer.delay = adjustedDelay;
}
```

#### 配置参数

```javascript
GAME: {
  // ... 现有配置
  
  DYNAMIC_DIFFICULTY: {
    ENABLED: false,              // 默认关闭（可作为可选功能）
    UPDATE_INTERVAL: 5000,       // 更新间隔 (ms)
    MULTIPLIER_MIN: 0.5,         // 最小难度系数（-50%射速）
    MULTIPLIER_MAX: 1.5,         // 最大难度系数（+50%射速）
    PERFORMANCE_WEIGHTS: {
      HIT_RATE: 0.4,             // 命中率权重
      SURVIVAL_RATE: 0.4,        // 生存率权重
      PROGRESS: 0.2              // 进度权重
    }
  }
}
```

#### 🤔 推理：适用场景分析

**适合**:
- 休闲游戏定位
- 希望更多玩家能通关
- 需要高留存率

**不适合**:
- 追求硬核难度的游戏
- 竞技性游戏（排行榜会不公平）
- 玩家群体为"核心玩家"

**建议**: 
- 作为**可选功能**（设置菜单中开关）
- 或仅在"简单模式"下启用

---

## 🎨 推荐实施路线图

### Phase 1: 基础强化（1-2小时）
✅ 优先级最高，立即实施

1. **方案1: 预测性射击**
   - 修改 `BulletManager.js` 添加瞄准逻辑
   - 修改 `GameConfig.js` 添加配置
   - 从Wave 2开始启用
   - **预期效果**: 游戏难度+50%，可玩性+100%

### Phase 2: 模式多样化（2-3小时）
⭐ 高优先级，建议实施

2. **方案2: 编队射击**
   - 实现纵列齐射（Wave 3）
   - 实现扇形弹幕（Wave 4）
   - 实现混合模式（Wave 5）
   - **预期效果**: 视觉观赏性+80%，挑战多样性+60%

### Phase 3: 战术深化（3-4小时）
⚡ 中优先级，可选实施

3. **方案3: 智能站位**
   - 从Wave 3启用
   - 需要性能测试
   - **预期效果**: 空间压力+100%，策略性+70%

### Phase 4: 系统级改造（5-8小时）
🎯 低优先级，后期扩展

4. **方案4: 角色分工**
   - 需要重构敌人生成逻辑
   - 需要添加血量系统
   - 需要大量平衡性测试
   - **预期效果**: 游戏深度质变，可玩性+200%

5. **方案5: 动态难度**（可选）
   - 作为辅助功能
   - 需要性能追踪系统
   - **预期效果**: 通关率+30%，留存率+20%（估计）

---

## ⚖️ 平衡性验证清单

每次实施新AI后，必须进行以下测试：

### ✅ 反应时间测试

```javascript
// 测试代码：添加到 BulletManager 中
logReactionTime(bullet, player) {
  const distance = Phaser.Math.Distance.Between(
    bullet.x, bullet.y, 
    player.x, player.y
  );
  const bulletSpeed = Math.sqrt(
    bullet.body.velocity.x ** 2 + 
    bullet.body.velocity.y ** 2
  );
  const timeToHit = distance / bulletSpeed;
  
  console.log(`Reaction time: ${timeToHit.toFixed(2)}s`);
}
```

**验收标准**:
- Wave 1: ≥1.0秒
- Wave 2-3: ≥0.6秒
- Wave 4-5: ≥0.3秒

### ✅ 子弹密度测试

```javascript
// 在 GameScene.update() 中监控
if (GameConfig.UI.SHOW_FPS) {
  const bulletCount = this.bulletManager.getEnemyBullets().children.entries.length;
  console.log(`Active bullets: ${bulletCount}`);
}
```

**验收标准**:
- Wave 1: ≤5颗
- Wave 2-3: ≤10颗
- Wave 4-5: ≤15颗
- **红线**: 任何时候不超过20颗（避免"弹幕地狱"）

### ✅ 安全区域测试

**测试方法**:
1. 录制玩家游玩视频（5分钟）
2. 每秒检查玩家横向活动范围
3. 计算"相对安全区域"占比

**验收标准**:
- 任何时刻，玩家应有≥20%的横向空间是"相对安全"的
- 如果出现"完全无处可逃"的时刻 → AI过强，需要削弱

### ✅ 通关率测试

**测试方法**:
1. 招募10名测试玩家（不同技能水平）
2. 每人尝试通关5次
3. 统计平均通关率

**验收标准**:
- 目标通关率: **40-60%**（中等难度）
- 如果 <30%: AI太难，需要削弱
- 如果 >70%: AI太简单，需要增强

**调整参数**:
- 射速（`FIRE_INTERVAL`）
- 反应窗口（`REACTION_BASE`）
- 预判系数（`PREDICTION_FACTOR`）

### ✅ 性能测试

```javascript
// 使用 Chrome DevTools Performance 监控
// 目标: 60 FPS 稳定
```

**验收标准**:
- FPS: ≥55（移动端） / ≥60（桌面端）
- 内存: ≤30MB
- GC暂停: ≤16ms

---

## 🛠️ 技术实现注意事项

### 1. 性能优化

**❌ 避免**:
```javascript
// 每帧计算所有敌人AI决策（性能杀手）
update() {
  this.enemies.children.entries.forEach(enemy => {
    this.calculateAI(enemy); // 15个敌人 × 60fps = 900次/秒
  });
}
```

**✅ 推荐**:
```javascript
// 使用定时器批量处理
create() {
  this.time.addEvent({
    delay: 100, // 每100ms更新一次
    callback: this.updateAIDecisions,
    callbackScope: this,
    loop: true
  });
}
```

### 2. 配置化设计

**所有参数必须放入 `GameConfig.js`**:

```javascript
// ✅ 好的设计
const reactionWindow = GameConfig.ENEMY.TARGETING.REACTION_BASE;

// ❌ 坏的设计
const reactionWindow = 500; // 魔法数字
```

**理由**: 
- 便于调整平衡性（无需改代码）
- 支持难度预设（简单/普通/困难）
- 便于AI行为调试

### 3. 可视化反馈

**射击前必须给予玩家视觉提示**:

```javascript
// 示例：敌人射击前变色
showShootWarning(enemy) {
  // 方案A: 变红色
  enemy.setTint(0xff0000);
  
  // 方案B: 添加瞄准线（可选）
  const line = this.add.line(
    0, 0,
    enemy.x, enemy.y,
    this.player.x, this.player.y,
    0xff0000, 0.3
  );
  
  this.time.delayedCall(200, () => {
    enemy.clearTint();
    line.destroy();
  });
}
```

**原因**: 
- 提升游戏公平性（玩家可预判）
- 增强视觉反馈
- 降低挫败感

### 4. 调试工具

**添加AI调试模式**:

```javascript
// 在 GameConfig.js 中添加
DEBUG: {
  SHOW_AI_DECISIONS: false,    // 显示AI决策
  SHOW_TARGETING_LINES: false, // 显示瞄准线
  LOG_PERFORMANCE: false       // 记录性能数据
}

// 在 GameScene 中使用
if (GameConfig.DEBUG.SHOW_TARGETING_LINES) {
  this.drawTargetingLine(enemy, this.player);
}
```

---

## 📊 预期效果评估（假设）

以下数据为基于设计经验的**估计值**，需要验证：

| 方案 | 难度增幅 | 可玩性增幅 | 开发时间 | 建议实施 |
|------|---------|-----------|---------|---------|
| 方案1: 预测射击 | +50% | +100% | 1-2小时 | ✅ 立即 |
| 方案2: 编队射击 | +30% | +60% | 2-3小时 | ✅ 优先 |
| 方案3: 智能站位 | +40% | +70% | 3-4小时 | ⚡ 可选 |
| 方案4: 角色分工 | +100% | +200% | 5-8小时 | 🎯 后期 |
| 方案5: 动态难度 | ±0% | +30%(留存) | 2-3小时 | 🔔 按需 |

**验证方法**: 实施后进行A/B测试，对比玩家留存率和通关率数据。

---

## 📝 后续行动建议

### 立即行动（本周）
1. ✅ **实施方案1（预测射击）**
   - 预期收益最高
   - 开发成本最低
   - 代码改动最小

### 短期计划（本月）
2. ⚡ **实施方案2（编队射击）**
   - 增加模式多样性
   - 提升视觉观赏性

### 长期计划（按需）
3. 🎯 根据玩家反馈决定是否实施方案3/4/5
4. 📊 收集真实游玩数据（通关率、留存率、平均游戏时长）
5. 🔄 迭代优化平衡参数

---

## 🔗 相关文档

- **游戏配置**: `src/config/GameConfig.js`
- **子弹管理**: `src/managers/BulletManager.js`
- **开发计划**: `documentation/PLAN.md`
- **性能分析**: `documentation/memos/memory-leak-analysis.md`
- **重构方案**: `documentation/memos/refactoring-plan.md`

---

**最后更新**: 2025-11-17  
**状态**: 设计完成，待实施  
**下一步**: 实施方案1（预测性射击系统）

