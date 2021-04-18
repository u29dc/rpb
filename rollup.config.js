import {generateSW} from 'rollup-plugin-workbox';
import {getBabelOutputPlugin} from '@rollup/plugin-babel';
import {minifyHTML} from 'rollup-plugin-minify-html';
import {terser} from 'rollup-plugin-terser';
import {threeMinifier} from '@yushijinhun/three-minifier-rollup';
import autoprefixer from 'autoprefixer';
import browsersync from 'rollup-plugin-browsersync';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy-watch';
import del from 'rollup-plugin-delete';
import esbuild from 'rollup-plugin-esbuild';
import eslint from '@rollup/plugin-eslint';
import filesize from 'rollup-plugin-filesize';
import glslify from 'rollup-plugin-glslify';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';

const _sourceDir = './src/';
const _publicDir = './public/';

const _isProduction = Boolean(process.env.PRODUCTION);

const _babelModules = 'umd';
const _babelTargets = {browsers: ['defaults', 'last 3 version', 'IE 10']};

const plugins = [
	eslint({
		include: _sourceDir + '**/*.ts',
	}),
	resolve({browser: true, preferBuiltins: true}),
	commonjs(),
	esbuild({
		minify: _isProduction,
	}),
	glslify(),
	json(),
	postcss({
		plugins: [autoprefixer],
		inject: false,
		sourceMap: !_isProduction,
		minimize: {discardComments: {removeAll: true}},
		extract: true,
		to: _publicDir + 'index.css',
	}),
];

if (_isProduction) {
	plugins.unshift(
		del({
			targets: _publicDir + '{index,sw}.{html,js,css}*',
		}),
		threeMinifier(),
	);
	plugins.push(
		getBabelOutputPlugin({
			presets: [['@babel/preset-env', {modules: _babelModules, targets: _babelTargets}]],
			compact: true,
		}),
		terser({
			ecma: 5,
			timings: true,
			toplevel: true,
			compress: {
				arrows: false,
				passes: 2,
				typeofs: false,
			},
			format: {
				comments: false,
			},
		}),
		minifyHTML({
			targets: [
				{
					src: _sourceDir + '/index.html',
					dest: _publicDir + '/index.html',
					minifierOptions: {
						collapseWhitespace: true,
						minifyCSS: true,
						minifyJS: true,
						removeComments: true,
						quoteCharacter: '"',
					},
				},
			],
		}),
		filesize({
			showMinifiedSize: false,
			showGzippedSize: true,
			showBrotliSize: true,
		}),
		generateSW({
			globDirectory: _publicDir,
			globPatterns: ['**/*.*'],
			inlineWorkboxRuntime: true,
			mode: 'production',
			sourcemap: false,
			swDest: _publicDir + 'sw.js',
		}),
	);
} else {
	plugins.push(
		copy({
			watch: _sourceDir,
			targets: [{src: _sourceDir + 'index.html', dest: _publicDir}],
		}),
		browsersync({
			cors: true,
			notify: false,
			open: 'local',
			port: 3000,
			server: _publicDir,
			ui: false,
			watch: true,
		}),
	);
}

const config = {
	input: _sourceDir + 'index.ts',
	output: [
		{
			file: _publicDir + 'index.js',
			format: 'esm',
			sourcemap: !_isProduction,
		},
	],
	treeshake: _isProduction,
	plugins,
};

export default config;
