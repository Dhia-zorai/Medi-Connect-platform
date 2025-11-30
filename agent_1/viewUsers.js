import { getDb, connectToDatabase } from './database.js';

async function viewUsers() {
    try {
        await connectToDatabase();
        const pool = getDb();

        console.log('\n=== USERS TABLE ===\n');
        const result = await pool.query('SELECT id, email, name, phone, role, created_at FROM users ORDER BY id');

        console.log(`Found ${result.rows.length} users:\n`);
        result.rows.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Phone: ${user.phone || 'N/A'}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Created: ${user.created_at}`);
            console.log('---');
        });

        await pool.end();

    } catch (error) {
        console.error('Error viewing users:', error);
    }
}

viewUsers();
