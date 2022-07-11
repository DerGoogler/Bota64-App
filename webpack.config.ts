import { resolve, join } from "path";
import { Configuration } from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const onlyLocal = (arg: any) => {
  if (process.env.HOME === "/home/runner/") {
    if (typeof arg === "function") {
      console.log("\x1b[31m%s\x1b[0m", `${arg.name} was prevented to run.`);
    } else if (typeof arg === "function" && /^\s*class\s+/.test(arg.toString())) {
      console.log("\x1b[31m%s\x1b[0m", `${arg.constructor.name} was prevented to run.`);
    } else {
      console.log("\x1b[31m%s\x1b[0m", `unknown was prevented to run.`);
    }
    return null;
  } else {
    return arg;
  }
};

const defConfig = {
  output: {
    filename: "bundle/[name].bundle.js",
    path: resolve(__dirname, "./dist/"),
    assetModuleFilename: "files/[name].[ext]",
  },
};

const config: Configuration = {
  entry: {
    app: ["./src/index.tsx"],
  },
  ...defConfig,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /(d)?\.ts(x)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.pegjs$/,
        use: ["babel-loader", "pegjs-loader"],
      },
      {
        test: /\.yaml$/,
        use: "js-yaml-loader",
      },
      {
        test: /\.(scss|css)$/,
        use: [onlyLocal(MiniCssExtractPlugin.loader), "css-loader", "sass-loader"],
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          enforce: true,
        },
      },
    },
    minimizer: [onlyLocal(new CssMinimizerPlugin())],
    minimize: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "bundle/[name].bundle.css",
    }),
  ],
  resolveLoader: {
    modules: ["node_modules", join(process.env.NPM_CONFIG_PREFIX || __dirname, "lib/node_modules")],
  },
  resolve: {
    modules: ["node_modules", join(process.env.NPM_CONFIG_PREFIX || __dirname, "lib/node_modules")],
    extensions: [".js", ".jsx", ".ts", ".tsx", ".scss", ".sass"],
  },
};

export { defConfig, config, onlyLocal };
