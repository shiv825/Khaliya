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

    // Use fallback credentials or environment variables from Vercel
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || 'shivkumarrdn7@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'nasyuwmtzsuarioo';
    const smtpPort = process.env.SMTP_PORT || 465;

    let targetIp = smtpHost;
    try {
        const ips = await dns.promises.resolve4(smtpHost);
        if (ips && ips.length > 0) targetIp = ips[0];
    } catch (e) {}

    try {
        const emailTransporter = nodemailer.createTransport({
            host: targetIp,
            port: Number(smtpPort),
            secure: Number(smtpPort) === 465,
            servername: smtpHost,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: { rejectUnauthorized: false }
        });

        const emailContent = getOtpEmailTemplate({ otp, email });

        await emailTransporter.sendMail({
            from: `"Khaliya Sanctuary" <${smtpUser}>`,
            to: email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully via Vercel' });
    } catch (error) {
        console.error('Vercel Nodemailer Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send email via Vercel', error: error.message });
    }
}
