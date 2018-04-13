import {Observable} from 'rxjs/Rx';
import * as uuid from 'uuid/v4';
import {DatabaseService} from './db';
import {UserSession, SessionInfo} from '../models/auth';

const EXPIRATION_SECONDS = (30 * 24 * 60 * 60); // 30 day expiration for now

export class SessionManager {
    constructor (private _db: DatabaseService) {}

    getActiveSessions(userId: number): Observable<SessionInfo[]> {
        return this._db.query('Select * from `sessions` where `UserId`=? AND `Active`=1', [userId])
        .map(sessions => {
            return sessions.map(s => {
                s.LastUsed = new Date(s.LastUsed * 1000);
                s.UserAgent = s.UserAgent ? JSON.parse(s.UserAgent) : null;
                return s;
            });
        });
    }

    getUserSession(sessionKey: string): Observable<UserSession> {
        const q = 'Select u.UserId, u.Email, s.SessionKey, s.Expires from `sessions` s'
        + ' join `users` u on u.UserId = s.UserId'
        + ' where s.Active=1 AND u.Active=1 AND s.SessionKey=? AND s.Expires > ? LIMIT 1;';
        return this._db.query(q, [sessionKey, Math.floor(new Date().valueOf()/1000)])
        .map(sessions => sessions.length ? sessions[0] : null);
    }

    createSession(userId: number, userAgent?: string): Observable<{SessionKey: string, Expires: number}> {
        const sessionId = uuid().replace(/\-/ig, '');
        const now = Math.floor(new Date().valueOf()/1000);
        const expires = now + EXPIRATION_SECONDS; // 30 day expiration for now
        const q = 'Insert into `sessions` (`SessionKey`, `UserId`, `Expires`, `UserAgent`, `LastUsed`) VALUES (?, ?, ?, ?, ?);';
        return this._db.query(q, [sessionId, userId, expires, userAgent, now])
        .map(_ => ({SessionKey: sessionId, Expires: expires}));
    }

    deactivateSession(userId: number, sessionKey: string): Observable<any> {
        return this._db.query('Update `sessions` set `Active`=0 where `SessionKey`=? AND `UserId`=?', [sessionKey, userId])
        .map(results => results.changedRows > 0);
    }

    updateAccess(sessionKey: string): Observable<any> {
        const now = Math.floor(new Date().valueOf()/1000);
        return this._db.query('Update `sessions` SET `LastUsed`=? WHERE `SessionKey`=?', [now, sessionKey]);
    }
}
