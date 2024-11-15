const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const Dotenv = require('dotenv-webpack');
const { ProvidePlugin } = require('webpack');
const deps = require("./package.json").dependencies;

module.exports = (_, argv) => {
  const isDev = argv.mode === 'development';

  return {
    output: {
      publicPath: isDev ? "http://localhost:3004/" : "https://mcds-main.s3.amazonaws.com/Genealogy/",
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
      port: 3004,
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
        {
          test: /\.(css|s[ac]ss)$/i,
          use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.json$/,
          type: 'json'
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: "mfeGenealogy",
        filename: "remoteEntry.js",
        remotes: {
          mfeStore: "mfeStore@http://localhost:3000/remoteEntry.js",
        },
        exposes: {
          './Genealogy': './src/Genealogy',
          './GenealogyElement': './src/GenealogyElement',
          './React': 'react',
          './ReactDOM': 'react-dom',
          './ReactDOMClient': 'react-dom/client',
        },
        shared: {
          ...deps,
          react: {
            singleton: true,
            requiredVersion: deps.react,
          },
          yfiles: {
            singleton: true,
            requiredVersion: '^26.0.0',
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
          },
          "react-dom/client": {
            singleton: true,
            requiredVersion: deps["react-dom"],
          },
        },
      }),

      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
      //new Dotenv(),
      new ProvidePlugin({
        React: './React',
        ReactDOM: './ReactDOM',
        ReactDOMClient: './ReactDOMClient',
      }),
    ],
  }
};
