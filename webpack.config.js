var path = require('path');
var webpack = require('webpack');
var workbox = require('workbox-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CircularDependencyPlugin = require('circular-dependency-plugin');
var UglifyJsPlugin  = require('uglifyjs-webpack-plugin');
var AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
var commonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var NormalModuleReplacementPlugin = webpack.NormalModuleReplacementPlugin;

var entrypoints = ['common', 'polyfills', 'vendor', 'app', 'styles'];

var config = {
    entry: {
        'app': path.join(__dirname,'./src/client/main.ts'),
        'polyfills': path.join(__dirname, './src/client/polyfills.ts'),
        'vendor': path.join(__dirname,'./src/client/vendor.ts'),
        'styles': path.join(__dirname, './src/client/scss/styles.scss')
    },
    devtool: 'source-map',
    output: {
        filename: '[name].min.js',
        path: path.join(__dirname, 'dist/client')
    },
    resolve: {
        extensions: ['.ts', '.js', '.json', '.scss', '.css']
    },
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.scss$/,
                include: [path.join(__dirname, './src/client/components')],
                use: [
                    {
                        loader: 'raw-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: function(loader){
                                return [
                                    autoprefixer({remove: false, flexbox: true}),
                                    cssnano
                                ];
                            }
                        }
                    },
                    {
                        loader:'sass-loader',
                        options: {
                            includePaths: [path.join(__dirname, './src/client/scss')]
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                include: [path.join(__dirname, './node_modules'), path.join(__dirname, './src/client/scss')],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: function(loader){
                                    return [
                                        autoprefixer({remove: false, flexbox: true}),
                                        cssnano
                                    ];
                                }
                            }
                        },
                        {
                            loader:'sass-loader',
                            options: {
                                includePaths: [path.join(__dirname, './src/client/scss')]
                            }
                        }
                    ]
                })
            },
            // fonts
            {
                test: /\.((ttf)|(woff(2?))|(eot))/,
                loader: 'url-loader',
                exclude: [path.join(__dirname, './src/client/assets')],
                options: {
                    limit: 10240, // 10K limit
                    name: 'assets/fonts/[name].[ext]'
                }
            },
            {
                test: /\.svg/,
                include: /font(s)?/i,
                exclude:  /\.svg\.js/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10*1024,
                            name: 'assets/fonts/[name].svg'
                        }
                    }
                ]
            },
            // images
            {
                test: /\.((jpg)|(png)|(gif)|(bmp)|(ico))/,
                loader: 'url-loader',
                exclude: [path.join(__dirname, './src/client/assets')],
                options: {
                    limit: 10240, // 10K limit
                    name: 'assets/images/[name].[ext]'
                }
            },
            {
                test: /\.svg/,
                exclude: [/font(s)?/i, /\.svg\.js/],
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10*1024,
                            name: 'assets/images/[name].svg'
                        }
                    }
                ]
            },
            // templateUrl
            { 
                test: /\.html$/, 
                loader: 'raw-loader'
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, './dist/client/index.html'),
            template: path.join(__dirname, './src/client/index.html'),
            inject: 'body',
            hash: true,
            excludeAssets: [/styles\..*js/i],
            chunksSortMode: function(a,b) {
                return entrypoints.indexOf(a.names[0]) - entrypoints.indexOf(b.names[0])
            },
        }),
        new HtmlWebpackExcludeAssetsPlugin(),
        new AotPlugin({
            tsConfigPath: path.join(__dirname, './src/client/tsconfig.json'),
            mainPath: path.join(__dirname, './src/client/main.ts'),
            typeChecking: false,
        }),
        new UglifyJsPlugin({
            parallel: true,
            sourceMap: true,
            cache: true,
            uglifyOptions: {
                output: {
                    comments: false
                }
            }
        }),
        new commonsChunkPlugin({
            name: 'common',
            minChunks: 2
        }),
        new ExtractTextPlugin({
            allChunks: true, 
            filename: 'styles.min.css'
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, './src/client/assets'),
                to: path.join(__dirname, './dist/client/assets')
            }
        ]),
        new NormalModuleReplacementPlugin(/environments\/environment/, function(resource) {
            resource.request = resource.request.replace(/environment$/, (process.env.BUILD_MODE === 'development' ? 'devEnvironment':'prodEnvironment'));
        }),
        new workbox.GenerateSW({
            swDest: 'sw.js',
            clientsClaim: true,
            skipWaiting: true,
            include: [/assets/, /.*\.((html)|(css)|(jpg)|(png)|(svg)|(woff(2?))|(eot)|(ttf))/, /((polyfills)|(common)|(vendor)|(app))\.min\.js/],
            exclude: [/manifest/],
            runtimeCaching: [{
                // Match any same-origin request that contains 'api'.
                urlPattern: /api/,
                // Apply a network-first strategy.
                handler: 'networkFirst',
                options: {
                  // Fall back to the cache after 10 seconds.
                  networkTimeoutSeconds: 10,
                  // Use a custom cache name for this route.
                  cacheName: 'api-cache',
                  // Configure custom cache expiration.
                  expiration: {
                    maxEntries: 10
                  },
                  // Configure which responses are considered cacheable.
                  cacheableResponse: {
                    statuses: [0, 200, 204]
                  }
                }
            }]
        })
    ]
};

module.exports = config;
