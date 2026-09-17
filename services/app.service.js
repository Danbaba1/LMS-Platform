import { pool } from '../db/db.js';
import { AuthService } from './auth.service.js';

export class StudentService {
    constructor(dbPool = pool, authService = new AuthService(dbPool)) {
        this.pool = dbPool;
        this.authService = authService;
    }

    async getStudents() {
        const result = await this.pool.query('SELECT * FROM student');

        return result.rows;
    }

    async getStudentById(id) {
        const result = await this.pool.query('SELECT * FROM student WHERE id = $1', [id]);

        return result.rows[0];
    }

    async createStudent(name, username, email, password) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const newUser = await this.authService.registerStudentTx({ username, email, password, client });

            const newStudent = await client.query(
                'INSERT INTO student (name, user_id) VALUES ($1, $2) RETURNING *',
                [name, newUser.id]
            );

            await client.query('COMMIT');
            return newStudent.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async updateStudent(name, id) {
        const result = await this.pool.query('UPDATE student SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        return result.rows[0];
    }

    async deleteStudent(id) {
        const result = await this.pool.query('DELETE FROM student WHERE id = $1 RETURNING *', [id]);

        return result.rows[0];
    }
}
