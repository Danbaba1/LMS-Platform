import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { CustomError } from '../errors/customError.js';

jest.unstable_mockModule('bcrypt', () => ({
    default: {
        hash: jest.fn().mockResolvedValue('mocked_hashed_password'),
        compare: jest.fn().mockResolvedValue(true)
    }
}));

const { default: bcrypt } = await import('bcrypt');

const { AuthService } = await import('../services/auth.service.js');

const mockClient = {
    query: jest.fn(),
    release: jest.fn()
};

const mockPool = {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue(mockClient)
};

let authService;

beforeEach(() => {
    authService = new AuthService(mockPool);

    jest.clearAllMocks();
});

describe('When registration succeeds, the service returns the newly created student and sends the hashed password to the database.', () => {
    it('should create a new student when registration succeeds', async () => {
        mockClient.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "username": "Jack",
                    "email": "jack@gmail.com",
                    "role": "student",
                    "status": "active"
                }
            ]
        });

        const password = 'terrycrews';
        const username = 'Jack';
        const name = 'Jaco';
        const email = 'jack@gmail.com';

        const result = await authService.registerStudent({ name, username, email, password });

        expect(mockClient.query).toHaveBeenCalledWith(
            'INSERT INTO "user" (username, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, email, 'mocked_hashed_password', 'student', 'active']
        );

        expect(mockClient.query).toHaveBeenCalledWith(
            'INSERT INTO student (name, user_id) VALUES ($1, $2) RETURNING *',
            [name, 1]
        );

        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);

        expect(result).toEqual({
            "id": 1,
            "username": "Jack",
            "email": "jack@gmail.com",
            "role": "student",
            "status": "active"
        });
    });
});

describe('throw an error when a student tries to register with a username that already exists', () => {
    it('should throw an error when a student registers with a username that already exists', async () => {
        const error = new CustomError('Email or username already in use', 409);
        error.code = '23505';
        mockClient.query.mockRejectedValue(error);

        const password = 'teddycrews';
        const username = 'Jack';
        const name = 'Jaco'
        const email = 'jason@gmail.com';

        expect(authService.registerStudent({ name, username, email, password })).rejects.toMatchObject({
            message: 'Email or username already in use',
            status: 409
        });
    });
});

describe('When registration succeeds, the service returns the newly created teacher and sends the hashed password to the database.', () => {
    it('should create a new teacher when registration succeeds', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "email": "jack@gmail.com",
                    "role": "teacher",
                    "status": "active"
                }
            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        const result = await authService.registerTeacher({ email, password });

        expect(mockPool.query).toHaveBeenCalledWith(
            'INSERT INTO "user" (username, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [null, email, 'mocked_hashed_password', 'teacher', 'active']
        );

        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);

        expect(result).toEqual({
            "id": 1,
            "email": "jack@gmail.com",
            "role": "teacher",
            "status": "active"
        });
    });
});

describe('throw an error when a teacher tries to register with an email that already exists', () => {
    it('should throw an error when a teacher registers with an email that already exists', async () => {
        const error = new Error('Duplicate email not allowed');
        error.code = '23505';
        mockPool.query.mockRejectedValue(error);

        const password = 'teddycrews';
        const email = 'jason@gmail.com';

        expect(authService.registerTeacher({ email, password })).rejects.toMatchObject({
            message: 'Email or username already in use',
            status: 409
        });
    });
});

describe('when login is successful, the service returns the student"s details', () => {
    it('should return the student"s details when login is successful', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "username": "Jack",
                    "role": "student",
                    "status": "active",
                    "password_hash": "mocked_hashed_password"
                }
            ]
        });

        const password = 'terrycrews';

        const result = await authService.login('student', 'Jack', password);

        expect(bcrypt.compare).toHaveBeenCalledWith(password, "mocked_hashed_password");

        expect(result).toEqual({
            "username": "Jack",
            "role": "student",
            "status": "active",
            "token": expect.any(String)
        });
    });
});

