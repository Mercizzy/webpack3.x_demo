const path = require('path');
const UglifyjsPlugin = require('uglifyjs-webpack-plugin');  //js压缩
const htmlPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin"); //抽离css样式
const glob = require('glob');
const PurifycssPlugin = require('purifycss-webpack');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

if(process.env.type == "build") {
  var website = {
    publicPath: 'http://www.baidu.com:1717/'
  }
}else {
  var website = {
    publicPath: 'http://192.168.10.141:1717/'
  }
}


module.exports = {
  /**
   * source-map 生成独立的文件 map 错误在xx行 xx列
   * cheap-moudle-source-map 独立 map 错误在xx行
   * eval-source-map 不独立，map在js文件中，会有安全隐患  用于开发阶段  错误在xx行 xx列
   * cheap-moudle-eval-source-map 不独立，map在js文件中，会有安全隐患  用于开发阶段 错误在xx行
   * 
   */
  devtool: 'source-map', 
  entry: {
    entry: './src/entry.js',
    jquery: 'jquery'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: website.publicPath
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /(node_modules|bower_components)/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {importLoaders: 1}
            },
            'postcss-loader'
          ]
        })
      },
      {
        test: /\.(jpg|jpeg|svg|png|gif)$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'url-loader', 
            options: {
              limit: 5000,
              outputPath: 'images/',
              esModule: false,  //处理html-withimg-loader打包图片路径出现default的问题
            },
          }
        ],
      },
      /**
       * webpack处理资源无往不利，但有个问题总是很苦恼，
       * html中直接使用img标签src加载图片的话，因为没有被依赖，图片将不会被打包。
       * 这个loader解决这个问题，图片会被打包，而且路径也处理妥当。额外提供html的include子页面功能。
       */
      {
        test: /\.(htm|html)$/i,
        loader: 'html-withimg-loader'
      },

      /**
       * less处理
       */
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
            {
              loader: 'less-loader'
            }
          ],
        })
      },

      /**
       * sass处理
       */
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
            {
              loader: 'sass-loader'
            }
          ],
        })
      },

      /**
       * js中es5,es6语法的处理
       */
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
      
    ],
  },
  plugins: [
    // new UglifyjsPlugin()
    /**
     * 抽离第三方类库
     */
    new webpack.optimize.CommonsChunkPlugin({
      name: ['jquery'],
      filename: 'assets/js/[name].js',
      minChunks: 2
    }),
    /**
     * 优雅引入第三方类库,没有使用到的类库不会打包
     */
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new htmlPlugin({
      minify: {
        removeAttributeQuotes: true,
      },
      hash: true,
      template: './src/index.html'
    }),
    /**
     * 抽离css
     */
    new ExtractTextPlugin("css/styles.css"),
    /**
     * 去除未使用的css
     */
    new PurifycssPlugin({
      paths: glob.sync(path.resolve(__dirname, './src/*.html'))
    }),
    /**
     * 声明自己
     */
    new webpack.BannerPlugin('merci is learning webpack3.x'),
    new CopyWebpackPlugin([{
      from: __dirname + '/src/public',
      to: './public',

    }])
  ],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    host: '192.168.10.141',
    compress: true,
    port: 1717
  },
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 500,
    ignored: /node_modules/
  },
};