const http = require('http');
const fs = require('fs');
const path = require('path');

// Manually parse .env variables for local runtime environment
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split(/\r?\n/).forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error('Error parsing .env configuration:', e);
}

const PORT = 8000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 1. Handle Vercel Serverless Function Proxy Locally
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { messages } = JSON.parse(body);
                const apiKey = process.env.OPENROUTER_API_KEY;
                
                if (!apiKey) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY is not defined in .env file.' }));
                }

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "http://localhost:8000",
                        "X-Title": "Hari Bot & Business Solutions (Local)"
                    },
                    body: JSON.stringify({
                        model: "openrouter/free",
                        messages: messages
                    })
                });

                if (!response.ok) {
                    let errMessage = `Upstream error: ${response.status}`;
                    try {
                        const errData = await response.json();
                        if (errData.error) {
                            errMessage = typeof errData.error === 'string' ? errData.error : (errData.error.message || errMessage);
                        }
                    } catch (_) {}
                    throw new Error(errMessage);
                }

                const data = await response.json();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (req.url === '/api/login' && req.method === 'POST') {
        const loginHandler = require('./api/login.js');
        return loginHandler(req, res);
    }

    // 2. Serve Web Page Files (HTML, CSS, JS, Images)
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Local server is running at: http://localhost:${PORT}`);
});
