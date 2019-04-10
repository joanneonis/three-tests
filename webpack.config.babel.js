/* eslint-disable no-undef */
import path from 'path';
const webpack = require('webpack')

export default {
    entry: path.join(__dirname, 'js/main.js'),
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'main.bundle.js'
    },
    module: {
        rules: [{
            test: /\.js/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader'
            }]
        }],
    },
    resolve: {
        alias: {
          three$: 'three/build/three.min.js',
          'three/.*$': 'three',
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
          THREE: 'three',
        }),
    ],
    devtool: 'source-map',
    mode: 'development',
    watch: true,
};