const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack')

const config = {
  entry: path.resolve(__dirname, "./src/index.ts"),
  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        loader: "ts-loader" 
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'gavin editor',
      template: 'src/assets/static/index.html',
      scriptLoading: 'blocking',
      inject: 'head',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin()
  ]
}

module.exports = [
  {
    ...config,
    name: 'dev',
    mode: 'development',
    devtool: "source-map",
    devServer: {
      port: 9000,
      open: true,
      hot: true,
    },
  },
  {
    ...config,
    name: 'prod',
    mode: 'production',
    output: {
      filename: './gavinEditor.js',
      path: path.resolve(__dirname, "./dist")
    },
  },
];