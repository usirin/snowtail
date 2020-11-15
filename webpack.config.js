// TODO: figure out a way to convert this to TypeScript.
const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ESBuildPlugin } = require("esbuild-loader");

const isProd = process.env.NODE_ENV === "production";

const config = {
  mode: isProd ? "production" : "development",
  entry: {
    index: "./src/index.tsx",
  },
  devtool: "inline-source-map",
  output: {
    path: Path.resolve(__dirname, "dist"),
    filename: "[name].js",
    publicPath: "/",
  },
  resolve: {
    alias: {
      snowtail: Path.join(__dirname, "src"),
      pkg: Path.join(__dirname, "src/packages"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "esbuild-loader",
        exclude: /node_modules/,
        options: {
          loader: "ts",
          target: "es2015", // default, or 'es20XX', 'esnext'
        },
      },
      {
        test: /\.tsx$/,
        loader: "esbuild-loader",
        exclude: /node_modules/,
        options: {
          loader: "tsx",
          target: "es2015",
        },
      },
      {
        test: /.css$/,
        use: [
          require.resolve("style-loader"),
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: 1,
              modules: { auto: true },
            },
          },
          { loader: "postcss-loader" },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|fbx|gltf|glb)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "snowtail",
      template: "src/index.html",
    }),
    new ESBuildPlugin(),
  ],
};

if (!isProd) {
  config.devServer = {
    contentBase: Path.resolve(__dirname, "dist"),
    historyApiFallback: true,
    port: 5050,
    open: true,
    hot: true,
    compress: true,
    overlay: true,
  };
}

console.log(config);

module.exports = config;
