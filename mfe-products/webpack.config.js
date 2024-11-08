const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const Dotenv = require("dotenv-webpack");
const { ProvidePlugin } = require("webpack");
const deps = require("./package.json").dependencies;
module.exports = (env, argv) => {
  const isDev = argv.mode === "development";
  const isLocal = true;
  return {
    output: {
      publicPath: isDev
        ? "http://localhost:3008/"
        : "https://mcds-main.s3.amazonaws.com/Products/",
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
      port: 3008,
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
      new ModuleFederationPlugin({
        name: "mfeProducts",
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
          "./ProductListSkeleton":
            "./src/components/Skeleton/ProductListSkeleton/ProductListSkeleton",
          "./ProductStoreSkeleton":
            "./src/components/Skeleton/ProductStoreSkeleton/ProductStoreSkeleton",
          "./Product": "./src/products/product/Product",
          "./ProductList": "./src/products/product-list/ProductList",
          "./ProductStoreList":
            "./src/product-stores/product-store-list/ProductStoreList",
          "./ProductsElement": "./src/products/product-list/ProductListElement",
          "./styles": "./src/styles/main.scss",
          "./hooks": "./src/api/hooks/index",
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
          "@fontsource/roboto": {
            singleton: true,
          },
        },
      }),
      new HtmlWebPackPlugin({
        template: "./src/index.html",
      }),
      //new Dotenv()
      new ProvidePlugin({
        React: "./React",
        ReactDOM: "./ReactDOM",
        ReactDOMClient: "./ReactDOMClient",
      }),
    ],
  };
};
