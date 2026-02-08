const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const Dotenv = require('dotenv-webpack');

module.exports = env => ({
    watch: false,
    mode: 'production',
    devtool: false,
    devServer: {
        contentBase: path.join(__dirname, './server/www'),
        compress: true,
        port: 9001,
        historyApiFallback: true,
        proxy: {
            '/': {
                changeOrigin: true,
                target: 'http://localhost:5001',
                pathRewrite: { '^/': '/' },
            },
            '/api': {
                changeOrigin: true,
                target: 'http://localhost:5001',
                pathRewrite: { '^/api': '/api' },
            },
            '/namespace': {
                changeOrigin: true,
                target: 'http://localhost:5001',
                pathRewrite: { '^/namespace': '/namespace' },
            },
            '/podcast': {
                changeOrigin: true,
                target: 'http://localhost:5001',
                pathRewrite: { '^/podcast': '/podcast' },
            }
        },
        writeToDisk: (filePath) => {
            return /\.html$|\.ejs$/.test(filePath);
        }
    },
    entry: './ui/src/index.tsx',
    output: {
        path: path.resolve(__dirname, './server/www'),
        publicPath: '/',
        filename: 'bundle.js',
    },
    node: {
        fs: 'empty',
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: 'ts-loader' },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                    },
                    'sass-loader?sourceMap',
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.html/,
                use: ['html-loader'],
            },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/',
                        },
                    },
                ],
            },
            {
                test: /\.ico/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: '/',
                        },
                    },
                ],
            },
            {
                test: /\.(ttf|otf)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        limit: 50000,
                        name: './fonts/[name].[ext]', // Output below ./fonts
                        publicPath: '../', // Take the directory into account
                    },
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './ui/public', 'index.ejs.html'),
            filename: path.resolve(__dirname, './server/views', 'index.ejs'),
            minify: {
                removeComments: true,
                removeRedundantAttributes: true,
            },
        }),
        new FaviconsWebpackPlugin({
            logo: path.resolve(__dirname, './ui/public', 'pci_avatar.svg'),
            prefix: '.',
            mode: 'webapp',
            devMode: 'webapp',
            favicons: {
                appName: 'Podcastindex.org',
                appDescription: 'Let’s preserve podcasting as a platform for free speech',
                developerName: 'Podcastindex.org',
                developerURL: null, // prevent retrieving from the nearest package.json
                background: '#ffffff',
                theme_color: '#e90000',
                icons: {
                    coast: false,
                    yandex: false
                }
            }
        }),
        new Dotenv({
            path: `./.environments/.env${env.file ? `.${env.file}` : ''}`
        }),
    ],
})
