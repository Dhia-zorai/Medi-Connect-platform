import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, connectToDatabase } from './database.js';
import { sendReminderEmail } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to DB on start
await connectToDatabase();

// API Endpoint to trigger notifications
app.post('/api/notify-patients', async (req, res) => {
    const { doctorId } = req.body;

    if (!doctorId) {
        return res.status(400).json({ error: 'Doctor ID is required' });
    }

    try {
        const pool = getDb();

        // 1. Get all confirmed reservations for this doctor
        // We join with users to get the email
        const query = `
            SELECT r.id, u.email, u.name
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            WHERE r.doctor_id = $1 AND r.status = 'confirmed'
        `;

        const result = await pool.query(query, [doctorId]);
        const patients = result.rows;

        if (patients.length === 0) {
            return res.json({ message: 'No confirmed patients found for this doctor.', count: 0 });
        }

        console.log(`Found ${patients.length} patients for doctor ${doctorId}. Sending emails...`);

        // 2. Send emails
        let successCount = 0;
        const subject = 'Important Update from Your Doctor';
        const body = 'This is a notification from your doctor regarding your upcoming appointment. Please contact us if you have questions.';

        for (const patient of patients) {
            const emailResult = await sendReminderEmail(patient.email, subject, body);
            if (emailResult.success) {
                successCount++;
            }
        }

        res.json({
            message: `Successfully sent notifications to ${successCount} out of ${patients.length} patients.`,
            count: successCount,
            total: patients.length
        });

    } catch (error) {
        console.error('Error processing notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
