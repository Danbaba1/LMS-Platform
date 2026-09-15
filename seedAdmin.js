import { pool } from './db/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function adminSeed(email, password) {
    const user = await pool.query(`SELECT role FROM "user" WHERE role = 'admin'`);
    if (user.rows.length !== 0) {
        throw new Error('Admin already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('INSERT INTO "user" (email, password_hash, role, status) VALUES ($1, $2, $3, $4)', [email, hashedPassword, 'admin', 'active']);

    console.log('success');
}

adminSeed(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD).catch((err) => {
    console.error(err.message);
});