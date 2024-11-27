const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { ProvidePlugin } = require("webpack");
const deps = require("./package.json").dependencies;
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";
  const isLocal = env.local ?? false;
  return {
    output: {
      publicPath: isDev
        ? "http://localhost:3009/"
        : "https://mcds-main.s3.amazonaws.com/SearchContainer/",
    },
    devtool: isDev ? "source-map" : false,
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },
    optimization: {
      usedExports: true,
      minimize: !isDev,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    },
    devServer: {
      port: 3009,
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
          test: /\.(png|jp(e*)g|svg|gif)$/,
          type: "asset/resource",
        },
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
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
          },
        },
      ],
    },

    plugins: [
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(tsx|ts|js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: isDev ? "server" : "disabled",
      }),
      new ModuleFederationPlugin({
        name: "mfeSearchContainer",
        filename: "remoteEntry.js",
        remotes: {
          mfeStore: isLocal
            ? "mfeStore@http://localhost:3000/remoteEntry.js"
            : "mfeStore@https://mcds-main.s3.amazonaws.com/Store/remoteEntry.js",
          mfeProducts: isLocal
            ? "mfeProducts@http://localhost:3008/remoteEntry.js"
            : "mfeProducts@https://mcds-main.s3.amazonaws.com/Products/remoteEntry.js",
          mfeSearchFilter: isLocal
            ? "mfeSearchFilter@http://localhost:3007/remoteEntry.js"
            : "mfeSearchFilter@https://mcds-main.s3.amazonaws.com/SearchFilter/remoteEntry.js",
        },
        exposes: {
          "./ResultHeadingCss":
            "./src/component/ResultHeading/ResultHeading.scss",
          "./SearchContainerElement":
            "./src/search-result-container/SearchContainerElement",
          "./SearchResultWrapper":
            "./src/search-result-container/SearchResultWrapper",
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
          jotai: {
            singleton: true,
            requiredVersion: deps["jotai"],
          },
          "@fontsource/roboto": {
            singleton: true,
          },
        },
      }),
      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
      new ProvidePlugin({
        React: "./React",
        ReactDOM: "./ReactDOM",
        ReactDOMClient: "./ReactDOMClient",
      }),
    ],
  };
};
