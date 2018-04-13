import {DatabaseService} from '../services/db';
import {SessionManager} from '../services/session';

export interface Config {
    environment: string;
    cookie_name: string;
    cookie_secret: string;
    port: number;
    log_level: string;
    client_root: string;
    db: DatabaseService,
    sessionManager: SessionManager
}
