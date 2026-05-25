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
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API key is not configured in Vercel. Please add OPENROUTER_API_KEY to your Vercel project environment variables.' 
        });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://haribotbusinesssolutions.vercel.app",
                "X-Title": "Hari Bot & Business Solutions"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: messages
            })
        });

        if (!response.ok) {
            let upstreamError = `Upstream error status: ${response.status}`;
            try {
                const errData = await response.json();
                if (errData.error) {
                    upstreamError = typeof errData.error === 'string' ? errData.error : (errData.error.message || upstreamError);
                }
            } catch (_) {}
            return res.status(response.status).json({ error: upstreamError });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
