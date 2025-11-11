# 🚀 快速启动指南

## 立即启动游戏

```bash
# 进入项目目录
cd G:\_MyProjects\ClaudeCodeCLI\project_1

# 启动开发服务器（自动打开浏览器）
npm start

# 游戏在 http://localhost:3000 运行
```

## 游戏操作

| 操作 | 按键 |
|------|------|
| 向左移动 | ← |
| 向右移动 | → |
| 射击 | SPACE |
| 重启游戏 | SPACE (游戏结束后) |

## 继续开发对话

```bash
# 方式 1: 继续之前的对话（推荐）
claude --continue

# 方式 2: 新建对话
claude
```

## 项目文件位置

```
G:\_MyProjects\ClaudeCodeCLI\project_1/
├── src/
│   ├── index.js                 # 主配置
│   └── scenes/GameScene.js      # 游戏逻辑
├── public/index.html            # HTML 入口
├── docs/                        # 项目文档
│   ├── README.md               # 项目概览
│   ├── PROGRESS.md             # 开发进度
│   └── GUIDE.md                # 开发指南
└── package.json                # NPM 配置
```

## 重要命令

```bash
# 启动开发服务器
npm start

# 构建生产版本
npm run build

# 查看 Git 提交历史
git log

# 查看最后的改动
git status
```

## 下次可以做什么

1. **难度递增** - 敌人速度随时间增加
2. **视觉效果** - 敌人被击中闪烁、爆炸动画
3. **音效系统** - 射击音、背景音乐
4. **敌人AI优化** - 更智能的射击模式
5. **高分记录** - 本地存储最高分
6. **游戏菜单** - 开始画面、暂停菜单

## Git 状态

```
✅ 初始提交已完成 (ecb2fe3)
✅ .gitignore 已配置
✅ 所有文件已保存
```

## 如果需要回到之前的版本

```bash
# 查看 commit 历史
git log

# 回到特定版本
git reset --hard <commit-hash>
```

## 项目统计

- **总代码行数**: ~250 行（不含注释）
- **游戏分辨率**: 800x600
- **开发框架**: Phaser 3
- **构建工具**: Webpack 5
- **主要文件大小**: 8.2 MB (含 Phaser 库)

## 常见问题

**Q: 游戏运行很慢**
A: 这是正常的，Phaser 库比较大。浏览器首次加载需要时间。

**Q: 看不到游戏画面**
A: 检查 http://localhost:3000 是否打开，刷新页面或清空浏览器缓存。

**Q: 想改变游戏参数**
A: 查看 `docs/GUIDE.md` 中的 "常见修改和扩展" 部分。

---

*项目创建时间: 2025-11-11*
*开发框架: Phaser 3*
*状态: 核心功能完成，可继续扩展*
