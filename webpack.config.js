var webpack = require('webpack'),
    path = require('path'),
    yargs = require('yargs');
 
var fileName = 'prismic-javascript',
    libraryName = 'PrismicJS',
    plugins = [],
    outputFile;
 
if (yargs.argv.p) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
  outputFile = fileName + '.min.js';
} else {
  outputFile = fileName + '.js';
}
 
var config = {
  entry: [
    'fetch-everywhere',
    __dirname + '/src/index.ts'
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          emitErrors: true,
          failOnHint: true,
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
  externals: [{
    "fetch-everywhere": {
      root: 'fetch-everywhere',
      commonjs2: 'fetch-everywhere',
      commonjs: 'fetch-everywhere',
      amd: 'fetch-everywhere'
    }
  }],
  resolve: {
    alias:{
      "@root": path.resolve( __dirname, './src' )
    },
    extensions: ['.ts']
  },
  plugins: plugins
};
 
module.exports = config;
