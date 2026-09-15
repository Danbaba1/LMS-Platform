import { pool } from '../db/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export class AuthService {
    constructor(dbPool = pool) {
        this.pool = dbPool;
    }

    async registerStudent(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.pool.query('INSERT INTO "user" (username, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING username, email, role, status', [username, email, hashedPassword, 'student', 'active']);

        return newUser.rows[0];
    }

    async registerTeacher(email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.pool.query('INSERT INTO "user" (email, password_hash, role, status) VALUES ($1, $2, $3, $4) RETURNING email, role, status', [email, hashedPassword, 'teacher', 'active']);

        return newUser.rows[0];
    }

    async loginStudent(username, password) {
        const user = await this.pool.query(`SELECT * FROM "user" WHERE username = $1 and role = 'student' and status = 'active'`, [username]);

        if (user.rows.length === 0) {
            return undefined;
        }

        const result = await bcrypt.compare(password, user.rows[0].password_hash);

        if (result) {
            const token = jwt.sign(
                {
                    userId: user.rows[0].id, role: user.rows[0].role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRY_TIME }
            );
            return {
                username: user.rows[0].username,
                role: user.rows[0].role,
                status: user.rows[0].status,
                token
            }
        } else {
            throw new Error('Invalid credentials');
        }
    }

    async loginTeacher(email, password) {
        const user = await this.pool.query(`SELECT * FROM "user" WHERE email = $1 and role = 'teacher' and status = 'active'`, [email]);

        if (user.rows.length === 0) {
            return undefined;
        }

        const result = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!result) {
            throw new Error('Invalid credentials');
        } else {
            const token = jwt.sign(
                {
                    userId: user.rows[0].id, role: user.rows[0].role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRY_TIME }
            );
            return {
                email: user.rows[0].email,
                role: user.rows[0].role,
                status: user.rows[0].status,
                token
            }
        }
    }

    async loginAdmin(email, password) {
        const user = await this.pool.query(`SELECT * FROM "user" WHERE email = $1 and role = 'admin' and status = 'active'`, [email]);

        if (user.rows.length === 0) {
            return undefined;
        }

        const result = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!result) {
            throw new Error('Invalid credentials');
        } else {
            const token = jwt.sign(
                {
                    userId: user.rows[0].id, role: user.rows[0].role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRY_TIME }
            );
            return {
                email: user.rows[0].email,
                role: user.rows[0].role,
                status: user.rows[0].status,
                token
            }
        }
    }
}