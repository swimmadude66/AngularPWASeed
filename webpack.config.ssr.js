var path = require('path');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
var nodeExternals = require('webpack-node-externals');

var config = {
    mode: 'none',
    target: 'node',
    entry: {
        ssr: path.join(__dirname,'./src/client/main.server.ts'),
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist/ssr'),
        libraryTarget : 'commonjs',
        chunkFilename : '[id].ssr.js'
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
                                    cssnano({zindex: false})
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
                include: [
                    path.join(__dirname, './node_modules'), 
                    path.join(__dirname, './src/client/scss')
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
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
                                    cssnano({zindex: false})
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
            // fonts
            {
                test: /\.((ttf)|(woff2?)|(eot))/i,
                loader: 'url-loader',
                exclude: [path.join(__dirname, './src/client/assets')],
                options: {
                    limit: 10240, // 10K limit
                    name: 'fonts/[name].[ext]'
                }
            },
            {
                test: /font(s)?\.svg/,
                exclude:  /\.svg\.js/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10*1024,
                            name: 'fonts/[name].svg'
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
                use: [
                    {
                        loader: 'raw-loader'
                    }
                ]
            }
        ]
    },
    optimization: {
        minimize: false,
        concatenateModules: false
    },
    plugins: [
        new AotPlugin({
            entryModule :  path.join(__dirname,  './src/client/modules/server#AppServerModule'),
            tsConfigPath: path.join(__dirname, './src/client/tsconfig.server.json'),
            mainPath: path.join(__dirname, './src/client/main.server.ts'),
            platform: 1,
            skipCodeGeneration: false,
        }),
        new MiniCssExtractPlugin ({
            filename: '[name].[contenthash].min.css'
        }),
    ],
    externals : [
        nodeExternals()
    ],
    node: {
        __dirname: true
    }
};

module.exports = config;
