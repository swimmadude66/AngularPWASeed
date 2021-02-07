// Karma configuration
// Generated on Wed Jun 27 2018 10:53:08 GMT-0400 (Eastern Daylight Time)

module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['webpack', 'mocha'],
        // list of files / patterns to load in the browser
        files: [
            'src/client/tests/index.ts',
            { pattern: 'src/client/tests/**/*.spec.ts', included: false, served: false, watched: true },
            { pattern: 'src/client/assets/**/*', included: false, served: true, watched: false, nocache: false},
        ],
        mime: {
            'text/x-typescript':  ['ts']
        },
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/client/tests/index.ts': ['webpack', 'sourcemap'],
            // 'src/client/**/*.ts': ['coverage']
        },
        proxies: {
            '/assets': '/base/src/client/assets',
        },
        webpack: require('./webpack.config.test'),
        coverageReporter: {
            type : 'lcov',
            dir : 'reports/client/coverage',
            includeAllSources: true
        },
        webpackMiddleware: {
            noInfo: true,
            stats: {
				chunks: false
			}
        },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage'],
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: !process.env.DOCKER_MODE,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-default-apps', '--disable-extensions', '--disable-sync', '--no-first-run']
            }
        },
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: process.env.DOCKER_MODE,
        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 1
    });
};
