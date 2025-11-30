import { getDb } from './database.js';

export async function getPendingAppointments() {
    const pool = getDb();

    // Join reservations with users to get email
    // Also join with reminder_logs to check status
    // We want reservations that are 'confirmed' and not in the past (or recently past)
    // For simplicity, we fetch all confirmed reservations and filter in code or refine query

    const query = `
        SELECT 
            r.id, 
            r.time_slot, 
            u.email as client_email, 
            u.name as client_name,
            r.status,
            COALESCE(rl_24.sent_at IS NOT NULL, false) as sent_24h,
            COALESCE(rl_2.sent_at IS NOT NULL, false) as sent_2h,
            COALESCE(rl_at.sent_at IS NOT NULL, false) as sent_at_time
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN reminder_logs rl_24 ON r.id = rl_24.reservation_id AND rl_24.reminder_type = '24hour'
        LEFT JOIN reminder_logs rl_2 ON r.id = rl_2.reservation_id AND rl_2.reminder_type = '2hour'
        LEFT JOIN reminder_logs rl_at ON r.id = rl_at.reservation_id AND rl_at.reminder_type = 'atTime'
        WHERE r.status = 'confirmed'
    `;

    const result = await pool.query(query);

    // Transform to match the structure expected by the agent
    return result.rows.map(row => ({
        _id: row.id,
        clientName: row.client_name,
        clientEmail: row.client_email,
        // time_slot is a Date object in pg
        appointmentDate: row.time_slot.toISOString().split('T')[0],
        appointmentTime: `${String(row.time_slot.getHours()).padStart(2, '0')}:${String(row.time_slot.getMinutes()).padStart(2, '0')}`,
        status: row.status,
        remindersSent: {
            '24hour': row.sent_24h,
            '2hour': row.sent_2h,
            'atTime': row.sent_at_time
        }
    }));
}

export async function updateReminderStatus(id, reminderType) {
    const pool = getDb();

    const query = `
        INSERT INTO reminder_logs (reservation_id, reminder_type)
        VALUES ($1, $2)
    `;

    await pool.query(query, [id, reminderType]);
}

export async function completeAppointment(id) {
    const pool = getDb();

    const query = `
        UPDATE reservations
        SET status = 'completed'
        WHERE id = $1
    `;

    await pool.query(query, [id]);
}
