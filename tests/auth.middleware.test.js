import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const { default: authMiddleware } = await import('../middlewares/auth.middleware.js');

let req, res, next;

beforeEach(() => {
    req = {
        headers: {}
    };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    next = jest.fn();
});

describe('throw error when request does not contain authorization header', () => {
    it('should throw error for missing authorization header in request', () => {
        authMiddleware(req, res, next);

        expect(next.mock.calls[0][0].message).toBe('No token provided');
    });
});

describe('a valid JWT is successfully accepted and next is called', () => {
    it('should accept a valid JWT successfully and call next', () => {
        const user = {
            "userId": 1,
            "role": "student"
        };

        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY_TIME });

        req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        }

        authMiddleware(req, res, next);

        expect(req.user).toMatchObject(user);

        expect(next).toHaveBeenCalledTimes(1);
    });
});

describe('an invalid JWT is rejected', () => {
    it('should call next with an error for an invalid JWT', () => {
        req = {
            headers: {
                authorization: `Bearer 'hjjadfndkndo'`
            }
        }

        authMiddleware(req, res, next);

        expect(next.mock.calls[0][0].message).toBe('jwt malformed');
    });
});