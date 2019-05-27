/* eslint-disable no-undef */
import path from 'path';
const webpack = require('webpack')

export default {
    entry: {
        style: path.join(__dirname, 'assets/base.scss'),
        base: path.join(__dirname, 'js/main.js'),
        download: path.join(__dirname, 'basics/download/main.js'),
        lights: path.join(__dirname, 'basics/lights/main.js'),
        cameras: path.join(__dirname, 'basics/cameras/main.js'),
        multipleViews: path.join(__dirname, 'basics/multiple-views/main.js'),
        materials: path.join(__dirname, 'basics/materials/main.js'),
        shaders: path.join(__dirname, 'basics/shaders/main.js'),
        modalloaders: path.join(__dirname, 'basics/modal-loaders/main.js'),
        bloom: path.join(__dirname, 'basics/bloom/main.js'),
        car: path.join(__dirname, 'experiments/tractor/car-v1/main.js'),
        car2: path.join(__dirname, 'experiments/tractor/car-v2/main.js'),
        car3: path.join(__dirname, 'experiments/tractor/car-v3/main.js'),
        sound: path.join(__dirname, 'experiments/sound/v1/main.js'),
        sound2: path.join(__dirname, 'experiments/sound/v2/main.js'),
        sound3: path.join(__dirname, 'experiments/sound/v3/main.js'),
        sound4: path.join(__dirname, 'experiments/sound/v4/main.js'),
        text1: path.join(__dirname, 'experiments/text/shaders/main.js'),
        layered: path.join(__dirname, 'experiments/text/layered/main.js'),
        face: path.join(__dirname, 'experiments/text/facetunnel/main.js'),
        sobel: path.join(__dirname, 'experiments/text/sobel-text/main.js'),
        boda: path.join(__dirname, 'experiments/text/boda/main.js'),
        boda2: path.join(__dirname, 'experiments/text/boda-2/main.js'),
        textBasic: path.join(__dirname, 'experiments/text/basic-text-scene/main.js'),
        explosion1: path.join(__dirname, 'experiments/explosion/v1/main.js'),
        workshop1: path.join(__dirname, 'workshop/v3/main.js'),
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader'
            }]
        },
        {
            test: /\.scss$/,
            use: [
                {
                loader: "style-loader" // creates style nodes from JS strings
                },
                {
                loader: "css-loader" // translates CSS into CommonJS
                },
                {
                loader: "sass-loader" // compiles Sass to CSS
                }
            ]
        },
        {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
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