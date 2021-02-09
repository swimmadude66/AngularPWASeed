import {join} from 'path';
import {createServer, Server} from 'http';
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

import {Config} from './models/config';
import {DatabaseService} from './services/db';
import {SessionManager} from './services/session';
import {HelpersService} from './services/helpers';
import {LoggingService} from './services/logger';
import {AuthService} from './services/auth';
import { HealthService } from './services/health';

dotenv.config({});
const loggingService = new LoggingService();

const APP_CONFIG: Config = {
    environment: process.env.ENVIRONMENT || 'dev',
    cookie_name: process.env.COOKIE_NAME || '__cookie_name',
    port: (+process.env.NODE_PORT) || 3000,
    log_level: process.env.MORGAN_LOG_LEVEL || 'short',
    client_root: process.env.CLIENT_ROOT || join(__dirname, '../client/'),
    max_workers: +(process.env.MAX_WORKERS || cpus().length),
    logger: loggingService,
    healthService: new HealthService(loggingService),
};

APP_CONFIG.healthService.init();

if (cluster.isMaster) {
    const numCPUs = Math.max(2, Math.min(cpus().length, APP_CONFIG.max_workers));
    loggingService.log('[ master ]: App starting on port', APP_CONFIG.port);
    loggingService.log(`[ master ]: Spinning up ${numCPUs - 1} workers`);
    for (let i = 1; i < numCPUs; i++) {
        const worker = HelpersService.forkWorker();
    }

    cluster.on('exit', (worker, code, signal) => {
        APP_CONFIG.healthService.checkClusterHealth();
        if (!worker.exitedAfterDisconnect) {
            loggingService.log(`[ master ]: replacing crashed worker ${worker.id}`);
            const newWorker = HelpersService.forkWorker();
        }
    });

    cluster.on('listening', (worker) => {
        loggingService.log(`[ worker ${worker.id} ]: Ready and Listening`);
        APP_CONFIG.healthService.setHealthy(true);
    });

} else {
    const app = express();
    app.use(compress());
    app.use(userAgent.express());
    app.use(bodyParser.json({limit: '100mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret'));
    app.use(
        morgan(
            APP_CONFIG.log_level || ((tokens, req, res) => LoggingService.customLogger(tokens, req, res)),
            {
                stream: loggingService.logStream
            }
        )
    );

    app.use((req, res, next) => {
        if (!APP_CONFIG.healthService.isHealthy()) {
            res.set('connection', 'close');
        }
        return next();
    });

    // redirect http to https
    app.use(require('./middleware/httpredir')(APP_CONFIG));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        return next();
    });

    app.use((req, res, next) => {
        // Defeat the IE 11 cache without ruining PWA caching
        res.set('Expires', '0');
        return next();
    });

    let server: Server;
    let redir;
    if (process.env.HTTPS) {
        let ssl_config = {
            key: (process.env.SSLKEY ? HelpersService.tryLoad(process.env.SSLKEY) : undefined),
            cert: (process.env.SSLCERT ? HelpersService.tryLoad(process.env.SSLCERT) : undefined),
            ca: (process.env.SSLCHAIN ? HelpersService.tryLoad(process.env.SSLCHAIN) : undefined),
            pfx: (process.env.SSLPFX ? HelpersService.tryLoad(process.env.SSLPFX) : undefined)
        };
        server = spdy.createServer(ssl_config, app);
        const redirApp = express();
        redirApp.get('*', (req, res, next) => {
            let httpshost = `https://${req.headers.host}${req.url}`;
            return res.redirect(httpshost);
        });
        redir = redirApp.listen(80);
        APP_CONFIG.healthService.registerServer(redir);
    } else {
        server = createServer(app);
    }

    /*-------- Services --------*/
    const db = new DatabaseService();
    APP_CONFIG.db = db;
    APP_CONFIG.healthService.registerService(db);

    const sessionManager = new SessionManager(db);
    APP_CONFIG.sessionManager = sessionManager;

    const authService = new AuthService(db, loggingService);
    APP_CONFIG.authService = authService;

    app.use(require('./middleware/auth')(APP_CONFIG));

    /*-------- API --------*/
    app.use('/api', require('./routes/api')(APP_CONFIG));

    /*------- Angular client on Root ------- */
    app.use('/wb-assets/', express.static(join(APP_CONFIG.client_root, './wb-assets'), {maxAge: 0, setHeaders: HelpersService.changeContentType}));

    // Render static files
    app.get('*.*', express.static(APP_CONFIG.client_root, {maxAge: 0}));

    // Standard Client-side Angular as a fallback
    app.get('*', (req, res, next) => {
        if (!/\.html/i.test(req.path) && /\./i.test(req.path)) {
            return next();
        }
        return res.sendFile(join(APP_CONFIG.client_root, './index.html'));
    });

    app.all('*', (req, res) => {
        return res.status(404).send({Message: '404 UNKNOWN ROUTE'});
    });

    APP_CONFIG.healthService.registerServer(server);
    server.listen(APP_CONFIG.port, () => {
        APP_CONFIG.healthService.setHealthy(true);
    });
}
