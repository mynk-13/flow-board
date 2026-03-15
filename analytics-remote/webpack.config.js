const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ModuleFederationPlugin } = require('webpack').container
const path = require('path')

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production'

  return {
    entry: './src/index.ts',
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'eval-source-map',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      publicPath: 'auto',
      clean: true,
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: 'analytics_remote',
        filename: 'remoteEntry.js',
        exposes: {
          './AnalyticsDashboard': './src/AnalyticsDashboard',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^19.0.0',
            eager: false,
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^19.0.0',
            eager: false,
          },
          recharts: {
            singleton: true,
            requiredVersion: '^2.15.3',
            eager: false,
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],

    devServer: {
      port: 3002,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      hot: true,
      historyApiFallback: true,
    },

    optimization: {
      splitChunks: false,
    },
  }
}
