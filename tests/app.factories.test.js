import { createRouter } from '../routes/app.route.js';
import { createApp } from '../app.js';
import { jest } from '@jest/globals';
import { errorHandler } from '../middlewares/error.middleware.js';

let consoleErrorSpy;

const next = jest.fn();

const createMockResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    return res;
}

beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => {
    consoleErrorSpy.mockRestore();
});

describe('test factory apps', () => {
    it('createRouter should return router', () => {
        const response = createRouter();

        expect(typeof response.get).toBe('function');
    });

    it('createApp should return app', () => {
        const response = createApp();

        expect(typeof response.listen).toBe('function');
    });

    it('errorHandler should use customError when isOperational is true', () => {
        const res = createMockResponse();
        const err = {
            "isOperational": true,
            "status": 400,
            "message": "Bad request"
        };

        errorHandler(err, {}, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({ "message": "Bad request" });
    });

    it('errorHandler show return status 500 when isOperational is false', () => {
        const res = createMockResponse();
        const err = {
            "isOperational": false,
            "status": 500,
            "message": "Server error"
        };

        errorHandler(err, {}, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({ "message": "Server error" });
    });
});