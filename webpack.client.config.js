'use strict';

const path = require('path');
const crypto = require('crypto');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const { ModuleFederationPlugin } = webpack.container;
const sharedConfig = require('./webpack.shared.config.js');

const port = 8081; 

const config = {
	target: 'web',

	entry: './client/index.js', 

	output: {
		path: path.join(__dirname, './build/client'),
		publicPath: process.env.NODE_ENV === 'production' ? `https://storage.googleapis.com/${process.env.PARTNER || 'aeon'}-remote/build/client/` : `http://localhost:${port}/`, 
		filename: `scripts/[name]${process.env.NODE_ENV === 'production' ? '.[contenthash]' : ''}.js`,
	},

	devServer: { 
		port: port, 
		liveReload: true
	},

	plugins: [
		new MiniCssExtractPlugin({ // extracts css from bundle
			filename: `styles/[name]${process.env.NODE_ENV === 'production' ? '.[contenthash]' : ''}.css`,
		}),
		new ModuleFederationPlugin({
			name: 'remote',
			library: { type: 'var', name: 'remote' },
			filename: 'scripts/remoteEntry.js', 
			exposes: {
				'./top-nav': './client/components/top-nav/index.js',
			}, 
			shared: require('./package.json').dependencies,
		}), 
	],

	module: {
		rules: [
			{
				test: /\.less$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							modules: {
								exportLocalsConvention: 'camelCase',
								localIdentName: '[local]_[hash:base64:5]',
							},
						},
					},
					'less-loader',
				],
			},
		],
	},
};

module.exports = merge(sharedConfig, config);
