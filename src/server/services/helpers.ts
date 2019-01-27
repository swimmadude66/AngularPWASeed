import {Worker, fork} from 'cluster';
import {readFileSync} from 'fs';

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
            console.log(`[ worker ${worker.id} ]: exiting with code {${code}}${ signal ? ` in response to signal {${signal}}`: ''}`);
        });
    
        worker.on('error', (err) => {
            console.error(`[ worker ${worker.id} ]: ERROR`, err);
        });
        return worker;
    }
    
    static changeContentType(res, path, stat) {
        res.set('content-type', 'application/javascript');
    }
}
