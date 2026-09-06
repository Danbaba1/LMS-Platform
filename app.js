import express from 'express';
import { createRouter } from './routes/app.route.js';

export function createApp(router = createRouter()) {
    const app = express();

    app.use(express.json());
    app.use("/students", router);

    app.use((err, req, res, next) => {
        if (err.isOperational) {
            return res.status(err.status).json({
                message: err.message
            });
        } else {
            console.error(err.stack);
            return res.status(500).json({
                message: 'Server error'
            });
        }

    });

    return app;
}
