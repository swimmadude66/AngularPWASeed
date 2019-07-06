import {Router} from 'express';
import {Config} from '../models/config';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();

    // Add CSP to redirect most browsers, HSTS to avoid asking again
    router.use((req, res, next) => {
        res.setHeader('Strict-Transport-Security', `max-age=${Math.round(365 * 24 * 60 * 60)}`); // 365 days in seconds
        if (req.hostname !== 'localhost') { // Edge and firefox consider http://localhost to be insecure... :facepalm:
            res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
        }
        return next();
    });


    // HTTPS terminated at the ELB layer needs a redirect too
    router.use((req, res, next) => {
        let proto = req.headers['x-forwarded-proto'];
        if (Array.isArray(proto)) {
            proto = proto[0];
        }
        if (!proto || /https(:\/\/)?$/i.test(proto)) {
            return next();
        } else {
            const proxyHost = req.headers['x-forwarded-host'];
            const redir = `https://${proxyHost || req.hostname}${req.originalUrl}`;
            return res.redirect(301, redir);
        }
    });

    return router;
}
