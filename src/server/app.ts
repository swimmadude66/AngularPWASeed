import {join} from 'path';
import {createHmac} from 'crypto';
import {createServer} from 'http';
import {cpus} from 'os';
import * as cluster from 'cluster';
import * as spdy from 'spdy';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compress from 'compression';
import * as express from 'express';
import * as morgan from 'morgan';
import * as dotenv from 'dotenv';
import * as userAgent from 'express-useragent';

import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import * as domino from 'domino';
import {ngExpressEngine} from '@nguniversal/express-engine';
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';

import {Config} from './models/config';
import {DatabaseService} from './services/db';
import {SessionManager} from './services/session';
import {HelpersService} from './services/helpers';
import {LoggingService} from './services/logger';

dotenv.config({silent: true});
const APP_CONFIG: Config = {
    environment: process.env.ENVIRONMENT || 'dev',
    cookie_name: process.env.COOKIE_NAME || '__cookie_name',
    cookie_secret: process.env.COOKIE_SECRET || 'cookie_secret',
    port: (+process.env.NODE_PORT) || 3000,
    log_level: process.env.MORGAN_LOG_LEVEL || 'short',
    client_root: process.env.CLIENT_ROOT || join(__dirname, '../client/'),
    max_workers: +(process.env.MAX_WORKERS || cpus().length),
    universal: !!(+(process.env.UNIVERSAL || 1)),
};

if (cluster.isMaster) {
    const numCPUs = Math.max(2, Math.min(cpus().length, APP_CONFIG.max_workers));
    const workers: cluster.Worker[] = [];
    console.log('[ master ]: App starting on port', APP_CONFIG.port);
    console.log(`[ master ]: Spinning up ${numCPUs - 1} workers`);
    for (let i=1; i < numCPUs; i++) {
        const worker = HelpersService.forkWorker();
        workers.push(worker);
    }

    cluster.on('listening', (worker) => {
        console.log(`[ worker ${worker.id} ]: Ready and listening!`);
    });

    cluster.on('message', (worker, messages, handle) => {
        if (Array.isArray(messages) && messages.shift() === 'console') {
            console.log(`[ worker ${worker.id} ]:`, ...messages);
        }
    });

    cluster.on('exit', (worker, code, signal) => {
        const deadIndex = workers.findIndex(w => w.id === worker.id);
        if (deadIndex >= 0) {
            workers.splice(deadIndex, 1);
        }
        if (!worker.exitedAfterDisconnect) {
            console.log(`[ master ]: replacing crashed worker ${worker.id}`);
            const newWorker = HelpersService.forkWorker();
            workers.push(newWorker);
        }
    });

    process.on('exit', () => {
        console.log('[ master ]: killing workers');
        workers.forEach((worker) => worker.kill());
    });

} else {
    const loggingService = new LoggingService();
    APP_CONFIG.logger = loggingService;
    
    const app = express();
    app.use(compress());
    app.use(userAgent.express());
    app.use(bodyParser.json({limit: '100mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(cookieParser(APP_CONFIG.cookie_secret));
    app.use(
        morgan(
            APP_CONFIG.log_level || ((tokens, req, res) => LoggingService.customLogger(tokens, req, res)), 
            {
                stream: loggingService.logStream
            }
        )
    );

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        return next();
    });

    app.use((req, res, next) => {
        // Defeat the IE 11 cache without ruining PWA caching
        res.set('Expires', '0');
        return next();
    });

    let server;
    if (process.env.HTTPS) {
        let ssl_config = {
            key: (process.env.SSLKEY ? HelpersService.tryLoad(process.env.SSLKEY) : undefined),
            cert: (process.env.SSLCERT ? HelpersService.tryLoad(process.env.SSLCERT) : undefined),
            ca: (process.env.SSLCHAIN ? HelpersService.tryLoad(process.env.SSLCHAIN) : undefined),
            pfx: (process.env.SSLPFX ? HelpersService.tryLoad(process.env.SSLPFX) : undefined)
        };
        server = spdy.createServer(ssl_config, app);
        let redir = express();
        redir.get('*', (req, res, next) => {
        let httpshost = `https://${req.headers.host}${req.url}`;
        return res.redirect(httpshost);
        });
        redir.listen(80);
    } else {
        server = createServer(app);
    }

    /*-------- Services --------*/
    const db = new DatabaseService();
    APP_CONFIG.db = db;
    const sessionManager = new SessionManager(db);
    APP_CONFIG.sessionManager = sessionManager;

    app.use(require('./middleware/auth')(APP_CONFIG));

    /*-------- API --------*/
    app.use('/api', require('./routes/api')(APP_CONFIG));

    /*------- Angular client on Root ------- */
    app.use('/wb-assets/', express.static(join(APP_CONFIG.client_root, './wb-assets'), {maxAge: 0, setHeaders: HelpersService.changeContentType}));

    // Render static files
    app.get('*.*', express.static(APP_CONFIG.client_root, {maxAge: 0}));

    if (APP_CONFIG.universal) {
        // Render Angular Universal
        // Our index.html we'll use as our template
        const templateFile = HelpersService.tryLoad(join(APP_CONFIG.client_root, './index.html'));
        if (!templateFile) {
            loggingService.logError('Could not load template, falling back to client side render');
            app.use('*', (req, res, next) => {
                return next();
            });
        } else {
            const template = templateFile.toString();
            const win = domino.createWindow(template);
            const fakeanimation = {
                value: () => {
                    return {
                        enumerable: true,
                        configurable: true
                    };
                },
            };
            global['window'] = win;
            global['document'] = {...win.document, 
                createElement: () => {},
                body: {
                    ...win.document.body,
                    style: { 
                        ...win.document.body.style,
                        transform: fakeanimation,
                        opacity: fakeanimation,    
                        bottom: fakeanimation,    
                        left: fakeanimation,    
                    }
                }
            };
            global['navigator'] = win.navigator;
            global['location'] = win.location;

            const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../ssr/ssr.js');

            app.engine('html', ngExpressEngine({
                bootstrap: AppServerModuleNgFactory,
                providers: [
                    provideModuleMap(LAZY_MODULE_MAP),
                ]
            }));

            app.set('view engine', 'html');
            app.set('views', APP_CONFIG.client_root);
        

            app.get('*', (req, res, next) => {
                const protocol = res.locals.protocol || req.protocol;
                const showPort = /localhost/i.test(req.hostname);
                const serverUrl = `${protocol}://${req.hostname}${showPort ? ':'+APP_CONFIG.port : ''}`;
                const extraProviders = [
                    {
                        provide: 'serverURL',
                        useValue: serverUrl
                    }
                ];
                if (res.locals.auth && res.locals.auth.length) {
                    const authSig = createHmac('sha512', APP_CONFIG.cookie_secret).update(res.locals.auth).digest('base64');
                    const signedAuth = `${res.locals.auth}|${authSig}`;
                    extraProviders.push({
                        provide: 'serverAuth',
                        useValue: signedAuth
                    });
                }
                res.render('index', {
                    req,
                    document: template,
                    url: req.url,
                    providers: extraProviders
                });
            });
        }
    }

    // Standard Client-side Angular as a fallback
    app.get('*', (req, res) => {
        return res.sendFile(join(APP_CONFIG.client_root, './index.html'));
    });

    app.all('*', function(req, res){
    return res.status(404).send('404 UNKNOWN ROUTE');
    });

    server.listen(APP_CONFIG.port);

    console.log('App started on port', APP_CONFIG.port);
}
