import { getPendingAppointments, updateReminderStatus, completeAppointment } from './appointmentModel.js';
import { sendReminderEmail } from './emailService.js';
import { connectToDatabase } from './database.js';

const CHECK_INTERVAL = 60000; // Check every 60 seconds

async function sendReminder(appointment, reminderType) {
    const { clientEmail, clientName, appointmentDate, appointmentTime } = appointment;

    let subject, body;

    if (reminderType === '24hour') {
        subject = '24-Hour Appointment Reminder';
        body = `Dear ${clientName},\n\nThis is a reminder that you have an appointment scheduled for tomorrow, ${appointmentDate} at ${appointmentTime}.\n\nPlease arrive 10 minutes early.\n\nBest regards,\nYour Healthcare Team`;
    } else if (reminderType === '2hour') {
        subject = '2-Hour Appointment Reminder';
        body = `Dear ${clientName},\n\nYour appointment is in 2 hours at ${appointmentTime}.\n\nPlease don't forget!\n\nBest regards,\nYour Healthcare Team`;
    } else if (reminderType === 'atTime') {
        subject = 'Appointment Starting Now';
        body = `Dear ${clientName},\n\nYour appointment is starting now at ${appointmentTime}.\n\nBest regards,\nYour Healthcare Team`;
    }

    const result = await sendReminderEmail(clientEmail, subject, body);

    if (result.success) {
        await updateReminderStatus(appointment._id, reminderType);
        console.log(`✅ Sent ${reminderType} reminder to ${clientEmail}`);
    } else {
        console.error(`❌ Failed to send ${reminderType} reminder to ${clientEmail}`);
    }
}

function getTimeDifferenceInHours(appointmentDateTime) {
    const now = new Date();
    const appointmentTime = new Date(appointmentDateTime);
    const differenceMs = appointmentTime - now;
    return differenceMs / (1000 * 60 * 60); // Convert to hours
}

async function checkAndSendReminders() {
    try {
        const appointments = await getPendingAppointments();

        console.log(`Checking ${appointments.length} confirmed appointments...`);

        for (const appointment of appointments) {
            const appointmentDateTime = `${appointment.appointmentDate}T${appointment.appointmentTime}`;
            const hoursDiff = getTimeDifferenceInHours(appointmentDateTime);

            console.log(`  Appointment ${appointment._id}: ${hoursDiff.toFixed(2)} hours away`);

            // 24-hour reminder (23-25 hours before)
            if (hoursDiff <= 25 && hoursDiff >= 23 && !appointment.remindersSent['24hour']) {
                await sendReminder(appointment, '24hour');
            }

            // 2-hour reminder (1.5-2.5 hours before)
            if (hoursDiff <= 2.5 && hoursDiff >= 1.5 && !appointment.remindersSent['2hour']) {
                await sendReminder(appointment, '2hour');
            }

            // At-time reminder (0-15 minutes before)
            if (hoursDiff <= 0.25 && hoursDiff >= -0.05 && !appointment.remindersSent['atTime']) {
                await sendReminder(appointment, 'atTime');
            }

            // Mark as completed if past (more than 1 hour ago)
            if (hoursDiff < -1) {
                console.log(`  Marking appointment ${appointment._id} as completed (past)`);
                await completeAppointment(appointment._id);
            }
        }

    } catch (error) {
        console.error('Error checking reminders:', error);
    }
}

async function startAgent() {
    console.log('🚀 Reminder Agent Starting...\n');

    // Connect to database
    await connectToDatabase();

    console.log(`⏰ Monitoring appointments every ${CHECK_INTERVAL / 1000} seconds...\n`);

    // Run immediately on start
    await checkAndSendReminders();

    // Then run on interval
    setInterval(async () => {
        console.log(`\n--- ${new Date().toLocaleString()} ---`);
        await checkAndSendReminders();
    }, CHECK_INTERVAL);
}

startAgent();
