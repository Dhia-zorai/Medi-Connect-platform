import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

export async function connectToDatabase() {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL');
        client.release();
        return pool;
    } catch (error) {
        console.error('❌ PostgreSQL connection error:', error);
        throw error;
    }
}

export async function closeDatabase() {
    await pool.end();
    console.log('PostgreSQL connection closed');
}

export function getDb() {
    return pool;
}
