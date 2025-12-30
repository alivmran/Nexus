require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    console.log('--- Email Debugger ---');
    console.log('1. Reading credentials...');
    console.log('   User:', process.env.EMAIL_USER);
    
    if (!process.env.EMAIL_PASS) {
        console.error('   ERROR: EMAIL_PASS is missing in .env file');
        return;
    }
    console.log('   Pass length:', process.env.EMAIL_PASS.length);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    console.log('2. Attempting to send to:', process.env.EMAIL_USER);
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Sends email to yourself
            subject: 'Test Email from Nexus',
            text: 'If you see this, Nodemailer is working!',
        });
        console.log('3. SUCCESS! Email sent. ID:', info.messageId);
    } catch (error) {
        console.error('3. FAILED. Error details below:');
        console.error(error);
    }
};

testEmail();