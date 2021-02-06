const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const NormalModuleReplacementPlugin = webpack.NormalModuleReplacementPlugin;

const config = {
    mode: 'none',
    devtool: 'inline-source-map',
    output: {
        filename: '[name].spec.js',
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
                        loader: 'to-string-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: false
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: (loader) => {
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
                            sassOptions: {
                                includePaths: [path.join(__dirname, './src/client/scss')]
                            }
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
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true
                        }
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
                            sassOptions: {
                                includePaths: [path.join(__dirname, './src/client/scss')]
                            }
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
                        loader: 'html-loader'
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
