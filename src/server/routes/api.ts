import {tap} from 'rxjs/operators';
import {Router} from 'express';
import {Config} from '../models/config';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const db = APP_CONFIG.db;
    const sessionManager = APP_CONFIG.sessionManager;

    router.use((req, res, next) => {
        if (res.locals.usersession) {
            return next();
        }
        if (!req.signedCookies || !req.signedCookies[APP_CONFIG.cookie_name]) {
            res.locals.usersession = null;
            return next();
        }
        const authZ = req.signedCookies[APP_CONFIG.cookie_name];
        sessionManager.getUserSession(authZ)
        .pipe(
            tap(result => {
                if (result && result.SessionKey) {
                    sessionManager.updateAccess(result.SessionKey).subscribe(_ => _, err=> console.error(err));
                }
            })
        )
        .subscribe(
            result => {
                if (!result) {
                    return next();
                }
                res.locals.usersession = result;
                return next();
            }, err => {
                console.error(err);
                return next();
            }
        );
    });

    // PUBLIC
    router.use('/auth', require('./auth')(APP_CONFIG));

    // AuthGate
    router.use((req, res, next) => {
        if (!res.locals.usersession) {
            return res.status(401).send('Unauthenticated');
        } else {
            return next();
        }
    });

    // PRIVATE ROUTES GO BELOW HERE

    // Return middleware router
    return router;
}
