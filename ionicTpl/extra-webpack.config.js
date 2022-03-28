const webpack = require('webpack'); //to access built-in plugins
 
console.log("!!!! Extra web pack config enabled !!!");

var oldMessage ="";

module.exports = {
    parallelism: 50,
    module: {
        strictExportPresence: false,
    },
    plugins: [
        new webpack.ProgressPlugin({
            handler(percentage, message, ...args) {
                console.info(Math.round(percentage * 100) + '%', message,
                    args[0] != undefined ? ", [" + args[0] + "]" : "",
                    args[1] != undefined ? ", [" + args[1] + "]" : ""
                );
            }
        }),

		// Disable sourecmap for vendor.js         
        new webpack.SourceMapDevToolPlugin({
      		filename: '[file].map',
      		exclude: ['vendor.js'],
    	})
    ]
};
