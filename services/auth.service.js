import { pool } from '../db/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { CustomError } from '../errors/customError.js';
dotenv.config();

export class AuthService {
    constructor(dbPool = pool) {
        this.pool = dbPool;
    }

    async #createUserRecord({ username = null, email, password, role, client = this.pool }) {
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await client.query(
                'INSERT INTO "user" (username, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [username, email, hashedPassword, role, 'active']
            );
            return newUser.rows[0];
        } catch (err) {
            if (err.code === '23505') {
                throw new CustomError('Email or username already in use', 409);
            }
            throw err;
        }
    }

    async registerStudent(student) {
        return this.#createUserRecord({ username: student.username, email: student.email, password: student.password, role: 'student' });
    }

    async registerStudentTx(student) {
        return this.#createUserRecord({ username: student.username, email: student.email, password: student.password, role: 'student', client: student.client });
    }

    async registerTeacher(teacher) {
        return this.#createUserRecord({ email: teacher.email, password: teacher.password, role: 'teacher' });
    }

    async #authenticate(query, params, password) {
        const user = await this.pool.query(query, params);
        const userExists = user.rows.length > 0;

        const dummyHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8v9K6cM1kQd6XqM6XW5Y8kQd6XqM6X';
        const hashToCompare = userExists ? user.rows[0].password_hash : dummyHash;

        const result = await bcrypt.compare(password, hashToCompare);

        if (!userExists || !result) {
            throw new CustomError('Invalid credentials', 401);
        }

        return user.rows[0];
    }

    async login(role, identifier, password) {
        const columnByRole = {
            student: 'username',
            teacher: 'email'
        };

        const column = columnByRole[role]; // always 'username' or 'email' — nothing else is possible

        const user = await this.#authenticate(
            `SELECT * FROM "user" WHERE ${column} = $1 AND role = $2 AND status = 'active'`,
            [identifier, role],
            password
        );


        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY_TIME }
        );

        return { [column]: user[column], role: user.role, status: user.status, token };
    }


    async loginAdmin(email, password) {
        const row = await this.#authenticate(
            `SELECT * FROM "user" WHERE email = $1 and role = 'admin' and status = 'active'`,
            [email],
            password
        );

        const token = jwt.sign(
            { userId: row.id, role: row.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY_TIME }
        );

        return { email: row.email, role: row.role, status: row.status, token };
    }
}
