/* eslint-disable no-undef */
import path from 'path';
const webpack = require('webpack')

export default {
    entry: {
        base: path.join(__dirname, 'js/main.js'),
        download: path.join(__dirname, 'basics/download/main.js'),
        lights: path.join(__dirname, 'basics/lights/main.js'),
        cameras: path.join(__dirname, 'basics/cameras/main.js'),
        multipleViews: path.join(__dirname, 'basics/multiple-views/main.js'),
        materials: path.join(__dirname, 'basics/materials/main.js'),
        shaders: path.join(__dirname, 'basics/shaders/main.js'),
        modalloaders: path.join(__dirname, 'basics/modal-loaders/main.js'),
        bloom: path.join(__dirname, 'basics/bloom/main.js'),
        car: path.join(__dirname, 'experiments/car/main.js'),
        car2: path.join(__dirname, 'experiments/car-v2/main.js'),
        car3: path.join(__dirname, 'experiments/car-v3/main.js'),
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