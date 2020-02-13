import {Router} from 'express';
import {createHash} from 'crypto';
import * as uuid from 'uuid/v4';
import {Observable} from 'rxjs';
import {flatMap, switchMap} from 'rxjs/operators';
import {Config} from '../models/config';
import {User} from '../models/user';

const COOKIE_OPTIONS = {
    path: '/',
    httpOnly: true,
    signed: true,
    sameSite: true,
};

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const logger = APP_CONFIG.logger;
    const db = APP_CONFIG.db;
    const sessionManager = APP_CONFIG.sessionManager;
    const authService = APP_CONFIG.authService;

    router.post('/signup', (req, res) => {
        const body = req.body;
        if (!body || !body.Email || !body.Password) {
            return res.status(400).send({Error: 'Email and Password are required fields'});
        } else {
            const passwordValid = authService.validatePasswordCriteria(body.Password);
            if (!passwordValid.Valid) {
                return res.status(400).send({Error: passwordValid.Message});
            }
            return authService.signup(body.Email, body.Password)
            .subscribe(
                user => {
                    logger.log('Created User');
                    return res.send({User: user});
                },
                err => {
                    logger.logError(err);
                    return res.status(err.Status || 500).send({Error: err.Message || 'Could not complete signup'});
                }
            );
        }
    });

    router.post('/confirm-email', (req, res, next) => {
        const body = req.body;
        if (!body || !body.Email || !body.Confirm) {
            return res.status(400).send({Error: 'Email and Confirm are required'});
        }
        return authService.confirmEmail(body.Email, body.Confirm)
        .subscribe(
            _ => res.send({Message: 'Email Confirmed'}),
            err => {
                logger.logError(err);
                return res.status(err.Status || 500).send({Error: err.Message || 'Could not confirm email'})
            }
        );
    });

    router.post('/login', (req, res) => {
        const body = req.body;
        if (!body || !body.Email || !body.Password) {
            return res.status(400).send('Email and Password are required fields');
        } else {
            let user: User;
            authService.logIn(body.Email, body.Password)
            .pipe(
                switchMap(userResult => {
                    user = userResult;
                    return sessionManager.createSession(user.UserId, JSON.stringify(req.useragent));
                }),
            ).subscribe(
                session => {
                    res.cookie(APP_CONFIG.cookie_name, session.SessionKey, {...COOKIE_OPTIONS, expires: session.Expires, secure: req.secure});
                    return res.send({User: user});
                },
                err => {
                    logger.logError(err);
                    return res.status(err.Status || 500).send({Error: err.Message || 'Could not log you in'});
                }
            )
        }
    });

    router.get('/valid', (req, res) => {
        return res.send(!!res.locals.usersession);
    });

    router.get('/isadmin', (req, res) => {
        return res.send(!!(res.locals.usersession && res.locals.usersession.Role === 'admin'));
    });

    router.post('/logout', (req, res) => {
        if (res.locals.usersession && res.locals.usersession.SessionKey && res.locals.usersession.UserId) {
            res.clearCookie(APP_CONFIG.cookie_name, {...COOKIE_OPTIONS, secure: req.secure});
            sessionManager.deactivateSession(res.locals.usersession.UserId, res.locals.usersession.SessionKey)
            .subscribe(
                _ => res.send({Message: 'Logged out'}),
                err => {
                    logger.logError(err);
                    res.send({Message: 'Logged out'});
                }
            );
        } else {
           return res.send({Message: 'Could not log you out'});
        }
    });

    // AuthGate
    router.use((req, res, next) => {
        if (!res.locals.usersession) {
            return res.status(401).send('Unauthenticated');
        } else {
            return next();
        }
    });

    router.get('/sessions', (req, res) => {
        if (!res.locals.usersession || !res.locals.usersession.UserId) {
            return res.send([]);
        }
        sessionManager.getActiveSessions(res.locals.usersession.UserId)
        .subscribe(
            sessions => res.send(sessions),
            err => {
                logger.logError(err);
                res.status(err.Status || 500).send({Error: err.Message || 'Cannot fetch active sessions'});
            }
        );
    });

    router.delete('/sessions/:sessionKey', (req, res) => {
        const sessionKey = req.params['sessionKey'];
        if (res.locals.usersession && res.locals.usersession.UserId && res.locals.usersession.SessionKey) {
            sessionManager.deactivateSession(res.locals.usersession.UserId, sessionKey)
            .subscribe(
                success => {
                    if (success) {
                        if (res.locals.usersession.SessionKey === sessionKey) {
                            res.clearCookie(APP_CONFIG.cookie_name, {...COOKIE_OPTIONS, secure: req.secure});
                        }
                        return res.send({Message: 'Session Deactivated'});
                    } else {
                        return res.status(400).send({Error: 'Could not find that session'});
                    }
                }
            )
        }
    });

    return router;
}
