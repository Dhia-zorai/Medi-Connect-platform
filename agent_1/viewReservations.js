import { getDb, connectToDatabase } from './database.js';

async function viewReservations() {
    try {
        await connectToDatabase();
        const pool = getDb();

        console.log('\n=== RESERVATIONS TABLE ===\n');

        // Get reservations with user details
        const result = await pool.query(`
            SELECT 
                r.id,
                r.doctor_id,
                r.user_id,
                u.email as user_email,
                u.name as user_name,
                r.time_slot,
                r.status,
                r.payment_status,
                r.created_at
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.id
        `);

        console.log(`Found ${result.rows.length} reservations:\n`);

        result.rows.forEach(reservation => {
            console.log(`Reservation ID: ${reservation.id}`);
            console.log(`  Doctor ID: ${reservation.doctor_id}`);
            console.log(`  User ID: ${reservation.user_id}`);
            console.log(`  User Name: ${reservation.user_name}`);
            console.log(`  User Email: ${reservation.user_email}`);
            console.log(`  Time Slot: ${reservation.time_slot}`);
            console.log(`  Status: ${reservation.status}`);
            console.log(`  Payment Status: ${reservation.payment_status}`);
            console.log(`  Created: ${reservation.created_at}`);
            console.log('---');
        });

        await pool.end();

    } catch (error) {
        console.error('Error viewing reservations:', error);
    }
}

viewReservations();
