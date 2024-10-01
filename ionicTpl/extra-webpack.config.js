const webpack = require('webpack'); //to access built-in plugins
 
console.log("!!!! Extra web pack config enabled !!!");

var oldMessage ="";
var oldMessage1 ="";
var oldMessage2 ="";
var oldMessage3 ="";

module.exports = {
    parallelism: 50,
    module: {
        strictExportPresence: false,
    },
    plugins: [
        new webpack.ProgressPlugin({
            handler(percentage, message, ...args) {
				const msg = Math.round(percentage * 100) + '%';
				const msg1 = message;
                const msg2 = args[0] != undefined ? ", [" + args[0] + "]" : "";
                const msg3 = args[1] != undefined ? ", [" + args[1] + "]" : "";
                if(msg != oldMessage || msg1 != oldMessage1 || msg2 != oldMessage2 || msg3 != oldMessage3){
					console.info(msg, msg1, msg2, msg3);
					oldMessage = msg;
					oldMessage1 = msg1;
					oldMessage2 = msg2;
					oldMessage3 = msg3;
				}
            }
        }),

		// Disable sourecmap for vendor.js         
        new webpack.SourceMapDevToolPlugin({
      		filename: '[file].map',
      		exclude: ['vendor.js'],
    	})
    ]
};
