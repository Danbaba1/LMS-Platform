import { pool } from '../db/db.js';

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

    async createStudent(name, course) {
        const result = await this.pool.query('INSERT INTO student (name, course) VALUES ($1, $2) RETURNING *', [name, course]);

        return result.rows[0];
    }

    async updateStudent(studentData, id) {
        const result = await this.pool.query('UPDATE student SET name = COALESCE($1, name), course = COALESCE($2, course) WHERE id = $3 RETURNING *', [studentData.name, studentData.course, id]);
        return result.rows[0];
    }

    async deleteStudent(id) {
        const result = await this.pool.query('DELETE FROM student WHERE id = $1 RETURNING *', [id]);

        return result.rows[0];
    }
}
