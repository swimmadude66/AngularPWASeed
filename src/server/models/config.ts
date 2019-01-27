import {DatabaseService} from '../services/db';
import {SessionManager} from '../services/session';
import {LoggingService} from '../services/logger';

export interface Config {
    environment: string;
    cookie_name: string;
    cookie_secret: string;
    port: number;
    log_level: string;
    client_root: string;
    max_workers: number;
    universal: boolean;
    db?: DatabaseService;
    sessionManager?: SessionManager;
    logger?: LoggingService;
}
