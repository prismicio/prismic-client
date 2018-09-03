var webpack = require('webpack'),
    path = require('path'),
    yargs = require('yargs');

var fileName = 'prismic-javascript',
    libraryName = 'PrismicJS',
    outputFile;

if (yargs.argv.p) {
  outputFile = fileName + '.min.js';
} else {
  outputFile = fileName + '.js';
}

var config = {
  mode: yargs.argv.p ? 'production' : 'development',
  entry: __dirname + '/src/index.ts',
  externals: [{
    'node-fetch': {
      root: 'node-fetch',
      commonjs2: 'node-fetch',
      commonjs: 'node-fetch',
      amd: 'node-fetch'
    }
  }],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this'
  },
  optimization: {
    minimize: !!yargs.argv.p,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: true,
            declarationDir: "../d.ts"
          }
        }
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      }
    ]
  },
  resolve: {
    alias:{
      "@root": path.resolve( __dirname, './src' )
    },
    extensions: ['.ts', '.js']
  }
};

module.exports = config;
