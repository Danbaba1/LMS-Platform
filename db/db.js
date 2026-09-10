import dotenv from 'dotenv';
import { Pool } from 'pg';

// dev branch (NODE_ENV !== 'test') is exercised via npm run dev, not covered by automated tests
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});