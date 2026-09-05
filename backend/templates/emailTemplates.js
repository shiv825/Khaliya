/**
 * Khaliya Sanctuary - Master Luxury Email Templates
 * Standardized, high-contrast, dark-gold luxury HTML email layouts.
 */

/**
 * Base Master Layout Wrapper for Email Templates
 */
const renderBaseLayout = ({ title, previewText = '', contentHtml }) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0B0E14; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important;">
    ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0B0E14; table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 15px;">
                <!-- Main Container -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #121722; border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 40px 30px 20px 30px; background: linear-gradient(180deg, #1A2130 0%, #121722 100%); border-bottom: 1px solid rgba(212, 175, 55, 0.15);">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <div style="display: inline-block; width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #D4AF37; line-height: 44px; text-align: center; color: #D4AF37; font-size: 20px; font-weight: bold; font-family: Georgia, serif; background: rgba(212, 175, 55, 0.08);">
                                            K
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 15px;">
                                        <h1 style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 24px; font-weight: 700; color: #D4AF37; letter-spacing: 4px; text-transform: uppercase;">
                                            KHALIYA SANCTUARY
                                        </h1>
                                        <p style="margin: 4px 0 0 0; font-size: 11px; color: #8A94A6; letter-spacing: 2px; text-transform: uppercase;">
                                            FINE DINING &amp; CULINARY HAVEN
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 35px 35px 30px 35px; color: #E2E8F0;">
                            ${contentHtml}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 25px 30px; background-color: #0E121B; border-top: 1px solid rgba(255,255,255,0.05); color: #64748B; font-size: 12px; line-height: 1.6;">
                            <p style="margin: 0 0 8px 0; color: #94A3B8; font-weight: 500;">
                                Khaliya Luxury Restaurant &bull; Exclusive Dining Experience
                            </p>
                            <p style="margin: 0;">
                                If you have any inquiries, contact us at <a href="mailto:support@khaliya.com" style="color: #D4AF37; text-decoration: none;">support@khaliya.com</a>
                            </p>
                            <p style="margin: 12px 0 0 0; font-size: 11px; color: #475569;">
                                &copy; ${new Date().getFullYear()} Khaliya Sanctuary. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * 1. OTP Authentication Verification Code Email Template
 */
const getOtpEmailTemplate = ({ otp, email = '' }) => {
    const title = 'Your Access Verification Code - Khaliya Sanctuary';
    const previewText = `Your exclusive login verification code is ${otp}. Valid for 5 minutes.`;
    
    const contentHtml = `
        <div style="text-align: center; padding: 10px 0 20px 0;">
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.3); color: #D4AF37; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                Security Verification
            </span>
        </div>

        <h2 style="margin: 0 0 15px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 22px; color: #FFFFFF; text-align: center; font-weight: 500;">
            Authentication Required
        </h2>

        <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #94A3B8; text-align: center;">
            Welcome back to <strong style="color: #E2E8F0;">Khaliya Sanctuary</strong>. Use the single-use security key below to verify your access.
        </p>

        <!-- OTP Code Box -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0;">
            <tr>
                <td align="center">
                    <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(18, 23, 34, 0.9) 100%); border: 1.5px solid #D4AF37; border-radius: 16px; padding: 25px 30px; display: inline-block; box-shadow: 0 8px 25px rgba(212, 175, 55, 0.15);">
                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: bold; color: #FFD700; letter-spacing: 12px; text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);">
                            ${otp}
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 25px; background: rgba(255, 255, 255, 0.03); border-radius: 12px; padding: 15px;">
            <tr>
                <td align="center" style="font-size: 13px; color: #64748B;">
                    <span style="color: #D4AF37;">&#9201;</span> Code expires in <strong style="color: #E2E8F0;">5 minutes</strong>. Do not share this passkey with anyone.
                </td>
            </tr>
        </table>
    `;

    return {
        subject: `Your Khaliya Verification Code: ${otp}`,
        text: `Your Khaliya Sanctuary verification code is: ${otp}. Valid for 5 minutes.`,
        html: renderBaseLayout({ title, previewText, contentHtml })
    };
};

/**
 * 2. Table Reservation Confirmation Email Template
 */
