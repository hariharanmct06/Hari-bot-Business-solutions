# Hari Bot & Business Solutions

The corporate homepage for **Hari Bot & Business Solutions** in Coimbatore, India. Built with a premium, responsive black, blue, and gold theme. Features an integrated live AI chatbot assistant using OpenRouter.

## Getting Started (Local Development)

To run the website and test the dynamic chatbot locally, follow these steps:

1. Ensure Node.js is installed.
2. Make sure you have a `.env` file in the root directory containing your API key:
   ```env
   OPENROUTER_API_KEY=your_key_here
   ```
3. Launch the server:
   ```bash
   node server.js
   ```
4. Open **http://localhost:8000** in your browser.

## Production Deployment on Vercel

The chatbot runs securely on Vercel using serverless backend functions (`/api/chat.js`) to hide your API keys from the public browser client.

### Environment Setup:
1. Connect your repository to **Vercel**.
2. Navigate to **Project Settings** ➔ **Environment Variables**.
3. Create a variable:
   - **Key**: `OPENROUTER_API_KEY`
   - **Value**: `[Your OpenRouter API Key]`
4. Trigger a deployment!
