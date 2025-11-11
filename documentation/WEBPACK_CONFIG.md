# Webpack 配置说明

## HtmlWebpackPlugin 集成

项目已集成 **HtmlWebpackPlugin**，用于自动生成 HTML 文件。

### 配置内容

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

plugins: [
    new HtmlWebpackPlugin({
        template: './public/index.html',      // 源模板
        filename: 'index.html',               // 输出文件名
        minify: isProduction ? {              // 生产环境压缩
            removeComments: true,
            collapseWhitespace: true,
        } : false,
    }),
]
```

### 工作原理

```
npm run build
    ↓
Webpack 编译 src/index.js → main.js
    ↓
HtmlWebpackPlugin 处理
    ↓
读取 public/index.html 作为模板
    ↓
自动注入 <script src="main.js"></script>
    ↓
输出 docs/index.html （生产环境压缩）
```

### 流程对比

**之前（手动复制）**：
```bash
npm run build          # 仅生成 main.js
cp public/index.html dist/   # 手动复制 HTML
git add dist/
```

**之后（自动生成）**：
```bash
npm run build          # 自动生成 index.html + main.js
git add docs/
```

### 输出结果

**开发模式** (`npm start`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    ...
</head>
<body>
    <div id="game"></div>
    <script src="/main.js"></script>    <!-- 自动注入 -->
</body>
</html>
```

**生产模式** (`npm run build`):
```html
<!DOCTYPE html><html lang="en"><head>...
<!-- 全部压缩为一行，移除注释和空白 -->
```

### 自动脚本注入

HtmlWebpackPlugin 会自动在 HTML 中注入脚本标签：

✅ `<script src="main.js"></script>` 自动添加
✅ 支持多个输出文件
✅ 自动处理 publicPath

**无需手动编写**：
```html
<!-- 不需要这样做 -->
<script src="/main.js"></script>
```

### 修改 HTML 模板

如果需要修改 HTML 结构，只需编辑 `public/index.html`：

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Space Invaders - Phaser Game</title>
    <!-- 自定义样式/脚本 -->
    <link rel="stylesheet" href="custom.css">
</head>
<body>
    <div id="game"></div>
    <!-- HtmlWebpackPlugin 会自动添加 main.js 脚本 -->
</body>
</html>
```

下次构建时，`docs/index.html` 会自动更新。

### 常见场景

**场景 1：添加 favicon**
```html
<!-- public/index.html -->
<link rel="icon" href="/favicon.ico">
```

**场景 2：添加 Meta 标签**
```html
<meta name="description" content="Space Invaders Game">
<meta name="keywords" content="phaser,game,invaders">
```

**场景 3：多页面应用（可选）**
```javascript
// webpack.config.js - 创建多个 HTML 文件
plugins: [
    new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        chunks: ['main']
    }),
    new HtmlWebpackPlugin({
        template: './public/about.html',
        filename: 'about.html',
        chunks: ['about']
    })
]
```

### 性能优势

| 方面 | 对比 |
|------|------|
| 自动化 | ✅ 无需手动复制 |
| 一致性 | ✅ 模板变更自动同步 |
| 压缩 | ✅ 生产环境自动压缩 |
| 脚本注入 | ✅ 自动管理依赖 |
| 缓存破坏 | ✅ 支持哈希文件名 |

### 后续优化（可选）

**1. 哈希文件名（避免缓存问题）**
```javascript
output: {
    filename: '[name].[contenthash:8].js',  // 如: main.abc12345.js
    path: path.resolve(__dirname, 'docs'),
}
```

**2. 代码分割（减小包体积）**
```javascript
optimization: {
    splitChunks: {
        chunks: 'all',
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 10,
            }
        }
    }
}
```

**3. 压缩更激进**
```javascript
new HtmlWebpackPlugin({
    minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,    // 移除属性引号
        minifyJS: true,                 // 压缩内嵌 JS
        minifyCSS: true,                // 压缩内嵌 CSS
    }
})
```

### 参考资源

- [HtmlWebpackPlugin 官方文档](https://github.com/jantimon/html-webpack-plugin)
- [Webpack 插件系统](https://webpack.js.org/plugins/)

---

*最后更新: 2025-11-12*
