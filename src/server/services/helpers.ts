import { Worker, fork } from 'cluster';
import { readFileSync } from 'fs';

export class HelpersService {

    static tryLoad(filePath: string): any {
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

    static forkWorker(): Worker {
        const worker = fork();

        worker.on('exit', (code, signal) => {
            console.log(`[ worker ${worker.id} ]: exiting with code {${code}}${signal ? ` in response to signal {${signal}}` : ''}`);
        });

        worker.on('error', (err) => {
            console.error(`[ worker ${worker.id} ]: ERROR`, err);
        });
        return worker;
    }

    static changeContentType(res, path, stat) {
        res.set('content-type', 'application/javascript');
    }

    /**
     * Used to pull a number from an env (always a string) while providing a default should the env be null/invalid
    */
    static parseEnvNumber(envKey: string, defaultVal: number): number {
        const envVal: string = process.env[envKey];
        if (!envVal || !envVal.length) {
            return defaultVal;
        }
        const envNum = +(envVal);
        if (isNaN(envNum)) {
            return defaultVal;
        } else {
            return envNum;
        }
    }
}
