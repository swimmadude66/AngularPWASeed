import {Router} from 'express';
import {Services} from '../models/config';

module.exports = (APP_CONFIG, SERVICES: Services) => {
    const router = Router();
    const db = SERVICES.db;

    router.use((req, res, next) => {
        if (res.locals.usersession) {
            return next();
        }
        if (!req.signedCookies || !req.signedCookies[APP_CONFIG.cookie_name]) {
            res.locals.user = null;
            return next();
        }
        const authZ = req.signedCookies[APP_CONFIG.cookie_name];
        const q = 'Select u.Email, s.SessionId, s.Expires from `sessions` s'
        + ' join `users` u on u.UserId = s.UserId'
        + ' where s.Active=1 AND u.Active=1 AND s.SessionId=? AND s.Expires > ?;';
        db.query(q, [authZ, Math.floor(new Date().valueOf()/1000)])
        .subscribe(
            result => {
                if (!result) {
                    return next();
                }
                const usersession = result;
                res.locals.usersession = usersession;
                return next();
            }, err => {
                return next();
            }
        );
    });

    // PUBLIC
    router.use('/auth', require('./auth')(SERVICES));

    // AuthGate
    router.use((req, res, next) => {
        if (!res.locals.usersession) {
            return res.status(403).send('Unauthorized');
        } else {
            return next();
        }
    });

    // PRIVATE

    return router;
}