import { getDb, connectToDatabase } from './database.js';

async function viewDatabase() {
    try {
        await connectToDatabase();
        const pool = getDb();

        console.log('\n=== DATABASE TABLES ===\n');

        // List all tables
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('Tables in database:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Show users
        console.log('\n=== USERS ===');
        const usersResult = await pool.query('SELECT * FROM users');
        console.table(usersResult.rows);

        // Show doctors
        console.log('\n=== DOCTORS ===');
        const doctorsResult = await pool.query('SELECT * FROM doctors');
        console.table(doctorsResult.rows);

        // Show reservations
        console.log('\n=== RESERVATIONS ===');
        const reservationsResult = await pool.query('SELECT * FROM reservations');
        console.table(reservationsResult.rows);

        // Show reminder_logs
        console.log('\n=== REMINDER LOGS ===');
        const logsResult = await pool.query('SELECT * FROM reminder_logs');
        console.table(logsResult.rows);

        await pool.end();
        console.log('\n✅ Database view complete');

    } catch (error) {
        console.error('Error viewing database:', error);
    }
}

viewDatabase();
