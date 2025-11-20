# 开发进度

> **📚 完整历史**：会话 1-5 详细记录请查看 [`archive/DETAILED_PROGRESS_SESSIONS_1-5.md`](archive/DETAILED_PROGRESS_SESSIONS_1-5.md)

本文档记录会话 3-6 的技术决策和架构演进。

---

## 会话 3 - 配置提取 + 波次系统 + 背景音乐

**时间**: 2025-11-12
**影响**: High
**成果**: 架构优化和游戏功能扩展

### 关键成就
- 提取 `GameConfig.js`：集中管理所有游戏参数
- 实现 5 波循环系统，敌人射击间隔逐波递减
- 添加背景音乐播放和暂停联动

### 代码规模
- GameScene: 725 行 → 最终收敛到 ~400 行

### 技术决策
- **配置驱动设计**: 修改游戏参数无需改代码逻辑
- **波次倍数器**: 每波 × 0.85 敌人射击间隔，平衡难度曲线

---

## 会话 4 - WASD 控制 + UI 布局 + 暂停菜单

**时间**: 2025-11-13
**影响**: Medium
**成果**: 输入多样化和 UI 完善

### 关键成就
- 添加 WASD 键支持（除方向键外）
- 敌人位置居中优化（减少边界溢出）
- 实现暂停菜单（ESC 暂停、R 重启）

### 技术决策
- **输入统一管理**: InputManager 处理键盘映射
- **暂停实现**: 物理引擎暂停 vs UI 显示分离

---

## 会话 4.5 - 玩家被击中反馈 + 高分优化

**时间**: 2025-11-14
**影响**: Medium
**成果**: 玩家体验优化和资源管理

### 关键成就
- 实现被击中视觉反馈系统（HIT! 文字 + 闪烁 + 1秒无敌）
- 修复高分保存逻辑（破纪录立即保存，防止丢失）
- 添加内存泄漏防护（清理事件、定时器、Tween）

### 技术决策
- **Manager 模式**: EffectsManager 处理所有视觉效果，解耦代码
- **Shutdown 钩子**: 确保场景切换时资源正确清理

### 关键洞察
- Phaser 事件监听未移除会导致内存泄漏

---

## 会话 6 - 通用菜单系统 + 代码架构优化

**时间**: 2025-11-21
**影响**: High
**成果**: 完整的可扩展菜单系统（Phase 1-3 完成）

### 关键成就
- **MenuManager** (~470行): 通用菜单管理系统，支持菜单栈
- **Phase 1**: 核心框架 - Overlay(depth=90) + Menu(depth=100) 分层
- **Phase 2**: 三个菜单实现 - 暂停、游戏结束、通关
- **Phase 3**: 扩展框架 - 为 upgrade/main/settings 菜单预留占位符
- **暂停按钮图标**: 动态切换 ❚❚ (暂停) / ▶ (继续)

### 架构改进
- **职责分离**: UIManager(HUD) ≠ MenuManager(菜单)
- **Depth 管理**: 确保菜单永不被游戏对象覆盖
- **菜单栈支持**: 支持菜单嵌套（如升级菜单在暂停中打开）
- **零改动扩展**: 添加新菜单仅需 4 步（配置、case、方法、调用）

### 技术决策
- **MenuManager 委托模式**: UIManager 将菜单操作委托给 MenuManager
- **Container 相对坐标**: 菜单元素坐标相对于容器中心，便于布局
- **JSDoc 详细文档**: 每个占位方法都包含预期功能、使用示例、参考配置

### 关键洞察
- 菜单栈设计为未来扩展做好基础（目前用不到但框架已就绪）
- Webpack 对代码注释中的特殊字符敏感（/\* \*/ 在注释中需谨慎）

---

## 会话 5 - 移动端适配 + 虚拟按钮 + 响应式设计

**时间**: 2025-11-15~16
**影响**: High
**成果**: 完整的移动端支持和全平台优化

### 关键成就
- 实现触摸目标移动（点击屏幕位置，飞船自动移动）
- 创建虚拟方向控制按钮（← →，配置驱动，全平台可用）
- 添加设备检测和移动端自动射击（500ms 冷却 vs PC 250ms）
- 响应式设计支持（横屏、竖屏、所有屏幕尺寸）

### 架构优化
- **UIManager 扩展**: 虚拟按钮创建和事件处理
- **InputManager 统一**: 键盘、虚拟按钮、触摸目标移动统一输入接口
- **配置参数**: BUTTON_WIDTH、BUTTON_SPACING、PADDING_RIGHT 动态计算位置

### 技术决策
- **虚拟按钮全平台**: 移除设备检测，所有平台显示按钮，提供统一控制体验
- **动态位置计算**: 按钮位置根据屏幕尺寸和配置参数计算，无硬编码坐标
- **Phaser Scale Manager**: FIT 模式自动适配屏幕，保持宽高比

