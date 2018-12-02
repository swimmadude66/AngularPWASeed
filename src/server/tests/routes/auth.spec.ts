import * as request from 'supertest';
import * as express from 'express';

describe('/auth', () => {

    let app;
    before(() => {
        app = express();
        app.use('/api/auth', require('../../routes/auth')({}));
        app.use((req, res) => res.status(404).send('not a valid endpoint'));
    });

    it('should check if a session is valid', (done) => {
        request(app)
        .get('/api/auth/valid')
        .expect(200, 'false', done);
    });
});
