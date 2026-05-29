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
    let name, contact, method, hasPassword;
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
            name = payload.name;
            contact = payload.contact;
            method = payload.method;
            hasPassword = payload.hasPassword;
        }
    } catch (err) {
        sendJSON(res, 400, { error: 'Body parsing failed: ' + err.message });
        return;
    }

    // Default fallbacks if empty
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

    // Check for Vercel environment SMTP settings
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

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
