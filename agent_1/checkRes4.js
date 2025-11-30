import { getDb, connectToDatabase } from './database.js';

async function checkReservation4() {
    try {
        await connectToDatabase();
        const pool = getDb();

        const result = await pool.query(`
            SELECT r.id, r.user_id, u.name, u.email, r.time_slot, r.status
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = 4
        `);

        if (result.rows.length > 0) {
            const res = result.rows[0];
            console.log('\n=== RESERVATION 4 ===');
            console.log(`ID: ${res.id}`);
            console.log(`User ID: ${res.user_id}`);
            console.log(`Name: ${res.name}`);
            console.log(`Email: ${res.email}`);
            console.log(`Time Slot: ${res.time_slot}`);
            console.log(`Status: ${res.status}`);

            const now = new Date();
            const diff = (res.time_slot - now) / (1000 * 60 * 60);
            console.log(`\nHours from now: ${diff.toFixed(2)}`);
        }

        await pool.end();

    } catch (error) {
        console.error('Error:', error);
    }
}

checkReservation4();
