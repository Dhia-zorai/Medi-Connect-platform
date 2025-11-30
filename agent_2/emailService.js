import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(recipientEmail, subject, body) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: recipientEmail,
            subject: subject,
            html: `<p>${body}</p>`,
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            return { success: false, error };
        }

        console.log('✅ Email sent successfully!', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Exception while sending email:', error);
        return { success: false, error };
    }
}
