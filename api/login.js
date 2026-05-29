const nodemailer = require('nodemailer');

const sendJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        sendJSON(res, 405, { error: 'Method not allowed' });
        return;
    }

    // Extract payload details
    let action, name, contact, method, hasPassword, otp;
    try {
        let payload;
        if (req.body && typeof req.body === 'object') {
            payload = req.body;
        } else {
            let rawBody = '';
            await new Promise((resolve, reject) => {
                req.on('data', chunk => { rawBody += chunk; });
                req.on('end', () => {
                    try {
                        if (rawBody) {
                            payload = JSON.parse(rawBody);
                        }
                        resolve();
                    } catch (e) {
                        reject(new Error('Invalid JSON payload: ' + e.message));
                    }
                });
                req.on('error', err => reject(err));
            });
        }
        
        if (payload) {
            action = payload.action;
            name = payload.name;
            contact = payload.contact;
            method = payload.method;
            hasPassword = payload.hasPassword;
            otp = payload.otp;
        }
    } catch (err) {
        sendJSON(res, 400, { error: 'Body parsing failed: ' + err.message });
        return;
    }

    // Check for SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // ACTION: Send OTP directly to visitor
    if (action === 'send-otp') {
        const isEmail = contact && contact.includes('@');
        if (!isEmail) {
            // Return success directly for phone numbers (simulated SMS)
            sendJSON(res, 200, { success: true, message: 'OTP simulated successfully (phone contact)' });
            return;
        }

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.warn('SMTP settings missing. Mock-sending 4-digit OTP code to email:', contact, 'Code:', otp);
            sendJSON(res, 200, { success: true, message: 'OTP Mock-Sent (SMTP not configured)', mockSent: true });
            return;
        }

        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(smtpPort),
                secure: smtpPort === '465',
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            const mailOptions = {
                from: `"Hari Bot System" <${smtpUser}>`,
                to: contact,
                subject: `Hari Bot Verification Code: ${otp}`,
                text: `Hello ${name || 'Visitor'},\n\nYour 4-digit verification code for Hari Bot & Business Solutions is: ${otp}\n\nThis code is valid for 10 minutes.`,
                html: `<div style="background-color: #0b0f19; color: #f8fafc; padding: 24px; font-family: sans-serif; border-radius: 8px; max-width: 480px; margin: 0 auto; border: 1.5px solid #d4af37;">
                    <h2 style="color: #3b82f6; font-size: 1.4rem; margin-top: 0; text-align: center;">Verification Code 🔑</h2>
                    <p>Hello <strong>${name || 'Visitor'}</strong>,</p>
                    <p>Use the following 4-digit OTP to verify your email address on <strong>Hari Bot & Business Solutions</strong>:</p>
                    <div style="background-color: #070a13; padding: 20px; text-align: center; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin: 24px 0;">
                        <span style="font-size: 2.2rem; font-weight: 800; color: #d4af37; letter-spacing: 6px; font-family: monospace;">${otp}</span>
                    </div>
                    <p style="color: #64748b; font-size: 0.85rem;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
                    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;">
                    <p style="color: #64748b; font-size: 0.8rem; text-align: center; margin-bottom: 0;">Powered by Hari Bot & Business Solutions</p>
                </div>`
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`Verification OTP ${otp} sent successfully to ${contact}:`, info.messageId);
            sendJSON(res, 200, { success: true, message: 'Verification OTP sent to email', messageId: info.messageId });
        } catch (err) {
            console.error('Error sending verification OTP email:', err);
            sendJSON(res, 500, { error: 'Failed to send verification code email: ' + err.message });
        }
        return;
    }

    // ACTION: Notify founder of a new visitor login (default)
    name = name || 'Unknown Visitor';
    contact = contact || 'N/A';
    method = method || 'Guest Access';
    hasPassword = hasPassword !== undefined ? (hasPassword ? 'Yes' : 'No') : 'No';
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    // Format visitor details as a bold WhatsApp message layout
    const formattedMessage = `*New Visitor Logged In!*
*Name:* ${name}
*Contact:* ${contact}
*Method:* ${method}
*Password Set:* ${hasPassword}
*Timestamp:* ${timestamp} (IST)`;

    if (!smtpHost || !smtpUser || !smtpPass) {
        // Fallback: log to Vercel and return success mock
        console.warn('SMTP Environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured in Vercel. Logging visitor data to server stdout instead.');
        console.log('--- MOCK WHATSAPP MESSAGE SENT TO EMAIL ---');
        console.log(formattedMessage);
        console.log('-------------------------------------------');
        
        sendJSON(res, 200, { 
            success: true, 
            message: 'Login logged on server (SMTP mock state)', 
            data: {
                name,
                contact,
                method,
                timestamp
            }
        });
        return;
    }

    // Send email using nodemailer
    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort === '465', // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: `"Hari Bot System" <${smtpUser}>`,
            to: 'haribotbusinesssolutions@gmail.com',
            subject: `[Hari Bot Log] New Login Alert - ${name}`,
            text: formattedMessage,
            html: `<div style="background-color: #0b0f19; color: #f8fafc; padding: 24px; font-family: sans-serif; border-radius: 8px; max-width: 480px; margin: 0 auto; border: 1.5px solid #d4af37;">
                <h2 style="color: #3b82f6; font-size: 1.5rem; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">New Visitor Alert 🚀</h2>
                <div style="background-color: #070a13; padding: 16px; border-radius: 6px; font-family: monospace; line-height: 1.6; border-left: 3px solid #d4af37; white-space: pre-wrap; font-size: 0.95rem;">
<strong>*New Visitor Logged In!*</strong>
<strong>*Name:*</strong> ${name}
<strong>*Contact:*</strong> ${contact}
<strong>*Method:*</strong> ${method}
<strong>*Password Set:*</strong> ${hasPassword}
<strong>*Timestamp:*</strong> ${timestamp} (IST)
                </div>
                <p style="color: #64748b; font-size: 0.8rem; text-align: center; margin-top: 20px; margin-bottom: 0;">Powered by Hari Bot & Business Solutions</p>
            </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Login email notification sent successfully:', info.messageId);

        sendJSON(res, 200, { 
            success: true, 
            messageId: info.messageId 
        });
    } catch (err) {
        console.error('Error sending login email notification:', err);
        sendJSON(res, 500, { 
            error: 'Failed to send email notification: ' + err.message 
        });
    }
};
