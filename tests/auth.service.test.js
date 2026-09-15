import { jest } from '@jest/globals';

jest.unstable_mockModule('bcrypt', () => ({
    default: {
        hash: jest.fn().mockResolvedValue('mocked_hashed_password'),
        compare: jest.fn().mockResolvedValue(true)
    }
}));

const { default: bcrypt } = await import('bcrypt');

const { AuthService } = await import('../services/auth.service.js');

const mockPool = {
    query: jest.fn()
};

let authService;

beforeEach(() => {
    authService = new AuthService(mockPool);

    jest.clearAllMocks();
});

describe('When registration succeeds, the service returns the newly created student and sends the hashed password to the database.', () => {
    it('should create a new student when registration succeeds', async () => {
        mockPool.query.mockResolvedValue({
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
        const email = 'jack@gmail.com';

        const result = await authService.registerStudent(username, email, password);

        expect(mockPool.query).toHaveBeenCalledWith(
            'INSERT INTO "user" (username, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING username, email, role, status',
            [username, email, 'mocked_hashed_password', 'student', 'active']
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
        mockPool.query.mockRejectedValue(new Error('Duplicate username not allowed'));

        const password = 'teddycrews';
        const username = 'Jack';
        const email = 'jason@gmail.com';

        expect(authService.registerStudent(username, email, password)).rejects.toThrow('Duplicate username not allowed');
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

        const result = await authService.registerTeacher(email, password);

        expect(mockPool.query).toHaveBeenCalledWith(
            'INSERT INTO "user" (email, password_hash, role, status) VALUES ($1, $2, $3, $4) RETURNING email, role, status',
            [email, 'mocked_hashed_password', 'teacher', 'active']
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
        mockPool.query.mockRejectedValue(new Error('Duplicate email not allowed'));

        const password = 'teddycrews';
        const email = 'jason@gmail.com';

        expect(authService.registerTeacher(email, password)).rejects.toThrow('Duplicate email not allowed');
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
        const username = 'Jack';

        const result = await authService.loginStudent(username, password);

        expect(bcrypt.compare).toHaveBeenCalledWith(password, "mocked_hashed_password");

        expect(result).toEqual({
            "username": "Jack",
            "role": "student",
            "status": "active"
        });
    });
});

describe('return undefined when a student"s username cannot be found', () => {
    it('should return undefined for a student"s username that cannot be found', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const username = 'Jack';

        const result = await authService.loginStudent(username, password);

        expect(result).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE username = $1 and role = 'student' and status = 'active'`, [username]);
    });
});

describe('return undefined when a student is inactive', () => {
    it('should return undefined for a student that is inactive', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const username = 'Jack';

        const result = await authService.loginStudent(username, password);

        expect(result).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE username = $1 and role = 'student' and status = 'active'`, [username]);
    });
});

describe('throw an error when student uses wrong password', () => {
    it('should throw an error when a student uses wrong password', async () => {
        mockPool.query.mockResolvedValue({
            rows: [
                {
                    "username": "Jack",
                    "password_hash": "JerrySanfield"
                }
            ]
        });

        const password = 'terrycrews';
        const username = 'Jack';

        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.loginStudent(username, password)).rejects.toThrow('Invalid credentials');

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE username = $1 and role = 'student' and status = 'active'`, [username]);
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
        const email = 'jack@gmail.com';

        bcrypt.compare.mockResolvedValue(true);

        const result = await authService.loginTeacher(email, password);

        expect(bcrypt.compare).toHaveBeenCalledWith(password, "mocked_hashed_password");

        expect(result).toEqual({
            "email": 'jack@gmail.com',
            "role": "teacher",
            "status": "active"
        });
    });
});

describe('return undefined when a teacher"s email cannot be found', () => {
    it('should return undefined for a teacher"s email that cannot be found', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        const result = await authService.loginTeacher(email, password);

        expect(result).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE email = $1 and role = 'teacher' and status = 'active'`, [email]);
    });
});


describe('return undefined when a teacher is inactive', () => {
    it('should return undefined for a teacher that is inactive', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        const result = await authService.loginTeacher(email, password);

        expect(result).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE email = $1 and role = 'teacher' and status = 'active'`, [email]);
    });
});

describe('throw an error when teacher uses wrong password', () => {
    it('should throw an error when a teacher uses wrong password', async () => {
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

        await expect(authService.loginTeacher(email, password)).rejects.toThrow('Invalid credentials');

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE email = $1 and role = 'teacher' and status = 'active'`, [email]);
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
            "status": "active"
        });
    });
});

describe('return undefined when a admin"s email cannot be found', () => {
    it('should return undefined for a admin"s email that cannot be found', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        const result = await authService.loginAdmin(email, password);

        expect(result).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE email = $1 and role = 'admin' and status = 'active'`, [email]);
    });
});

describe('return undefined when an admin is inactive', () => {
    it('should return undefined for an admin that is inactive', async () => {
        mockPool.query.mockResolvedValue({
            rows: [

            ]
        });

        const password = 'terrycrews';
        const email = 'jack@gmail.com';

        const result = await authService.loginAdmin(email, password);

        expect(result).toBeUndefined();

        expect(mockPool.query).toHaveBeenCalledTimes(1);

        expect(mockPool.query).toHaveBeenCalledWith(`SELECT * FROM "user" WHERE email = $1 and role = 'admin' and status = 'active'`, [email]);
    });
});

describe('throw an error when admin uses wrong password', () => {
    it('should throw an error when a admin uses wrong password', async () => {
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