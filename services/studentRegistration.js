// services/studentRegistration.js
import bcrypt from 'bcrypt';

export async function createStudentUserAndProfile(client, { name, username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await client.query(
        'INSERT INTO "user" (username, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [username, email, hashedPassword, 'student', 'active']
    );

    const newStudent = await client.query(
        'INSERT INTO student (name, user_id) VALUES ($1, $2) RETURNING *',
        [name, newUser.rows[0].id]
    );

    return newStudent.rows[0];
}