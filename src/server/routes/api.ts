import {Router} from 'express';
import {Config} from '../models/config';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    const health = APP_CONFIG.healthService;

    // PUBLIC
    router.use('/auth', require('./auth')(APP_CONFIG));

    router.get('/healthcheck', (req, res) => {
        const isHealthy = health.isHealthy();
        if (isHealthy) {
            return res.send('success');
        } else {
            return res.status(500).send({Error: 'Server is not available for requests'});
        }
    });

    // AuthGate
    // router.use((req, res, next) => {
    //     if (!res.locals.usersession) {
    //         return res.status(401).send('Unauthenticated');
    //     } else {
    //         return next();
    //     }
    // });

    // PRIVATE ROUTES GO BELOW HERE

    // Return middleware router
    return router;
}
