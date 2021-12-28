const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path')

module.exports = {
  // mode: 'production',
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  devServer: {
    hot: true,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.less$/,
        use: ['vue-style-loader', 'css-loader', 'less-loader']
      },
      {
        test: /\.js$/,
        // v15 开始把从 node_modules 中引入的 vue 文件中的 js 语言块不使用 babel-loader 了
        loader: 'babel-loader',
        // 这里的 file 参数值又是什么
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        )
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Welcome to Webpack',
      template: 'index.html'
    }),
    new VueLoaderPlugin()
  ]
}