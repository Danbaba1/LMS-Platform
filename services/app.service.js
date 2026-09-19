import { pool } from '../db/db.js';
import { createStudentUserAndProfile } from './studentRegistration.js';
export class StudentService {
    constructor(dbPool = pool) {
        this.pool = dbPool;
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

            const newStudent = await createStudentUserAndProfile(client, { name, username, email, password });

            await client.query('COMMIT');
            return newStudent;
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

    async deactivateStudent(id) {
        const result = await this.pool.query(`WITH updated_user AS (
    UPDATE "user" SET status = 'inactive' WHERE id = (SELECT user_id FROM student WHERE id = $1) RETURNING id
)
SELECT student.* FROM student
JOIN updated_user ON student.user_id = updated_user.id;`, [id]);

        return result.rows[0];
    }
}
