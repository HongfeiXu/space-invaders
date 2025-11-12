const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (_env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        mode: argv.mode || 'development',
        entry: './src/index.js',
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'docs'),
            publicPath: isProduction ? '/space-invaders/' : '/',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './public/index.html',
                filename: 'index.html',
                minify: isProduction ? {
                    removeComments: true,
                    collapseWhitespace: true,
                } : false,
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'public/assets', to: 'assets' },
                ],
            }),
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, 'public'),
            },
            compress: true,
            port: 8080,
            open: true,
        },
    };
};
