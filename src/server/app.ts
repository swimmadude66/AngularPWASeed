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
import { DatabaseService } from './services/db';
import { Services } from './models/config';

dotenv.config({silent: true});

const APP_CONFIG: any = {
  environment: process.env.ENVIRONMENT || 'short',
  cookie_name: process.env.COOKIE_NAME || '__cc',
  cookie_secret: process.env.COOKIE_SECRET || 'cookie_secret',
  port: process.env.NODE_PORT || 3000,
  log_level: process.env.MORGAN_LOG_LEVEL || 'dev',
  client_root: process.env.CLIENT_ROOT || join(__dirname, '../client/'),
};

const app = express();
app.use(compress());
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

/*-------- Services --------*/
const db = new DatabaseService();

const SERVICES: Services = {
    db,
};

/*-------- API --------*/
app.use('/api', require('./routes/api')(APP_CONFIG, SERVICES));

/*------- Angular client on Root ------- */
app.set('view engine', 'html');
app.use(express.static(APP_CONFIG.client_root));
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
