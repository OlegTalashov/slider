const path = require('path');
const webpack = require('webpack');
const npmCfg = require('./package.json');
const projectRoot = path.resolve(__dirname, './');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'src/good-weather.min.js'
  },
  resolve: {
    extensions: ['.js', '.ts', '.vue'],
    modules: [
      path.join(__dirname, 'node_modules')
    ],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
    }
  },
  resolveLoader: {
    modules: [
      path.join(__dirname, 'node_modules')
    ]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              useBuiltIns: 'usage'
            }]
          ],
          comments: false
        },
        include: projectRoot,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [ 'vue-style-loader', 'css-loader' ]
      },
      {
        test: /\.scss$/,
        use: [ 'vue-style-loader', 'css-loader' ]
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: {
            loader: 'file-loader',
            options: {
                outputPath: 'src/assets',
                name: '[name].[ext]'
            }
        }
    }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        vue: {
          compilerOptions: {
            decoratorsLegacy: true
          }
        }
      }
    }),
    new UglifyJsPlugin({
        sourceMap: false
      })
  ]
}
