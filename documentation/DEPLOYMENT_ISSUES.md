# GitHub Pages 部署问题排查

## 问题总结

部署 Space Invaders 到 GitHub Pages 过程中遇到的 3 个主要问题及解决方案。

---

## 问题 1：GitHub Actions 未自动触发部署

**症状**：
- 推送代码后，没有自动创建 `gh-pages` 分支
- GitHub Actions 页面没有部署 workflow 运行记录

**原因分析**：
1. GitHub Actions 权限不足（仓库可能未启用）
2. 或 workflow 文件有语法问题
3. 或需要首次手动配置后才能自动运行

**解决方案**：
```bash
# 改用手动方式：本地构建 + 推送构建产物
npm run build
git add docs/  # 将构建文件添加到 git
git commit -m "Build production bundle"
git push
```

**关键学习**：
- GitHub Actions 对权限要求较严格
- 对于静态网站，直接提交构建文件更可靠
- 可作为备选方案，避免 CI/CD 等待

---

## 问题 2：404 错误 - 缺少 HTML 入口文件

**症状**：
```
访问 https://hongfeixu.github.io/space-invaders/
返回 404 Not Found
```

**原因分析**：
1. Webpack 只生成了 `main.js`（打包的 JavaScript）
2. 没有生成或复制 `index.html` 到构建目录
3. GitHub Pages 需要 HTML 文件作为入口

**解决方案**：

**方案 A**（临时方案 - 已执行）：
```bash
# 手动复制 HTML 文件到构建目录
cp public/index.html dist/index.html
git add dist/
git commit -m "Add index.html to dist"
```

**方案 B**（长期方案 - 推荐）：
使用 Webpack 插件自动生成 HTML
```bash
npm install --save-dev html-webpack-plugin
```

修改 `webpack.config.js`：
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // ...
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html'
        })
    ]
};
```

这样 `npm run build` 会自动生成 HTML。

**关键学习**：
- 打包工具通常只处理 JS/CSS，不处理 HTML
- 需要显式配置将 HTML 包含在构建中
- 使用专门插件更可靠

---

## 问题 3：GitHub Pages 不支持 /dist 文件夹

**症状**：
```
GitHub Pages 设置中的 "Folder" 下拉框
只显示两个选项：
- / (root)
- None

看不到 /dist 选项
```

**原因分析**：
GitHub Pages 只支持两种部署方式：
1. `/ (root)` - 直接从仓库根目录部署
2. `/docs` - 从仓库的 `/docs` 文件夹部署

自定义文件夹（如 `/dist`）**不被支持**。

**解决方案**：

**步骤 1**：重命名构建输出文件夹
```bash
# 将 dist → docs
mv dist docs
```

**步骤 2**：更新 Webpack 配置
```javascript
// webpack.config.js
output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs'),  // ← 改为 docs
    publicPath: isProduction ? '/space-invaders/' : '/',
}
```

**步骤 3**：更新文档文件夹位置（可选）
```bash
# 避免混淆，文档文件夹改名
mv docs documentation
```

**步骤 4**：在 GitHub Pages 设置中选择
```
Source: Deploy from a branch
Branch: main
Folder: /docs  ← 现在可以看到这个选项
```

**完整的项目结构**：
```
project_1/
├── src/                 # 源代码
├── public/index.html   # HTML 模板
├── docs/               # 构建输出（GitHub Pages 部署源）
│   ├── index.html
│   └── main.js
├── documentation/      # 项目文档（文档文件夹）
│   ├── README.md
│   ├── GUIDE.md
│   ├── PROGRESS.md
│   └── DEPLOYMENT_ISSUES.md
└── webpack.config.js
```

**关键学习**：
- GitHub Pages 的限制：只支持 `/` 或 `/docs`
- `/docs` 是标准的静态网站部署文件夹
- 需要将项目结构设计适配这个限制

---

## 总体时间线

| 阶段 | 问题 | 耗时 | 解决方案 |
|------|------|------|--------|
| 1 | GitHub Actions 未运行 | ~5min | 改为手动构建 + 推送 |
| 2 | 404 错误 | ~10min | 手动复制 index.html |
| 3 | /dist 不可选 | ~15min | 重命名为 /docs |

**总计**：~30 分钟问题排查

---

## 最佳实践建议

### 部署前检查清单

- ✅ Webpack 输出目录设置为 `/docs`
- ✅ `public/index.html` 存在
- ✅ 使用 HtmlWebpackPlugin 自动生成 HTML（避免手动复制）
- ✅ `.gitignore` 不排除 `/docs`
- ✅ GitHub Pages 设置指向 `main` 分支 `/docs` 文件夹
- ✅ 本地测试：`npm run build` → `npm start` 验证

### GitHub Pages 部署方式对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **直接推送 /docs** | 简单可靠，无 CI 依赖 | 仓库体积大 | 小项目、快速部署 |
| **GitHub Actions** | 自动化，仓库保持干净 | 配置复杂，权限问题 | 大项目、频繁更新 |
| **gh-pages 分支** | 完全隔离构建文件 | 需要额外分支管理 | 需要构建历史 |

当前项目使用：**直接推送 /docs**（推荐用于学习项目）

---

## 未来改进

1. **集成 HtmlWebpackPlugin**
   ```bash
   npm install --save-dev html-webpack-plugin
   ```
   修改 webpack.config.js 自动生成 HTML

2. **配置 GitHub Actions 自动部署**（可选）
   - 需要更详细的权限配置
   - 仓库可以排除 `/docs` 使用 CI/CD

3. **使用 CNAME 配置自定义域名**
   - 创建 `docs/CNAME` 文件
   - 指向自定义域名

---

## 参考资源

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [Webpack 官方文档](https://webpack.js.org/)
- [Phaser 3 部署指南](https://photonstorm.github.io/phaser3-docs/)

---

*最后更新: 2025-11-12*