### 关键洞察
- 对象池测试显示反增内存（24.5 MB → 26.5 MB），当前规模下不采用
- 移动端冷却值调整确保自动射击体验不过滞后

---

## 核心架构

### Manager 模式（7个专职管理器）
```
GameScene
├── AudioManager      - 背景音乐和音效
├── ScoreManager      - 分数和高分
├── EffectsManager    - 视觉效果（闪烁、HIT!文字、粒子等）
├── InputManager      - 键盘、虚拟按钮、触摸输入
├── BulletManager     - 子弹生命周期
├── UIManager         - HUD、虚拟按钮
│   └── MenuManager   - 菜单系统（暂停、游戏结束、通关、升级等）
└── Config
    ├── GameConfig    - 游戏参数
    └── MenuConfig    - 菜单样式参数
```

### 菜单系统层级
```
Depth 100: 菜单内容（按钮、文字）
Depth 90:  背景遮罩（70% 透明黑）
Depth 0:   游戏对象（玩家、敌人、子弹、HUD文字）
```

### 已实现菜单
- ✅ pause（暂停菜单）
- ✅ gameOver（游戏结束）
- ✅ victory（通关屏幕）
- ⏳ upgrade（Phase 4 - 玩家升级）
- ⏳ main（Phase 5 - 主菜单）
- ⏳ settings（Future - 设置菜单）

### 性能指标
- **代码**: ~393 行 (GameScene.js)
- **FPS**: 60+ 稳定（桌面 + 移动）
- **内存**: ~24.5 MB 峰值
- **兼容性**: Chrome、Firefox、Safari、Edge 通过

---

## 核心设计原则

### 1. 配置驱动开发
所有游戏参数集中在 `GameConfig.js` 和 `MenuConfig.js` 中：
- **GameConfig**: 敌人速度、射击冷却、波次参数、UI 位置等
- **MenuConfig**: 菜单样式、颜色、按钮大小、文字位置等
- **优势**: 修改游戏参数无需触碰逻辑代码，易于调试和微调

### 2. Manager 模式（职责分离）
每个管理器只负责一个域：
- **AudioManager**: 音乐和音效的播放/暂停/停止
- **ScoreManager**: 分数计算和高分持久化
- **EffectsManager**: 所有视觉效果（闪烁、文字、粒子）
- **InputManager**: 统一处理键盘/虚拟按钮/触摸输入
- **BulletManager**: 子弹的生成、销毁、碰撞
- **UIManager**: HUD 元素和虚拟按钮，委托菜单给 MenuManager
- **MenuManager**: 菜单的显示/隐藏/栈管理

### 3. 菜单系统分层
```
Depth 100: 菜单元素（按钮、文字）       - 最顶层
Depth 90:  背景遮罩（70% 不透明）      - 阻止穿透
Depth 0:   游戏对象（玩家、敌人、HUD）  - 底层
```
这确保菜单永不被游戏对象覆盖，同时菜单栈支持未来的嵌套菜单。

## 尚未实现的功能

### 近期（Phase 4-5）
- **升级菜单** (Phase 4): 波次结束时显示 3-4 个升级选项
- **主菜单** (Phase 5): 游戏启动界面，支持开始/排行榜/设置

### 未来
- **AI 增强**: 敌人目标导向射击、角色系统（Sniper/Gunner/Tank）
- **音效系统**: 射击音、击中音、爆炸音、游戏结束音
- **粒子效果**: 爆炸粒子、飘落碎片

## 性能和兼容性

### 性能指标
| 指标 | 数值 | 说明 |
|------|------|------|
| GameScene | ~393 行 | 精简高效的游戏循环 |
| FPS | 60+ | 桌面和移动设备都稳定 |
| 峰值内存 | ~24.5 MB | 包含 Phaser + 游戏对象 |
| 初始化 | <100ms | 快速启动 |

### 浏览器兼容性
✅ Chrome 80+
✅ Firefox 75+
✅ Safari 13+
✅ Edge 80+
✅ 移动浏览器（iOS Safari、Android Chrome）

## 参考资源

- **开发计划**: [`PLAN.md`](PLAN.md) - 未来功能待办清单
- **会话 1-5 详细记录**: [`archive/DETAILED_PROGRESS_SESSIONS_1-5.md`](archive/DETAILED_PROGRESS_SESSIONS_1-5.md)
- **已完成功能列表**: [`archive/COMPLETED_FEATURES.md`](archive/COMPLETED_FEATURES.md)
- **菜单系统设计**: [`memos/menu-system-architecture-plan.md`](memos/menu-system-architecture-plan.md)
- **玩家升级设计**: [`memos/player-upgrade-system-plan.md`](memos/player-upgrade-system-plan.md)

---

*最后更新: 2025-11-21*
*当前行数: ~300 行（符合规范 300-400 行）*
