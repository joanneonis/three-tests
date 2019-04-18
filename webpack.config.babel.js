/* eslint-disable no-undef */
import path from 'path';
const webpack = require('webpack')

export default {
    entry: {
        base: path.join(__dirname, 'js/main.js'),
        download: path.join(__dirname, 'experiments/download/main.js'),
        lights: path.join(__dirname, 'experiments/lights/main.js'),
        cameras: path.join(__dirname, 'experiments/cameras/main.js'),
        multipleViews: path.join(__dirname, 'experiments/multiple-views/main.js'),
        materials: path.join(__dirname, 'experiments/materials/main.js')
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js'
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