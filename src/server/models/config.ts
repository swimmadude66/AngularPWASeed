import {DatabaseService} from '../services/db';
import {SessionManager} from '../services/session';
import {LoggingService} from '../services/logger';
import {AuthService} from '../services/auth';
import { HealthService } from '../services/health';

export interface Config {
    environment: string;
    cookie_name: string;
    port: number;
    log_level: string;
    client_root: string;
    max_workers: number;
    logger?: LoggingService;
    healthService: HealthService;
    db?: DatabaseService;
    sessionManager?: SessionManager;
    authService?: AuthService;
}
