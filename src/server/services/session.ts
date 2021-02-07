import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import * as uuid from 'uuid/v4';
import {DatabaseService} from './db';
import {UserSession, SessionInfo} from '../models/auth';

const EXPIRATION_MILLISECONDS = (30 * 24 * 60 * 60 * 1000); // 30 day expiration for now

export class SessionManager {
    constructor (
        private _db: DatabaseService
    ) {}

    getActiveSessions(userId: string): Observable<SessionInfo[]> {
        return this._db.query<SessionInfo[]>('Select * from `sessions` where `UserId`=? AND `Active`=1', [userId])
        .pipe(
            map(sessions => {
                return sessions.map(s => {
                    s.UserAgent = s.UserAgent ? JSON.parse(s.UserAgent) : null;
                    return s;
                });
            })
        );
    }

    getUserSession(sessionKey: string): Observable<UserSession> {
        const q = 'Select u.UserId, u.Email, s.SessionKey, s.Expires from `sessions` s'
        + ' join `users` u on u.UserId = s.UserId'
        + ' where s.Active=1 AND u.Active=1 AND s.SessionKey=? AND s.Expires > ? LIMIT 1;';
        return this._db.query<UserSession[]>(q, [sessionKey, new Date()])
        .pipe(
            map(sessions => sessions.length ? sessions[0] : null)
        );
    }

    createSession(userId: string, userAgent?: string): Observable<{SessionKey: string, Expires: Date}> {
        const sessionId = uuid().replace(/\-/ig, '');
        const now = new Date();
        const expires = new Date(now.valueOf() + EXPIRATION_MILLISECONDS);
        const q = 'Insert into `sessions` (`SessionKey`, `UserId`, `Expires`, `UserAgent`, `LastUsed`) VALUES (?, ?, ?, ?, ?);';
        return this._db.query(q, [sessionId, userId, expires, userAgent, now])
        .pipe(
            map(_ => ({SessionKey: sessionId, Expires: expires}))
        );
    }

    deactivateSession(userId: string, sessionKey: string): Observable<any> {
        return this._db.query('Update `sessions` set `Active`=0 where `SessionKey`=? AND `UserId`=?', [sessionKey, userId])
        .pipe(
            map(results => results.changedRows > 0)
        );
    }

    updateAccess(sessionKey: string): Observable<any> {
        const now = new Date();
        return this._db.query('Update `sessions` SET `LastUsed`=? WHERE `SessionKey`=?', [now, sessionKey]);
    }
}
