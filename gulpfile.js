var gulp        	= require('gulp');
var webpack         = require('webpack');
var webpackConfig   = require('./webpack.config');
var browserSync     = require('browser-sync-webpack-plugin');
var ts_project	    = require('gulp-typescript').createProject('./src/server/tsconfig.json');
var spawn           = require('child_process').spawn;
var server_proc;

gulp.task('compile-node', function(){
	return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'));
});

gulp.task('start-server', ['compile-node'], function(){
    if (server_proc) {
        server_proc.kill();
        server_proc = undefined;
    }
    server_proc = spawn('node', ['dist/server/app.js', '--inspect=5858'], {
        cwd: __dirname,
        stdio: [0, 1, 2, 'ipc']
    });
});

gulp.task('webpack', function(done) {
    var config = webpackConfig;
    process.env.BUILD_MODE = 'production';
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
            },
            output: {
                comments: false
            }
        })
    );
    return webpack(config, function(err, stats){
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors()) {
            if (stats.compilation.errors) {
                stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
            } else {
                console.log(stats);
            }
        }
        return done(err);
    });
});

gulp.task('webpack-watch', function() {
    var config = webpackConfig;
    process.env.BUILD_MODE = 'development';
    config.watch = true;
    config.cache = true;
    config.bail = false;
    config.devtool = 'source-map';
    config.stats = 'errors-only';
    config.module.rules.push(
        {
            enforce: 'pre',
            test: /\.ts$/,
            use: 'source-map-loader'
        }
    );
    config.plugins.push(
        new browserSync({
            host: 'localhost',
            port: 3001,
            proxy: 'localhost:3000',
            ws: true,
            open: !(process.env.DOCKER_MODE)
        })
    );
    webpack(config, function(err, stats) {
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors()) {
            if (stats.compilation.errors) {
                stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
            } else {
                console.log(stats);
            }
        }
    });
});

gulp.task('watch', ['start-server', 'webpack-watch'], function(){
  	console.log('watching for changes...');
	gulp.watch(['src/server/**/*.ts'], ['start-server']);
});

// Default Task
gulp.task('default', ['compile-node', 'webpack']);
