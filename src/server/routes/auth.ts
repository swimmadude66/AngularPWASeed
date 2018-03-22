import {Router} from 'express';
import {Services} from '../models/config';

module.exports = (SERVICES: Services) => {
    const router = Router();
    const db = SERVICES.db;

    return router;
}