# 部署指南

## 🚀 部署到 GitHub Pages

这是最简单最推荐的部署方式。

### 前置条件

- GitHub 账户（免费）
- Git 命令行工具
- 本项目的 Git 仓库

### 部署步骤

#### 1. 构建生产版本

```bash
npm run build
```

这会在 `dist/` 目录生成编译后的文件。

输出应该类似：
```
asset main.js 170 KiB [emitted]
webpack 5.102.1 compiled successfully in XXX ms
```

#### 2. 创建 GitHub 仓库

登录 GitHub，创建新仓库：

```
Repository name: space-invaders
Description: Space Invaders game built with Phaser 3
Public (选择 Public，这样别人能玩)
```

#### 3. 关联本地仓库到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/space-invaders.git

# 重命名分支为 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

示例（替换为你的用户名）：
```bash
git remote add origin https://github.com/john-doe/space-invaders.git
git branch -M main
git push -u origin main
```

#### 4. 配置 GitHub Pages

1. 打开 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 左侧菜单选择 **Pages**
4. **Source** 部分：
   - Branch: 选择 `main`
   - Folder: 选择 `/root`（或根目录）
5. 点击 **Save**

#### 5. 等待部署

GitHub 会自动部署，通常需要 1-2 分钟。

等待后，你会看到：
```
Your site is live at https://你的用户名.github.io/space-invaders/
```

### ✅ 部署完成

打开浏览器访问你的游戏！

```
https://你的用户名.github.io/space-invaders/
```

---

## 📝 更新游戏后的部署流程

修改代码后，重新部署非常简单：

```bash
# 1. 本地测试
npm start

# 2. 测试满意后，构建
npm run build

# 3. 提交到 GitHub
git add .
git commit -m "Update game features"
git push origin main

# GitHub Pages 会自动更新
```

---

## 🔧 其他部署选项

### Vercel 部署（更快）

**优点**:
- 部署速度更快
- 自动 CI/CD
- 更好的性能

**步骤**:

1. 注册 [Vercel](https://vercel.com)
2. 连接 GitHub 账户
3. 导入项目
4. 自动部署完成

Vercel 会自动检测 `build` 命令和 `dist/` 输出目录。

### Netlify 部署

类似 Vercel，也是很方便的选择。

---

## 📊 部署对比

| 方案 | 成本 | 部署时间 | 配置难度 | 性能 |
|------|------|--------|--------|------|
| GitHub Pages | 免费 | 1-2 分钟 | 简单 | 一般 |
| Vercel | 免费 | 30 秒 | 很简单 | 很好 |
| Netlify | 免费 | 1 分钟 | 简单 | 很好 |

---

## 🐛 常见问题

### Q: 部署后游戏无法加载

**A**: 检查：
1. GitHub Pages 是否已启用
2. 仓库是否为 Public
3. 是否选择了正确的分支 (main)

### Q: 页面无法显示游戏

**A**: 可能是资源路径问题。编辑 `webpack.config.js`:

```javascript
output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/space-invaders/'  // 添加这一行
}
```

然后重新构建：
```bash
npm run build
git add .
git commit -m "Fix deployment paths"
git push
```

### Q: 如何更新已部署的游戏

**A**: 很简单：

```bash
# 修改代码...
npm run build
git add .
git commit -m "Your changes"
git push origin main

# GitHub Pages 自动更新（1-2 分钟）
```

### Q: 可以自定义域名吗

**A**: 可以！在 GitHub Pages 设置中：

1. 进入 Settings → Pages
2. Custom domain: 输入你的域名
3. 按照指示配置 DNS

---

## 🔐 安全建议

- GitHub 仓库默认 Public，任何人都能看到代码 ✅（这是好事，开源）
- 不要提交敏感信息（API 密钥等）
- `.gitignore` 已配置为忽略 `node_modules/` ✅

---

## 📱 在手机上玩

部署后，可以在手机上访问：

```
https://你的用户名.github.io/space-invaders/
```

游戏已支持响应式设计，可以在任何设备上玩！

---

## 🎉 部署成功后

分享你的游戏链接给朋友：

```
"我用 Phaser 3 做了一个 Space Invaders 游戏！
https://github.com/你的用户名/space-invaders
在线玩: https://你的用户名.github.io/space-invaders/"
```

---

*最后更新: 2025-11-11*
