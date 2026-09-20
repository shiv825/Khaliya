import nodemailer from 'nodemailer';
import dns from 'dns';
import { getOtpEmailTemplate } from '../src/utils/emailTemplates.js';

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const smtpUser = process.env.SMTP_USER || 'shivkumarrdn7@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'nasyuwmtzsuarioo';
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    const emailContent = getOtpEmailTemplate({ otp, email });

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        requireTLS: smtpPort === 587,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000
    });

    try {
        await transporter.sendMail({
            from: `"Khaliya Sanctuary" <${smtpUser}>`,
            to: email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully via Gmail service' });
    } catch (error) {
        console.error('❌ Nodemailer Send Error:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
}
