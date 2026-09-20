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

    // Use environment variables or resilient defaults
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || 'shivkumarrdn7@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'nasyuwmtzsuarioo';
    const smtpPort = Number(process.env.SMTP_PORT) || 587; // Default to 587 STARTTLS for serverless/cloud platforms

    const emailContent = getOtpEmailTemplate({ otp, email });

    const customIpv4Lookup = (hostname, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        dns.lookup(hostname, { family: 4 }, callback);
    };

    // Primary Transporter (Port 587 STARTTLS / Port 465 SSL)
    const primaryTransporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        family: 4,
        lookup: customIpv4Lookup,
        secure: smtpPort === 465,
        requireTLS: smtpPort === 587,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
    });

    try {
        await primaryTransporter.sendMail({
            from: `"Khaliya Sanctuary" <${smtpUser}>`,
            to: email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully via primary SMTP' });
    } catch (error) {
        console.warn('⚠️ Primary SMTP failed in send-otp handler:', error.message);
        
        // Fallback Transporter using Nodemailer Gmail service
        try {
            const fallbackTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: smtpUser, pass: smtpPass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 15000,
                greetingTimeout: 15000
            });

            await fallbackTransporter.sendMail({
                from: `"Khaliya Sanctuary" <${smtpUser}>`,
                to: email,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
            });

            return res.status(200).json({ success: true, message: 'Email sent successfully via Gmail service fallback' });
        } catch (fbErr) {
            console.error('❌ Both SMTP transports failed in send-otp handler:', fbErr.message);
            return res.status(500).json({ success: false, message: 'Failed to send email', error: fbErr.message });
        }
    }
}
