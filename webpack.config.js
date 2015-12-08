module.exports = {
    entry: "./app/client/main",
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js"
    },
    devtool: "#inline-source-map",
    module: {
      	loaders: [
  		{
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel' // 'babel-loader' is also a legal name to reference
        }
      ]
    }

};