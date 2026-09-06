import express from 'express';
import { createRouter } from './routes/app.route.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(router = createRouter()) {
    const app = express();

    app.use(express.json());
    app.use("/students", router);

    app.use(errorHandler);

    return app;
}
