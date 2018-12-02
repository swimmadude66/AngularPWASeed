var path = require('path');
var webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
var NormalModuleReplacementPlugin = webpack.NormalModuleReplacementPlugin;

var config = {
    mode: 'none',
    devtool: 'inline-source-map',
    output: {
        filename: '[name].spec.js',
        path: path.join(__dirname, './tests/client'),
        pathinfo: true
    },
    resolve: {
        extensions: ['.ts', '.js', '.json', '.scss', '.css']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: path.join(__dirname, './src/client/tsconfig.test.json')
                        }
                    },
                    {
                        loader: 'angular2-template-loader'
                    }
                ]
            },
            {
                test: /\.(ts|js)$/,
                loaders: [
                  'angular-router-loader'
                ]
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
                                ]
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
                use: [
                    {
                        loader: 'raw-loader'
                    }
                ]
            },
            // coverage
            {
                test: /\.ts$/i,
                exclude: /\.spec\.ts$/,
                enforce: 'post',
                use: {
                    loader: 'istanbul-instrumenter-loader',
                    options: { esModules: true }
                }
            }
        ]
    },
    plugins: [
        new AotPlugin({
            tsConfigPath: path.join(__dirname, './src/client/tsconfig.test.json'),
            mainPath: path.join(__dirname, './src/client/main.ts'),
            typeChecking: false,
        }),
        new MiniCssExtractPlugin ({
            filename: 'styles.[contenthash].min.css'
        }),
        new NormalModuleReplacementPlugin(/environments\/environment/, function(resource) {
            resource.request = resource.request.replace(/environment$/, 'devEnvironment');
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ]
};

module.exports = config;
