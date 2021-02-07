import {src, dest, series, watch, parallel} from 'gulp';
import {join} from 'path';
import {spawn, ChildProcess} from 'child_process';
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import {createProject} from 'gulp-typescript';
import * as webpack from 'webpack';

const  browserSync = require('browser-sync-webpack-plugin');

const webpackConfig = require('./webpack.config');
const ts_project= createProject('./src/server/tsconfig.json');
let server_proc: ChildProcess;

function compileNode() {
    return src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(dest('dist/server/'));
}

function startServer(cb) {
    if (server_proc) {
        server_proc.kill('SIGTERM');
        server_proc.once('exit', (code, signal) => {
            server_proc = spawn('node', ['--inspect=5858', 'dist/server/app.js'], {
                cwd: __dirname,
                stdio: [0, 1, 2, 'ipc']
            });
            return cb();
        });
    } else {
        server_proc = spawn('node', ['--inspect=5858', 'dist/server/app.js'], {
            cwd: __dirname,
            stdio: [0, 1, 2, 'ipc']
        });
        return cb();
    }
}

function watchServer() {
    console.log('Watching files for changes...');
    return watch(['src/server/**/*.ts', '.env'], series(compileNode, startServer));
}

function runWebpack(done) {
    const config = webpackConfig;
    process.env.BUILD_MODE = 'production';
    return webpack(config, (err, stats) => {
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors() && stats.compilation.errors) {
            stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
        }
        console.log(stats.toString());
        return done(err);
    });
}

function analyzeWebpack(done) {
    const config = {
        ...webpackConfig,
        performance: {
            hints: 'warning',
            maxAssetSize: 1000000, // 1MB
            maxEntrypointSize: 1000000, // 1MB
        },
        plugins: [
            ...webpackConfig.plugins,
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: join(__dirname, 'reports/client/bundles.html'),
                defaultSizes: 'gzip',
                openAnalyzer: true,
                generateStatsFile: true,
                statsFilename: join(__dirname, 'reports/client/stats.json'),
            }),
        ]
    };
    process.env.BUILD_MODE = 'production';
    return webpack(config, (err, stats) => {
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors() && stats.compilation.errors) {
            stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
        }
        console.log(stats.toString());
        return done(err);
    });
}

function watchWebpack(done) {
    const config = webpackConfig;
    process.env.BUILD_MODE = 'development';
    return webpack({
            ...config,
            watch: true,
            cache: true,
            bail: false,
            infrastructureLogging: {
                level: 'verbose'
            },
            stats: {
                logging: 'verbose'
            },
            devtool: 'eval-source-map',
            plugins: [
                ...config.plugins || [],
                new browserSync({
                    host: 'localhost',
                    port: 3001,
                    proxy: 'localhost:3000',
                    ws: true,
                    open: !(process.env.DOCKER_MODE)
                })
            ]
        },
        (err, stats) => {
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors() && stats.compilation.errors) {
            stats.compilation.errors.forEach((e) => {console.error(e,'\n');});
        }
        console.log(stats.toString());
        return done(err);
    });
}

const build = parallel(compileNode, runWebpack);
const devServer = series(compileNode, startServer, watchServer);

exports.compileNode = compileNode;
exports.startServer = series(compileNode, startServer);
exports.webpack = runWebpack;
exports.analyze = analyzeWebpack;
exports.build = build;
exports.devServer = devServer;
exports.watch = parallel(watchWebpack, devServer);
exports.default = build;
