const https = require('https');

// Failsafe JSON responder using native Node.js HTTP response methods
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

    // Failsafe body extraction
    let messages;
    try {
        if (req.body && typeof req.body === 'object') {
            messages = req.body.messages;
        } else {
            // Read from raw stream if Vercel hasn't pre-parsed it
            let rawBody = '';
            await new Promise((resolve, reject) => {
                req.on('data', chunk => { rawBody += chunk; });
                req.on('end', () => {
                    try {
                        if (rawBody) {
                            const parsed = JSON.parse(rawBody);
                            messages = parsed.messages;
                        }
                        resolve();
                    } catch (e) {
                        reject(new Error('Invalid JSON payload: ' + e.message));
                    }
                });
                req.on('error', err => reject(err));
            });
        }
    } catch (err) {
        sendJSON(res, 400, { error: 'Body parsing failed: ' + err.message });
        return;
    }

    if (!messages || !Array.isArray(messages)) {
        sendJSON(res, 400, { error: 'Missing or invalid messages array in request body.' });
        return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        sendJSON(res, 500, { 
            error: 'API key is not configured in Vercel. Please add OPENROUTER_API_KEY to your Vercel project environment variables.' 
        });
        return;
    }

    const postData = JSON.stringify({
        model: "openrouter/free",
        messages: messages
    });

    const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://haribotbusinesssolutions.vercel.app',
            'X-Title': 'Hari Bot & Business Solutions',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve) => {
        const postReq = https.request(options, (postRes) => {
            let data = '';
            postRes.on('data', (chunk) => {
                data += chunk;
            });
            postRes.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (postRes.statusCode >= 200 && postRes.statusCode < 300) {
                        sendJSON(res, 200, parsedData);
                    } else {
                        let errorMsg = `Upstream error: ${postRes.statusCode}`;
                        if (parsedData.error) {
                            errorMsg = typeof parsedData.error === 'string' ? parsedData.error : (parsedData.error.message || errorMsg);
                        }
                        sendJSON(res, postRes.statusCode, { error: errorMsg });
                    }
                    resolve();
                } catch (e) {
                    sendJSON(res, 500, { error: 'Error parsing upstream response: ' + e.message });
                    resolve();
                }
            });
        });

        postReq.on('error', (err) => {
            sendJSON(res, 500, { error: 'Network error connecting to OpenRouter: ' + err.message });
            resolve();
        });

        postReq.write(postData);
        postReq.end();
    });
};
