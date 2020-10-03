const path = require('path');
const webpack = require('webpack');
const workbox = require('workbox-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin;
const HtmlWebpackLinkTypePlugin = require('html-webpack-link-type-plugin').HtmlWebpackLinkTypePlugin;
const NoModulePlugin = require('webpack-nomodule-plugin').WebpackNoModulePlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const TerserPlugin  = require('terser-webpack-plugin');
const AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const NormalModuleReplacementPlugin = webpack.NormalModuleReplacementPlugin;
const bundles = [/^polyfills/i, /^commons(~)?/i, /^vendors~/i, /^app/i, /^styles/i, /.*/];

const config = {
    mode: 'none',
    entry: {
        app: path.join(__dirname,'./src/client/main.ts'),
        polyfills: path.join(__dirname,'./src/client/polyfills.ts'),
        styles: path.join(__dirname, './src/client/scss/styles.scss')
    },
    output: {
        filename: '[name].[contenthash].min.js',
        path: path.join(__dirname, 'dist/client'),
        pathinfo: process.env.BUILD_MODE === 'development',
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
                        loader: 'to-string-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            // url: false
                        }
                    },
                    {
                        loader:'resolve-url-loader',
                        options: {
                            root: path.join(__dirname, './src/client'),
                            debug: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
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
            {
                test: /\.scss$/,
                include: [
                    path.join(__dirname, './node_modules'),
                    path.join(__dirname, './src/client/scss'),
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: true,
                        },
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer({remove: false, flexbox: true}),
                                    cssnano({zindex: false})
                                ],
                            }
                        }
                    },
                    {
                        loader:'resolve-url-loader',
                        options: {
                            root: path.join(__dirname, './src/client')
                        }
                    },
                    {
                        loader:'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: [path.join(__dirname, './src/client/scss')]
                            }
                        }
                    },
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
                test: /assets\/.*?\.((jpg)|(png)|(gif)|(bmp)|(webp)|(svg))/,
                loader: 'url-loader',
                // exclude: [path.join(__dirname, './src/client/assets')],
                options: {
                    limit: 10240, // 10K limit
                    name: 'assets/images/[name].[ext]'
                }
            },
            // templateUrl
            {
                test: /\.html$/,
                use: 'html-loader'
            }
        ]
    },
    optimization: {
        // runtimeChunk: 'single',
        flagIncludedChunks: true,
        occurrenceOrder: true,
        sideEffects: true,
        usedExports: true,
        concatenateModules: true,
        providedExports: true,
        splitChunks: {
            hidePathInfo: true,
            minSize: 30000,
            maxSize: 977000, // try and stay below recomended size
            enforceSizeThreshold: 2097152, // HARD limit to 2MB
            chunks: (chunk) => {
                return chunk.name !== 'polyfills';
            },
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                },
                default: {
                    name: 'commons',
                    minChunks: 2,
                    reuseExistingChunk: true,
                    priority: -20
                }
              }
        },
        minimize: true,
    },
    plugins: [
        new TerserPlugin({
            parallel: true,
            sourceMap: process.env.BUILD_MODE === 'development',
            cache: true,
            terserOptions: {
                compress: true,
                output: {
                    comments: false
                }
            }
        }),
        new HtmlWebpackPlugin({
            filename: path.join(__dirname, './dist/client/index.html'),
            template: path.join(__dirname, './src/client/index.html'),
            inject: 'body',
            hash: false,
            showErrors: false,
            excludeAssets: [/styles\..*js/i],
            chunksSortMode: (a,b) =>   {
                return bundles.findIndex(pattern => pattern.test(a)) - bundles.findIndex(pattern => pattern.test(b));
            },
        }),
        new HtmlWebpackSkipAssetsPlugin(),
        new HtmlWebpackLinkTypePlugin(),
        new NoModulePlugin({filePatterns: ['polyfills.**.js']}),
        new AotPlugin({
            tsConfigPath: path.join(__dirname, './src/client/tsconfig.app.json'),
            mainPath: path.join(__dirname, './src/client/main.ts'),
            typeChecking: false,
        }),
        new MiniCssExtractPlugin ({
            filename: '[name].[contenthash].min.css'
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, './src/client/assets'),
                    to: path.join(__dirname, './dist/client/assets')
                },
                {
                    from: path.join(__dirname, './src/client/robots.txt'),
                    to: path.join(__dirname, './dist/client/robots.txt')
                },
                {
                    from: path.join(__dirname, './src/client/manifest.json'),
                    to: path.join(__dirname, './dist/client/manifest.json')
                },
                {
                    from: path.join(__dirname, './src/client/.well-known'),
                    to: path.join(__dirname, './dist/client/.well-known')
                }
            ]
        }),
        new NormalModuleReplacementPlugin(/environments\/environment/, function(resource) {
            resource.request = resource.request.replace(/environment$/, (process.env.BUILD_MODE === 'development' ? 'devEnvironment':'prodEnvironment'));
        }),
        new workbox.InjectManifest({
            swSrc: path.join(__dirname, './src/client/sw.js'),
            swDest: 'sw.js',
            // importsDirectory: 'wb-assets',

            exclude: [
                /styles\..*\.min\.js/i,     // empty bundle file from extractText
                /[0-9]+\..*?\.min\.js$/i,   // lazy-loaded bundles
                /\.map/i,                   // source-maps
                /assets\/icons\//i,       // exclude precaching the icons
                /node_modules/,             // node_modules
            ]
        })
    ]
};

module.exports = config;
