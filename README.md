# Space Invaders

一款经典的 2D 射击游戏，用 Phaser 3 引擎开发。消灭入侵的敌人，保护地球！

## 🎮 玩法

### 游戏目标
击败尽可能多的敌人，获得最高分数。当敌人碰到你或子弹用尽生命值时游戏结束。

### 控制方式

| 操作 | 按键 |
|------|------|
| 向左移动 | ← 或 A |
| 向右移动 | → 或 D |
| 射击 | SPACE |
| 暂停/继续 | ESC |
| 重启游戏 | SPACE (游戏结束后) |

### 游戏规则
- **玩家**: 底部白色三角形飞船，可左右移动和射击
- **敌人**: 绿色方块阵列，从顶部向下移动并随机射击
- **得分**: 击中一个敌人得 10 分
- **生命**: 初始 3 条命，被敌人或子弹击中失去 1 条命
- **视觉反馈**: 敌人被击中时会闪烁 3 次

## ✨ 已实现的功能

- ✅ 玩家控制（移动/射击）
- ✅ 敌人生成和移动
- ✅ 碰撞检测和伤害系统
- ✅ 敌人被击中闪烁效果
- ✅ 暂停/继续（ESC）
- ✅ 得分和生命系统
- ✅ 游戏结束和重启
- ✅ 完整的 GitHub Pages 部署

## 🚀 快速开始

### 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（自动打开浏览器）
npm start
# 游戏在 http://localhost:8080 运行

# 3. 构建生产版本
npm run build
```

### 在线游戏

直接访问: https://hongfeixu.github.io/space-invaders/

## 💻 技术栈

- **游戏引擎**: Phaser 3.90.0（JavaScript 2D 游戏框架）
- **构建工具**: Webpack 5.102.1
- **语言**: JavaScript (CommonJS)
- **分辨率**: 800×600 固定画布
- **部署**: GitHub Pages

## 🎵 使用的资源

### 音频资源

| 资源 | 来源 | 许可 | 用途 |
|------|------|------|------|
| Jewel-Thieves.mp3 | [Eric Matyas (soundimage.org)](https://www.soundimage.org) | 免费使用 | 背景音乐 |

感谢 Eric Matyas 提供优质的免费音乐资源！

## 📚 项目文档

本项目为快速原型，代码精简易懂。如需了解更多信息：

| 文档 | 说明 |
|------|------|
| [`documentation/PLAN.md`](documentation/PLAN.md) | **下一步计划** - 待实现的功能和优化方向 |
| [`documentation/PROGRESS.md`](documentation/PROGRESS.md) | **开发历史** - 如何从零构建到现在 |
| [`documentation/memos/GUIDE.md`](documentation/memos/GUIDE.md) | **开发指南** - 代码修改和扩展示例 |
| [`documentation/memos/DEPLOYMENT.md`](documentation/memos/DEPLOYMENT.md) | **部署指南** - 部署到 GitHub Pages |
| [`documentation/memos/WEBPACK_CONFIG.md`](documentation/memos/WEBPACK_CONFIG.md) | **构建配置** - Webpack 和自动化工具链 |
| [`CLAUDE.md`](CLAUDE.md) | **项目指南** - 给 Claude AI 的工作说明书 |

## 📄 许可证

自由使用和修改。

---

*游戏版本: 1.1*
*最后更新: 2025-11-13*
*特性: 背景音乐、暂停音乐、配置系统*
