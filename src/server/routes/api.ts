import {Router} from 'express';
import {Config} from '../models/config';

module.exports = (APP_CONFIG: Config) => {
    const router = Router();
    
    // PUBLIC
    router.use('/auth', require('./auth')(APP_CONFIG));

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
