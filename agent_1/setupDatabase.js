import { connectToDatabase, closeDatabase } from './database.js';

async function setup() {
    try {
        const pool = await connectToDatabase();

        console.log('Checking database schema...');

        // Only create the reminder_logs table as it's specific to this agent
        // We assume users, doctors, and reservations tables already exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reminder_logs(
    id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(id),
    reminder_type VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

        console.log('✅ Schema initialization complete.');
        console.log('   - Ensured "reminder_logs" table exists.');
        console.log('   - Skipped other tables (assuming they exist).');
        console.log('   - Ready to scan for reservations.');

    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await closeDatabase();
    }
}

setup();
