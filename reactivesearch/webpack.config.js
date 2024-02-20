const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

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
			extensions: [".ts", ".js"]
		},
        output: {
            library: 'flooper',
			filename: "ubi_index.js",
			path: path.resolve(__dirname, 'public/js'),
		},
		plugins: [
			new CleanWebpackPlugin()
		]
    };
};