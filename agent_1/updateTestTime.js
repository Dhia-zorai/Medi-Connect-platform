import { getDb, connectToDatabase } from './database.js';

async function updateForTesting() {
    try {
        await connectToDatabase();
        const pool = getDb();

        // Set to 1 minute from now
        const oneMinuteFromNow = new Date();
        oneMinuteFromNow.setMinutes(oneMinuteFromNow.getMinutes() + 1);

        console.log(`\nUpdating reservation for taherayadi1999@gmail.com...`);
        console.log(`New time slot: ${oneMinuteFromNow}\n`);

        const result = await pool.query(
            `UPDATE reservations 
             SET time_slot = $1 
             WHERE user_id = 3 
             RETURNING id, user_id, time_slot`,
            [oneMinuteFromNow]
        );

        console.log('✅ Updated successfully');
        console.log(`  Time: ${result.rows[0].time_slot}`);

        await pool.end();

    } catch (error) {
        console.error('Error:', error);
    }
}

updateForTesting();