const getBookingEmailTemplate = ({ booking = {} }) => {
    const title = 'Reservation Confirmed - Khaliya Sanctuary';
    const guestName = booking.name || 'Valued Guest';
    const bookingId = booking.id ? `KS-${booking.id.slice(-6).toUpperCase()}` : 'KS-RESERVATION';
    const previewText = `Dear ${guestName}, your table reservation for ${booking.guests || 2} guest(s) on ${booking.date || 'upcoming date'} is confirmed.`;

    const contentHtml = `
        <div style="text-align: center; padding: 10px 0 20px 0;">
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ADE80; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                &#10003; Reservation Confirmed
            </span>
        </div>

        <h2 style="margin: 0 0 10px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 24px; color: #FFFFFF; text-align: center; font-weight: 500;">
            We Look Forward to Welcoming You
        </h2>

        <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #94A3B8; text-align: center;">
            Dear <strong style="color: #D4AF37;">${guestName}</strong>, your table reservation at Khaliya Sanctuary has been successfully confirmed.
        </p>

        <!-- Booking Details Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; margin: 20px 0; border-collapse: separate; border-spacing: 0;">
            <tr>
                <td style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #8A94A6; font-size: 13px;">Booking Ref:</td>
                <td align="right" style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #D4AF37; font-weight: bold; font-size: 14px; font-family: monospace;">${bookingId}</td>
            </tr>
            <tr>
                <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #8A94A6; font-size: 13px;">Date:</td>
                <td align="right" style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #FFFFFF; font-weight: 600; font-size: 14px;">${booking.date || 'TBD'}</td>
            </tr>
            <tr>
                <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #8A94A6; font-size: 13px;">Time Slot:</td>
                <td align="right" style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #FFFFFF; font-weight: 600; font-size: 14px;">${booking.time || 'TBD'}</td>
            </tr>
            <tr>
                <td style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #8A94A6; font-size: 13px;">Party Size:</td>
                <td align="right" style="padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #FFFFFF; font-weight: 600; font-size: 14px;">${booking.guests || 2} Guest(s)</td>
            </tr>
            <tr>
                <td style="padding: 14px 20px; color: #8A94A6; font-size: 13px;">Seating Preference:</td>
                <td align="right" style="padding: 14px 20px; color: #D4AF37; font-weight: 500; font-size: 14px;">${booking.tableType || 'Standard Dining'}</td>
            </tr>
        </table>

        ${booking.specialRequests ? `
        <div style="background: rgba(212, 175, 55, 0.08); border-left: 3px solid #D4AF37; padding: 14px 18px; border-radius: 0 10px 10px 0; margin: 20px 0;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #D4AF37; font-weight: bold; margin-bottom: 4px;">Special Requests</div>
            <div style="font-size: 13px; color: #CBD5E1; font-style: italic;">"${booking.specialRequests}"</div>
        </div>` : ''}

        <p style="margin: 25px 0 0 0; font-size: 13px; color: #64748B; text-align: center; line-height: 1.5;">
            * Please arrive 5-10 minutes prior to your time slot. If your plans change, kindly notify us at least 2 hours in advance.
        </p>
    `;

    return {
        subject: `Table Reservation Confirmed - Khaliya Sanctuary (${bookingId})`,
        text: `Dear ${guestName},\n\nYour table reservation at Khaliya Sanctuary is confirmed for ${booking.date} at ${booking.time} (${booking.guests} guests).\n\nThank you for choosing Khaliya Sanctuary!`,
        html: renderBaseLayout({ title, previewText, contentHtml })
    };
};

/**
 * 3. Order Bill / Digital Receipt Email Template
 */
const getBillReceiptEmailTemplate = ({ order = {}, bill = {} }) => {
    const title = 'Your Dining Receipt - Khaliya Sanctuary';
    const guestName = order.customerName || bill.customerName || 'Valued Guest';
    const invoiceNo = bill.billId || order.id || `INV-${Date.now().toString().slice(-6)}`;
    const items = order.items || bill.items || [];
    const grandTotal = bill.grandTotal || order.grandTotal || bill.total || 0;
    const previewText = `Thank you for dining with us! Here is your digital receipt ${invoiceNo} totaling ₹${grandTotal}.`;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #E2E8F0; font-size: 14px;">
                ${item.name || item.title}
                <div style="font-size: 11px; color: #64748B;">Qty: ${item.quantity || item.qty || 1} &times; ₹${item.price || 0}</div>
            </td>
            <td align="right" style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #FFFFFF; font-weight: 500; font-size: 14px;">
                ₹${((item.quantity || item.qty || 1) * (item.price || 0)).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const contentHtml = `
        <div style="text-align: center; padding: 10px 0 20px 0;">
            <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.3); color: #D4AF37; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
                Digital Tax Invoice
            </span>
        </div>

        <h2 style="margin: 0 0 10px 0; font-family: 'Times New Roman', Georgia, serif; font-size: 24px; color: #FFFFFF; text-align: center; font-weight: 500;">
            Thank You For Dining With Us
        </h2>

        <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #94A3B8; text-align: center;">
            Dear <strong style="color: #E2E8F0;">${guestName}</strong>, here is your itemized receipt for your recent visit to Khaliya Sanctuary.
        </p>

        <!-- Receipt Box -->
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; padding: 25px; margin: 20px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 15px;">
                <tr>
                    <td style="color: #64748B; font-size: 12px;">Invoice #: <strong style="color: #D4AF37; font-family: monospace;">${invoiceNo}</strong></td>
                    <td align="right" style="color: #64748B; font-size: 12px;">Date: <strong style="color: #E2E8F0;">${new Date().toLocaleDateString()}</strong></td>
                </tr>
            </table>

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                ${itemsHtml}
            </table>

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; border-top: 1.5px solid #D4AF37; padding-top: 15px;">
                <tr>
                    <td style="color: #D4AF37; font-size: 16px; font-weight: bold; font-family: 'Times New Roman', Georgia, serif;">Grand Total Paid</td>
                    <td align="right" style="color: #FFD700; font-size: 22px; font-weight: bold;">₹${Number(grandTotal).toFixed(2)}</td>
                </tr>
            </table>
        </div>
    `;

    return {
        subject: `Your Receipt from Khaliya Sanctuary (${invoiceNo})`,
        text: `Dear ${guestName},\n\nThank you for dining at Khaliya Sanctuary!\nInvoice No: ${invoiceNo}\nTotal Amount Paid: ₹${grandTotal}`,
        html: renderBaseLayout({ title, previewText, contentHtml })
    };
};

module.exports = {
    renderBaseLayout,
    getOtpEmailTemplate,
    getBookingEmailTemplate,
    getBillReceiptEmailTemplate
};
