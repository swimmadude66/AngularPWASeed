import { UserRole } from './user';

export interface UserSession {
    UserId: number;
    Email: string;
    Role: UserRole;
    SessionKey: string;
    SessionId: number;
    Expires: Date;
}

export interface SessionInfo {
    SessionKey: string;
    SessionId: number;
    UserId: string;
    Expires: Date;
    UserAgent?: string;
    Created?: Date;
    LastUsed?: Date;
}
