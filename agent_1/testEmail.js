import { sendReminderEmail } from './emailService.js';

async function testEmail() {
    console.log('Testing email service...\n');

    const result = await sendReminderEmail(
        'taherayadi1999@gmail.com',
        'Test Email from Agent',
        'This is a test email to verify the email service is working correctly.'
    );

    if (result.success) {
        console.log('\n✅ Email sent successfully!');
    } else {
        console.log('\n❌ Email failed to send');
        console.error('Error:', result.error);
    }
}

testEmail();
