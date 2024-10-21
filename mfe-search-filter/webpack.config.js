const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const Dotenv = require("dotenv-webpack");
const { ProvidePlugin } = require("webpack");
const deps = require("./package.json").dependencies;

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";
  const isLocal = env.local ?? false;

  return {
    output: {
      publicPath: isDev
        ? "http://localhost:3007/"
        : "https://mcds-main.s3.amazonaws.com/SearchFilter/",
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
      port: 3007,
      historyApiFallback: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
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
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: "mfeSearchFilter",
        filename: "remoteEntry.js",
        remotes: {
          mfeStore: isLocal
            ? "mfeStore@http://localhost:3000/remoteEntry.js"
            : "mfeStore@https://mcds-main.s3.amazonaws.com/Store/remoteEntry.js",
          mfeSearchContainer: isLocal
            ? "mfeSearchContainer@http://localhost:3009/remoteEntry.js"
            : "mfeSearchContainer@https://mcds-main.s3.amazonaws.com/SearchContainer/remoteEntry.js",
        },
        exposes: {
          "./FilterSkeleton": "./src/components/FilterSkeleton/FilterSkeleton",
          "./SearchFilter": "./src/SearchFilter",
          "./SearchFilterElement": "./src/SearchFilterElement",
          "./React": "react",
          "./ReactDOM": "react-dom",
          "./ReactDOMClient": "react-dom/client",
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
        },
      }),

      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
      //new Dotenv(),
      new ProvidePlugin({
        React: "./React",
        ReactDOM: "./ReactDOM",
        ReactDOMClient: "./ReactDOMClient",
      }),
    ],
  };
};
