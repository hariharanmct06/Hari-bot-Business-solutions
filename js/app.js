document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Sticky Header & Active Nav Links
    // ==========================================
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        // Sticky class
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Dynamic navigation indicator highlight
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // 2. Mobile Menu Navigation (Hamburger)
    // ==========================================
    const hamburger = document.getElementById('hamburgerMenu');
    const navLinksContainer = document.getElementById('navLinks');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });
    
    // Close menu when clicking nav items
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    // Close menu when clicking outside navbar
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinksContainer.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });

    // ==========================================
    // 3. Typewriter Effect
    // ==========================================
    const typewriterElement = document.getElementById('typewriter');
    const words = ["UI/UX Design", "Custom Websites", "AI Chatbots", "AI & Automation"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;
    
    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeDelay = 50; // Deletes faster
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeDelay = 120; // Typing speed
        }
        
        // Determine states
        if (!isDeleting && charIndex === currentWord.length) {
            typeDelay = 2000; // Pause at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeDelay = 500; // Pause before typing next word
        }
        
        setTimeout(type, typeDelay);
    }
    
    // Start typewriter if element exists
    if (typewriterElement) {
        type();
    }

    // ==========================================
    // 4. Interactive Live Chatbot (OpenRouter API Integration)
    // ==========================================
    const botMessages = document.getElementById('botMessages');
    const botChips = document.getElementById('botChips');
    const botInputForm = document.getElementById('botInputForm');
    const botInput = document.getElementById('botInput');
    
    // API Configuration
    // For local testing, paste your API key below. Keep empty ("") when pushing to GitHub to avoid leaks.
    const OPENROUTER_API_KEY = ""; 
    const OPENROUTER_MODEL = "openrouter/free";
    const SYSTEM_PROMPT = `You are Hari Bot, the AI Assistant for Hari Bot & Business Solutions, and a general-purpose AI assistant. Your goal is to answer visitor questions professionally, creatively, and helpfully.

While your primary background is representing Hari Bot & Business Solutions (founded May 24, 2026, by founder & creative director Hariharan M, a Mechatronics student at SNS), you are also a fully capable AI model. You can answer ANY questions, solve coding/math/science problems, write essays, and provide general advice, just like Google Gemini itself. When answering general queries, act as a knowledgeable AI assistant, but keep your tone professional, polite, and aligned with our tech brand.

Here is the company information:
- Company Name: Hari Bot & Business Solutions
- Founded Date: May 24, 2026
- Founder & Creative Director: Hariharan M. He is a 1st year Mechatronics Engineering student at SNS College of Technology, Coimbatore.
- Base Location: Coimbatore, Tamil Nadu, India.
- Services Provided:
  1. UI/UX Designing: Wireframes, interactive prototypes, modern visually stunning glassmorphic UI.
  2. Web Design & Development: Lightning-fast, secure, responsive corporate websites.
  3. Personalized AI Chatbots: Custom chatbots trained on company data (like this one).
  4. Task Automation using AI: Connecting apps via n8n, Python automation pipelines, saving 40+ hours/week.
- Company Contact:
  - Email: haribotbusinesssolutions@gmail.com
  - WhatsApp: +91 8838154932
  - Instagram: https://www.instagram.com/haribotandbusinesssolutions?igsh=YWptdTVvaHRmaG5x
- Founder's Contact:
  - Email: hariharanmct06@gmail.com
  - WhatsApp: +91 8667808803
  - Portfolio: https://harinew-portfolio-33.vercel.app/
  - Personalized Chatbot: https://hari-char-bot.vercel.app/
  - Instagram: https://www.instagram.com/hariharan_m06?igsh=MWE3cmFvNXF3NjFsbw==
- Philosophy: "We will do the best for a company."

Guidelines:
- Keep your answers relatively concise, professional, and matching the tone of a high-tech automation company.
- You must always format your answers in clean HTML (e.g., use <strong> for bold, <br> for new lines, <ul>/<li> for lists, and <a href="..." target="_blank" class="gold-text"> for links). Do not return markdown. Do not wrap your response in \`\`\`html code blocks.
- If asked about prices, say they are customized based on requirements and encourage them to WhatsApp the founder (+91 8667808803) or email (haribotbusinesssolutions@gmail.com) for a free quote.`;

    // Local Chat History array for conversation context (OpenAI Format)
    let chatHistory = [];

    function appendMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-msg' : 'bot-msg'}`;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        msgDiv.innerHTML = `
            <div class="msg-text">${text}</div>
            <span class="msg-time">${timeStr}</span>
        `;
        
        botMessages.appendChild(msgDiv);
        botMessages.scrollTop = botMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'botTyping';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        botMessages.appendChild(indicator);
        botMessages.scrollTop = botMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('botTyping');
        if (indicator) {
            indicator.remove();
        }
    }

    async function getOpenRouterResponse(userMessage) {
        showTypingIndicator();
        
        // Push user message to context history
        chatHistory.push({
            role: "user",
            content: userMessage
        });
        
        const messagesToSend = [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatHistory
        ];
        
        let response;
        try {
            if (!OPENROUTER_API_KEY) {
                // Secure production backend route (hides your key on Vercel)
                response = await fetch("/api/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        messages: messagesToSend
                    })
                });
            } else {
                // Direct call for local offline testing (when key is pasted locally)
                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                        "HTTP-Referer": "http://localhost:8000",
                        "X-Title": "Hari Bot & Business Solutions"
                    },
                    body: JSON.stringify({
                        model: OPENROUTER_MODEL,
                        messages: messagesToSend
                    })
                });
            }
            
            if (!response.ok) {
                let errorMsg = `HTTP error! Status: ${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData.error) {
                        errorMsg = typeof errData.error === 'string' ? errData.error : (errData.error.message || errorMsg);
                    }
                } catch (_) {}
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            removeTypingIndicator();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                let botText = data.choices[0].message.content;
                
                // Add model response to history context
                chatHistory.push({
                    role: "assistant",
                    content: botText
                });
                
                appendMessage(botText, false);
            } else {
                throw new Error("Invalid response format from OpenRouter API");
            }
            
        } catch (error) {
            console.error("OpenRouter API Error:", error);
            removeTypingIndicator();
            
            // Pop the last user query from history since it failed
            chatHistory.pop();
            
            // Offline fallback message with dynamic error details
            const fallbackReply = `Thank you for your message! 🌟 I had a temporary issue connecting to our AI server.<br>
                                  <strong>Reason</strong>: ${error.message}<br><br>
                                  Please contact us directly: Email <a href="mailto:haribotbusinesssolutions@gmail.com" class="gold-text">haribotbusinesssolutions@gmail.com</a> or WhatsApp <a href="https://wa.me/918838154932" target="_blank" class="gold-text">+91 8838154932</a>. We will do our absolute best for you!`;
            appendMessage(fallbackReply, false);
        }
    }

    // Chip click handlers
    if (botChips) {
        botChips.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip-btn')) {
                const queryText = e.target.textContent;
                appendMessage(queryText, true);
                getOpenRouterResponse(queryText);
            }
        });
    }

    // Input form handler
    if (botInputForm) {
        botInputForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userText = botInput.value.trim();
            if (userText) {
                appendMessage(userText, true);
                getOpenRouterResponse(userText);
                botInput.value = '';
            }
        });
    }    
    // ==========================================
    // 5. Contact Form Handler (Submission Simulation)
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submitBtn');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const serviceEl = document.getElementById('service');
            const serviceName = serviceEl.options[serviceEl.selectedIndex].text;
            const message = document.getElementById('message').value.trim();
            
            // UI Visual changes to loading
            submitBtn.disabled = true;
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Simulate sending payload asynchronously
            setTimeout(() => {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                
                // Show feedback
                formFeedback.className = 'form-feedback success';
                formFeedback.innerHTML = `🌟 <strong>Thank you, ${name}!</strong> Your inquiry regarding <strong>${serviceName}</strong> has been received successfully. We will reach back to you at <strong>${email}</strong> or your WhatsApp shortly. We will do the best for your company!`;
                
                // Clear Form
                contactForm.reset();
                
                // Auto scroll to feedback
                formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Fade out feedback after 10s
                setTimeout(() => {
                    formFeedback.style.display = 'none';
                }, 10000);
                
            }, 1500);
        });
    }
});
