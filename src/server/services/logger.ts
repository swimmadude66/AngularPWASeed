import { Writable } from 'stream';
import * as cluster from 'cluster';
// A simple base logging service.
// To make a custom logger, extends this class and
// overwrite any applicable methods
export class LoggingService {

    logStream: Writable;

    constructor() {
        this.logStream = new Writable();

        this.logStream.write = (chunk) => {
            if (chunk && chunk.length) {
                this.log(chunk.trim());
            }
            return true
        };

        cluster.on('message', (worker, messages, handle) => {
            if (Array.isArray(messages) && messages.shift() === 'console') {
                this.log(`[ worker ${worker.id} ]:`, ...messages);
            }
        });
    }

    log(...messages: any[]): void {
        if (cluster.isMaster) {
            if (messages.length && !/^\[ (m|w)/i.test(messages[0])) {
                messages.unshift(`[ master ]:`);
            }
            console.log(...messages);
        } else {
            if (cluster.worker.isConnected()) {
                try {
                    process.send(['console', ...messages]);
                }
                catch (e) {
                    console.log(`[ worker ${cluster.worker.id} ]:`, ...messages);
                }
            } else {
                console.log(`[ worker ${cluster.worker.id} ]:`, ...messages);
            }
        }
    }

    logError(error: any, preamble?: string): void {
        let e = error.toString();
        if (/^\s?\[\s?object/i.test(e)) {
            try {
                e = JSON.stringify(error);
            } catch (err) {
                // do nothing
            }
        }
        console.error(`ERROR: ${preamble || ''} ${e}`);
    }

    static customLogger(tokens, req, res) {
        const ips = req.ips;
        if (ips.length < 1) {
            ips.push(req.headers['x-forwarded-for']);
        }
        return [
            req.ip,
            JSON.stringify(req.ips),
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'),
            '-',
            tokens['response-time'](req, res), 'ms'
        ].join(' ');
    }
}
