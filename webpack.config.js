const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    watch: true,
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'www'),
        compress: true,
        port: 9001,
        historyApiFallback: true,
    },
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'www'),
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
                test: /\.(svg|gif|png|jpg|ico)(\?v=\d+\.\d+\.\d+)?$/i,
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
                test: /\.(woff|woff2|eot|ttf)$/,
                use: ['url-loader?limit=100000'],
            },

            // {
            //     // Match woff2 and patterns like .woff?v=1.1.1.
            //     test: /\.(ttf|otf)$/,
            //     use: {
            //         loader: 'url-loader',
            //         options: {
            //             limit: 50000,
            //             name: './fonts/[name].[ext]', // Output below ./fonts
            //             // publicPath: '../', // Take the directory into account
            //         },
            //     },
            // },
            // {
            //     test: /\.(woff|woff2|ttf|otf)$/,
            //     use: [
            //         {
            //             loader: 'file-loader',
            //             options: {
            //                 name: '[name].[ext]',
            //                 outputPath: 'fonts/',
            //             },
            //         },
            //     ],
            // },
            // {
            //     test: /\.(svg|png)(\?v=\d+\.\d+\.\d+)?$/,
            //     use: [
            //         {
            //             loader: 'file-loader',
            //             options: {
            //                 name: '[name].[ext]',
            //                 outputPath: 'images/',
            //             },
            //         },
            //     ],
            // },
        ],
    },
    plugins: [
        new FaviconsWebpackPlugin('./public/favicon.ico'),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public', 'index.html'),
            minify: {
                collapseWhitespace: true,
                collapseInlineTagWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
            },
        }),
        new webpack.DefinePlugin({
            'process.env': {
                API_KEY: JSON.stringify(process.env.API_KEY),
                API_SECRET: JSON.stringify(process.env.API_SECRET),
                API_URL: JSON.stringify(process.env.API_URL),
            },
        }),
    ],
}