describe("throw invalid credentials when a student's username cannot be found or student is inactive", () => {
    it("should throw invalid credentials when a student's username cannot be found or student is inactive", async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const identifier = 'Jack';
        const role = 'student';
        const column = 'username';

        await expect(authService.login(role, identifier, password)).rejects.toMatchObject({
            message: "Invalid credentials",
            status: 401
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE ${column} = $1 AND role = $2 AND status = 'active'`,
            [identifier, role]);
    });
});

describe("throw invalid credentials when a student uses the wrong password", () => {
    it("should throw invalid credentials when a student uses the wrong password", async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "username": "Jack",
                    "password_hash": "JerrySanfield"
                }
            ]
        });

        const password = 'terrycrews';
        const identifier = 'Jack';
        const role = 'student';
        const column = 'username';

        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.login('student', 'Jack', password)).rejects.toThrow('Invalid credentials');

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE ${column} = $1 AND role = $2 AND status = 'active'`,
            [identifier, role]);
    });
});

describe('when login is successful, the service returns the teacher"s details', () => {
    it('should return the teacher"s details when login is successful', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "email": 'jack@gmail.com',
                    "role": "teacher",
                    "status": "active",
                    "password_hash": "mocked_hashed_password"
                }
            ]
        });

        const password = 'terrycrews';

        bcrypt.compare.mockResolvedValue(true);

        const result = await authService.login('teacher', 'jack@gmail.com', password);

        expect(bcrypt.compare).toHaveBeenCalledWith(password, "mocked_hashed_password");

        expect(result).toEqual({
            "email": 'jack@gmail.com',
            "role": "teacher",
            "status": "active",
            "token": expect.any(String)
        });
    });
});

describe("throw invalid credentials when a teacher's email cannot be found or teacher is inactive", () => {
    it("should throw invalid credentials when a teacher's email cannot be found or teacher is inactive", async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const identifier = 'jack@gmail.com';
        const role = 'teacher';
        const column = 'email';

        await expect(authService.login(role, identifier, password)).rejects.toMatchObject({
            message: "Invalid credentials",
            status: 401
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE ${column} = $1 AND role = $2 AND status = 'active'`,
            [identifier, role]);
    });
});

describe("should throw invalid credentials when a teacher uses the wrong password", () => {
    it("should throw invalid credentials when a teacher uses the wrong password", async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "email": 'jack@gmail.com',
                    "password_hash": "JerrySanfield"
                }
            ]
        });

        const password = 'terrycrews';
        const identifier = 'jack@gmail.com';
        const role = 'teacher';
        const column = 'email'; const email = 'jack@gmail.com';

        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.login(role, identifier, password)).rejects.toMatchObject({
            message: "Invalid credentials",
            status: 401
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE ${column} = $1 AND role = $2 AND status = 'active'`,
            [identifier, role]);
    });
});

describe('when login is successful, the service returns the admin"s details', () => {
    it('should return the admin"s details when login is successful', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "email": 'jack@gmail.com',
                    "role": "admin",
                    "status": "active",
                    "password_hash": "mocked_hashed_password"
                }
            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        bcrypt.compare.mockResolvedValue(true);

        const result = await authService.loginAdmin(email, password);

        expect(bcrypt.compare).toHaveBeenCalledWith(password, "mocked_hashed_password");

        expect(result).toEqual({
            "email": 'jack@gmail.com',
            "role": "admin",
            "status": "active",
            "token": expect.any(String)
        });
    });
});

describe("throw invalid credentials when an admin's email cannot be found or admin is inactive", () => {
    it("should throw invalid credentials when an admin's email cannot be found or admin is inactive", async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        await expect(authService.loginAdmin(email, password)).rejects.toMatchObject({
            message: "Invalid credentials",
            status: 401
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE email = $1 and role = 'admin' and status = 'active'`, [email]);
    });
});

describe("should throw invalid credentials when an admin uses the wrong password", () => {
    it("should throw invalid credentials when an admin uses the wrong password", async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "email": 'jack@gmail.com',
                    "password_hash": "JerrySanfield"
                }
            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.loginAdmin(email, password)).rejects.toThrow('Invalid credentials');

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE email = $1 and role = 'admin' and status = 'active'`, [email]);
    });
});

describe('jwt contains userId and role', () => {
    it('should contain userId and role', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "id": 1,
                    "email": 'jack@gmail.com',
                    "password_hash": "JerrySanfield",
                    "role": "admin"
                }
            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        bcrypt.compare.mockResolvedValue(true);

        const result = await authService.loginAdmin(email, password);

        const decoded = jwt.decode(result.token);

        expect(decoded.userId).toEqual(1);

        expect(decoded.role).toEqual("admin");
    });
});