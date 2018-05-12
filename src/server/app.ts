import {join} from 'path';
import {readFileSync} from 'fs';
import {createServer} from 'http';
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

dotenv.config({silent: true});

/*-------- Services --------*/
const db = new DatabaseService();
const sessionManager = new SessionManager(db);

const APP_CONFIG: Config = {
    environment: process.env.ENVIRONMENT || 'dev',
    cookie_name: process.env.COOKIE_NAME || '__cookie_name',
    cookie_secret: process.env.COOKIE_SECRET || 'cookie_secret',
    port: (+process.env.NODE_PORT) || 3000,
    log_level: process.env.MORGAN_LOG_LEVEL || 'short',
    client_root: process.env.CLIENT_ROOT || join(__dirname, '../client/'),
    db,
    sessionManager
};

const app = express();
app.use(compress());
app.use(userAgent.express());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser(APP_CONFIG.cookie_secret));
app.use(morgan(APP_CONFIG.log_level));

let server;
if (process.env.HTTPS) {
    let ssl_config = {
        key: (process.env.SSLKEY ? tryLoad(process.env.SSLKEY) : undefined),
        cert: (process.env.SSLCERT ? tryLoad(process.env.SSLCERT) : undefined),
        ca: (process.env.SSLCHAIN ? tryLoad(process.env.SSLCHAIN) : undefined),
        pfx: (process.env.SSLPFX ? tryLoad(process.env.SSLPFX) : undefined)
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

/*-------- API --------*/
app.use('/api', require('./routes/api')(APP_CONFIG));

/*------- Angular client on Root ------- */
app.set('view engine', 'html');
app.use(express.static(APP_CONFIG.client_root, {maxAge: 0}));
app.get('/*', function(req, res){
  return res.sendFile(join(APP_CONFIG.client_root, './index.html'));
});

app.all('*', function(req, res){
  return res.status(404).send('404 UNKNOWN ROUTE');
});

server.listen(APP_CONFIG.port);

console.log('App started on port', APP_CONFIG.port);

function tryLoad(filePath: string): any {
    if (!filePath || !filePath.length) {
        return undefined;
    }
    try {
        return readFileSync(filePath);
    } catch (err) {
        console.log('Could not load', filePath);
        return undefined;
    }
}
