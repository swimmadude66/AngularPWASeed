import * as argon2 from 'argon2';
import { Observable, of, throwError, from } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import * as uuid from 'uuid/v4';
import { DatabaseService } from './db';
import { LoggingService } from './logger';
import { User } from '../models/user';

export interface AuthRow extends User {
    PassHash: string;
}

export class AuthService {

    constructor(
        private _db: DatabaseService,
        private _log: LoggingService
    ) {
    }

    /**
     * @description Check if a password meets the standard requirements
     * @param password password to check validity of
     */
    validatePasswordCriteria(password: string): {Valid: boolean, Message: string} {
        const length = password.length >= 8;
        if (!length) {
            return {Valid: false, Message: 'must be at least 8 characters'};
        }
        const lowerCase = /[a-z]/.test(password);
        if (!lowerCase) {
            return {Valid: false, Message: 'must contain at least 1 lowercase character'};
        }
        const upperCase = /[A-Z]/.test(password);
        if (!upperCase) {
            return {Valid: false, Message: 'must contain at least 1 uppercase character'};
        }
        const numbers = /[0-9]/.test(password);
        if (!numbers) {
            return {Valid: false, Message: 'must contain at least 1 number'};
        }
        const symbols = /[^a-zA-Z0-9]/.test(password);
        if (!symbols) {
            return {Valid: false, Message: 'must contain at least 1 symbols'};
        }
        const whitespace = !(/\s/.test(password));
        if (!whitespace) {
            return {Valid: false, Message: 'must be not contain whitespace'};
        }
        return {Valid: true, Message: 'Password is valid'};
    }

    /**
     * @description sign up as a new user
     * @param email email to to use as username
     * @param password password to use
     */
    signup(email: string, password: string): Observable<User> {
        const userId = uuid();
        const confirm = uuid().replace(/-/g, '');
        const q = 'Insert into `users` (`UserId`, `Email`, `PassHash`, `Confirm`) VALUES (?, ?, ?, ?);';
        return this._argonHash(password)
        .pipe(
            switchMap(passHash => this._db.query(q, [userId, email, passHash, confirm])),
            catchError(err => {
                this._log.logError(err);
                if (err.code && err.errno) {
                    if (err.errno === 1022 || err.code === 'ER_DUP_KEY') {
                        return throwError({Status: 400, Message: 'Email is invalid or taken'});
                    }
                }
                return throwError({Status: 500, Message: 'Error completing signup'});
            }),
            map(_ => {
                const u: User = {
                    UserId: userId,
                    Email: email,
                    Role: 'user',
                    CreatedAt: new Date()
                };
                return u;
            })
        );
    }

    /**
     * @description A way to confirm email. <Disabled by default>
     * @param email email to which the confirmation was sent
     * @param confirm the id from the url
     */
    confirmEmail(email: string, confirm: string): Observable<any> {
        const q = 'Update `users` SET `Active`=1, `Confirm`=null WHERE `Confirm`=? AND `Email`=? AND `Active`=0;';
        return this._db.query(q, [confirm, email])
        .pipe(
            catchError(err => {
                this._log.logError(err);
                return throwError({Status: 500, Message: 'Email could not be confirmed'});
            }),
            switchMap(result => {
                if ((('changedRows' in result) && result.changedRows > 0) || (('affectedRows' in result) && result.affectedRows > 0)) {
                    return of({Message: `Email Confirmed for ${email}`});
                } else {
                    return throwError({Status: 400, Message: 'Could not locate that user'});
                }
            })
        );
    }

    /**
     * @description log in using email and password
     * @param email email of user to log in
     * @param password password of user
     */
    logIn(email: string, password: string): Observable<User> {
        const q = 'Select `UserId`, `Email`, `PassHash`, `Role`, `CreatedAt` from `users` WHERE `Active`=1 AND `Email`=? LIMIT 1;';
        let user: User;
        return this._db.query<AuthRow[]>(q, [email])
        .pipe(
            switchMap(results => {
                let passHash: string;
                if (!results || !results.length || results.length !== 1) {
                    passHash = 'fakepasswordtomasktiming';
                } else {
                    const firstResult = results[0];
                    passHash = firstResult.PassHash +'';
                    delete firstResult.PassHash;
                    user = firstResult as User;
                }
                return this._argonVerify(password, passHash)
            }),
            catchError(err => {
                this._log.logError(err);
                return throwError({Status: 500, Message: 'Could not log in at this time'});
            }),
            switchMap(isValid => {
                if (isValid) {
                    return of(user);
                } else {
                    throwError({Status: 400, Message: 'email or password is incorrect'});
                }
            })
        );
    }

    // Generate
    private _argonHash(password: string): Observable<string> {
        return from(argon2.hash(password))
        .pipe(
            map(hash => Buffer.from(hash, 'utf8').toString('base64'))
        );
    }

    // Compare
    private _argonVerify(provided: string, saved: string): Observable<boolean> {
        const hash = Buffer.from(saved, 'base64').toString('utf8');
        return from(argon2.verify(hash, provided))
        .pipe(
            catchError(e => of(false))
        );
    }
}
