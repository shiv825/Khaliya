import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Use fallback credentials or environment variables from Vercel
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || 'khaliyarestaurant@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'ojusvrcpwdshdxoi';
    const smtpPort = process.env.SMTP_PORT || 465;

    try {
        const emailTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: Number(smtpPort) === 465, // true for 465, false for 587
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        await emailTransporter.sendMail({
            from: `"Khaliya Sanctuary" <${smtpUser}>`,
            to: email,
            subject: 'Your Khaliya Login Code',
            text: `Your Khaliya Sanctuary verification code is: ${otp}. Valid for 5 minutes.`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 20px; background: #fff;">
                    <h2 style="color: #D4AF37; text-align: center; font-size: 28px; letter-spacing: 2px;">KHALIYA SANCTUARY</h2>
                    <div style="width: 50px; height: 2px; background: #D4AF37; margin: 20px auto;"></div>
                    <p style="font-size: 16px; color: #555; text-align: center;">Welcome to the Sanctuary. Use the code below to verify your access.</p>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 15px; margin: 30px 0; text-align: center;">
                        <h1 style="font-size: 42px; color: #000; margin: 0; letter-spacing: 10px;">${otp}</h1>
                    </div>
                    <p style="font-size: 14px; color: #999; text-align: center;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
                    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #bbb;">
                        &copy; ${new Date().getFullYear()} Khaliya Luxury Dining. All rights reserved.
                    </div>
                </div>
            `
        });

        return res.status(200).json({ success: true, message: 'Email sent successfully via Vercel' });
    } catch (error) {
        console.error('Vercel Nodemailer Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send email via Vercel', error: error.message });
    }
}
