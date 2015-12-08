module.exports = {
    entry: "./client/main",
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js"
    },
    devtool: "#inline-source-map",
    module: {
      	loaders: [
  		{
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel' // 'babel-loader' is also a legal name to reference
        }
      ]
    }

};