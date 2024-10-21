const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { ProvidePlugin } = require('webpack');
const deps = require("./package.json").dependencies;

module.exports = (_, argv) => {
  const isDev = argv.mode === 'development';
  
  return {
    output: {
      publicPath: isDev ? "http://localhost:3000/" : "https://mcds-main.s3.amazonaws.com/Store/",
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
      port: 3000,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      }
    },

    module: {
      rules: [
        {
          test: /\.m?js/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: "mfeStore",
        filename: "remoteEntry.js",
        remotes: {},
        exposes: {
          './store': './src/Store',
        },
        shared: {
          ...deps,
          react: {
            singleton: true,
            requiredVersion: deps.react,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
          },
          "react-dom/client": {
            singleton: true,
            requiredVersion: deps["react-dom"],
          },
          "jotai": {
            singleton: true,
            requiredVersion: deps["jotai"],
          },
        },
      }),

      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
    ],
  }
};
