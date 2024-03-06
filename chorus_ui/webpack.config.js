const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = (env, argv) => {
	const {mode} = argv;
	return {
        entry: path.resolve(__dirname, "src/ts/index.ts"),
        target: "web",
		mode,
        module: {
            rules: [{
                test: /^.+\.([tj])s$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                                '@babel/preset-typescript',
                                '@babel/preset-env'
                            ]
                    }
                }
            }]
        },
        resolve: {
			extensions: [".ts", ".js"],
            /*
            fallback: {
                assert: require.resolve('assert'),
                // buffer: require.resolve('buffer'),
                // console: require.resolve('console-browserify'),
                // constants: require.resolve('constants-browserify'),
                // crypto: require.resolve('crypto-browserify'),
                // domain: require.resolve('domain-browser'),
                // events: require.resolve('events'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify/browser'),
                // path: require.resolve('path-browserify'),
                // punycode: require.resolve('punycode'),
                // process: require.resolve('process/browser'),
                // querystring: require.resolve('querystring-es3'),
                //stream: require.resolve('stream-browserify'),
                stream: false,
                // string_decoder: require.resolve('string_decoder'),
                // sys: require.resolve('util'),
                // timers: require.resolve('timers-browserify'),
                // tty: require.resolve('tty-browserify'),
                url: require.resolve('url'),
                util: require.resolve('util'),
                v8: require.resolve('v8'),
                vm: require.resolve('vm-browserify'),
                zlib: require.resolve('browserify-zlib'),
            }
            */
		},
        output: {
            library: 'flooper',
			filename: "ubi_index.js",
			path: path.resolve(__dirname, 'public/js'),
		},
		plugins: [
			new CleanWebpackPlugin(),
            //new NodePolyfillPlugin()
		]
    };
};