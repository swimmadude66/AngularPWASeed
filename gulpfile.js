var gulp        	= require('gulp');
var webpack         = require('webpack');
var webpackConfig   = require('./webpack.config');
var webpackssrConfig= require('./webpack.config.ssr');
var browserSync     = require('browser-sync-webpack-plugin');
var ts_project	    = require('gulp-typescript').createProject('./src/server/tsconfig.json');
var spawn           = require('child_process').spawn;
var server_proc;

function compileNode() {
    return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'));
}

function startServer(universal) {
    if (server_proc) {
        server_proc.kill();
        server_proc = undefined;
    }
    var opts = {};
    if (universal) {
        opts.UNIVERSAL = 1;
    }
    server_proc = spawn('node', ['--inspect=5959', 'dist/server/app.js'], {
        cwd: __dirname,
        env: opts,
        stdio: [0, 1, 2, 'ipc']
    });
}


gulp.task('compile-node', compileNode);

gulp.task('start-server', ['compile-node'], function() {
    startServer(false);
});

gulp.task('webpack', function(done) {
    var config = webpackConfig;
    process.env.BUILD_MODE = 'production';
    return webpack(config, function(err, stats){
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors() && stats.compilation.errors) {
            stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
        }
        console.log(stats.toString());
        return done(err);
    });
});

gulp.task('webpackssr', function(done) {
    var config = webpackssrConfig;
    process.env.BUILD_MODE = 'production';
    return webpack(config, function(err, stats){
        if (err) {
            console.error(err);
        }
        if (stats.hasErrors() && stats.compilation.errors) {
            stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
        }
        console.log(stats.toString());
        return done(err);
    });
});

gulp.task('webpack-watch', function() {
    var config = webpackConfig;
    process.env.BUILD_MODE = 'development';
    config.watch = true;
    config.cache = true;
    config.bail = false;
    config.devtool = 'inline-eval-cheap-source-map';
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
        if (stats.hasErrors() && stats.compilation.errors) {
            stats.compilation.errors.forEach(function(e){console.error(e,'\n');});
        }
        console.log(stats.toString());
    });
});

gulp.task('compile-node-ssr', ['webpack', 'webpackssr'], compileNode);

gulp.task('build-ssr', ['compile-node-ssr']);

gulp.task('start-server-ssr', ['compile-node-ssr'], function() {
    startServer(true);
});

gulp.task('watchssr', ['start-server-ssr'], function() {
    console.log('watching for changes...');
    gulp.watch(['src/server/**/*.ts', '.env'], ['start-server']);
});

gulp.task('watch', ['start-server', 'webpack-watch'], function() {
    console.log('watching for changes...');
    gulp.watch(['src/server/**/*.ts', '.env'], ['start-server']);
});

// Default Task
gulp.task('default', ['compile-node', 'webpack']);
