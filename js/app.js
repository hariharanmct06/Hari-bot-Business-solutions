document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // Preloader (Loading Screen) Handler
    // ==========================================
    const preloader = document.getElementById('preloader');
    const preloaderSubtitle = document.getElementById('preloaderSubtitle');
    
    const preloaderStatuses = [
        "Connecting to core systems...",
        "Igniting rocket boosters...",
        "Launching Hari Bot & Business Solutions..."
    ];
    let preloaderStatusIndex = 0;
    
    // Cycle preloader status subtitles
    const preloaderStatusInterval = setInterval(() => {
        preloaderStatusIndex = (preloaderStatusIndex + 1) % preloaderStatuses.length;
        if (preloaderSubtitle) {
            preloaderSubtitle.textContent = preloaderStatuses[preloaderStatusIndex];
        }
    }, 1200);
    
    // Auto-remove preloader after 5.0s (maximum)
    setTimeout(() => {
        clearInterval(preloaderStatusInterval);
        if (preloader) {
            preloader.classList.add('fade-out');
        }
        document.body.classList.remove('loading');
        
        // Fully remove from document flow after fade-out transition completes (800ms)
        setTimeout(() => {
            if (preloader) {
                preloader.style.display = 'none';
            }
            
            // Auto-trigger login modal on entrance if no active session exists
            const session = localStorage.getItem('haribot_session');
            if (!session) {
                showLoginModal();
            }
        }, 800);
    }, 4200); // 4.2s launch animation + 800ms fadeout = 5.0s total

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
  - Official Website: https://hari-bot-business-solutions.vercel.app/ (This is our only website. Note that we do NOT have any .com domain, only this Vercel URL)
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

    // ==========================================
    // 6. Visitor Authentication & Login System
    // ==========================================
    const loginModal = document.getElementById('loginModal');
    const passwordModal = document.getElementById('passwordModal');
    
    // Navbar controls (Desktop)
    const navLoginBtn = document.getElementById('navLoginBtn');
    const userProfileMenu = document.getElementById('userProfileMenu');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const navLogoutBtn = document.getElementById('navLogoutBtn');
    
    // Navbar controls (Mobile)
    const navLoginBtnMobile = document.getElementById('navLoginBtnMobile');
    const userProfileMenuMobile = document.getElementById('userProfileMenuMobile');
    const userNameDisplayMobile = document.getElementById('userNameDisplayMobile');
    const navLogoutBtnMobile = document.getElementById('navLogoutBtnMobile');
    
    // Close controls
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closePasswordModal = document.getElementById('closePasswordModal');
    
    // Steps
    const authFormStep1 = document.getElementById('authFormStep1');
    const authFormStep2 = document.getElementById('authFormStep2');
    const btnBackToStep1 = document.getElementById('btnBackToStep1');
    
    // Inputs step 1
    const authName = document.getElementById('authName');
    const authContact = document.getElementById('authContact');
    
    // Inputs step 2
    const authOtp = document.getElementById('authOtp');
    const authPassword = document.getElementById('authPassword');
    const simulatedOtpCode = document.getElementById('simulatedOtpCode');
    
    // Alt Auth buttons
    const btnGoogleLogin = document.getElementById('btnGoogleLogin');
    const btnGuestLogin = document.getElementById('btnGuestLogin');
    
    // Password Form
    const passwordManageForm = document.getElementById('passwordManageForm');
    const newProfilePassword = document.getElementById('newProfilePassword');
    const confirmProfilePassword = document.getElementById('confirmProfilePassword');
    const passwordFeedback = document.getElementById('passwordFeedback');
    
    // Global simulated state
    let tempUserData = {};
    let generatedOtp = '';
    
    // Initialize UI on page load
    updateAuthUI();
    
    // Open Login Modal
    if (navLoginBtn) navLoginBtn.addEventListener('click', () => showLoginModal());
    if (navLoginBtnMobile) navLoginBtnMobile.addEventListener('click', () => showLoginModal());
    
    // Close Modals
    if (closeLoginModal) closeLoginModal.addEventListener('click', () => hideLoginModal());
    if (closePasswordModal) closePasswordModal.addEventListener('click', () => hidePasswordModal());
    
    // Close modals on clicking overlay background
    [loginModal, passwordModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    });

    function showLoginModal() {
        // Reset forms
        if (authFormStep1) authFormStep1.reset();
        if (authFormStep2) authFormStep2.reset();
        if (authFormStep1) authFormStep1.style.display = 'block';
        if (authFormStep2) authFormStep2.style.display = 'none';
        generatedOtp = '';
        tempUserData = {};
        if (loginModal) loginModal.classList.add('active');
    }
    
    function hideLoginModal() {
        if (loginModal) loginModal.classList.remove('active');
    }
    
    function showPasswordModal() {
        if (passwordManageForm) passwordManageForm.reset();
        if (passwordFeedback) {
            passwordFeedback.style.display = 'none';
            passwordFeedback.textContent = '';
        }
        
        // Show current status if password exists
        const session = JSON.parse(localStorage.getItem('haribot_session'));
        const modalTitle = document.getElementById('passwordModalTitle');
        if (session && session.password && modalTitle) {
            modalTitle.textContent = "Change your current session password";
        } else if (modalTitle) {
            modalTitle.textContent = "Set a password for your account";
        }
        
        if (passwordModal) passwordModal.classList.add('active');
    }
    
    function hidePasswordModal() {
        if (passwordModal) passwordModal.classList.remove('active');
    }
    
    // Step 1 Submit: Generate mock OTP
    if (authFormStep1) {
        authFormStep1.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = authName.value.trim();
            const contact = authContact.value.trim();
            
            if (name && contact) {
                // Generate a random 6-digit OTP code
                generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
                simulatedOtpCode.textContent = generatedOtp;
                
                tempUserData = {
                    name: name,
                    contact: contact,
                    method: contact.includes('@') ? 'Email OTP' : 'Phone OTP'
                };
                
                // Transition to Step 2
                authFormStep1.style.display = 'none';
                authFormStep2.style.display = 'block';
            }
        });
    }
    
    // Back Button in Step 2
    if (btnBackToStep1) {
        btnBackToStep1.addEventListener('click', () => {
            authFormStep2.style.display = 'none';
            authFormStep1.style.display = 'block';
            generatedOtp = '';
        });
    }
    
    // Step 2 Submit: Verify OTP & set password
    if (authFormStep2) {
        authFormStep2.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const otpVal = authOtp.value.trim();
            const passwordVal = authPassword.value.trim();
            
            if (otpVal !== generatedOtp) {
                alert('Invalid verification code. Please check the simulated OTP notice box.');
                return;
            }
            
            // Save user session
            const userSession = {
                name: tempUserData.name,
                contact: tempUserData.contact,
                method: tempUserData.method,
                password: passwordVal || null,
                isGuest: false
            };
            
            completeLogin(userSession);
        });
    }
    
    // Guest Login Flow
    if (btnGuestLogin) {
        btnGuestLogin.addEventListener('click', () => {
            const userSession = {
                name: 'Guest',
                contact: 'N/A',
                method: 'Guest Session',
                password: null,
                isGuest: true
            };
            completeLogin(userSession);
        });
    }
    
    // Mock Google Login Flow
    if (btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', () => {
            btnGoogleLogin.disabled = true;
            const originalText = btnGoogleLogin.innerHTML;
            btnGoogleLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting to Google...';
            
            // Simulate OAuth Popup
            const w = 480, h = 540;
            const left = (screen.width/2)-(w/2);
            const top = (screen.height/2)-(h/2);
            const popup = window.open("", "Google Login", `width=${w},height=${h},top=${top},left=${left}`);
            
            if (popup) {
                popup.document.write(`
                    <html>
                    <head>
                        <title>Sign in - Google Accounts</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <style>
                            body { font-family: Roboto, Arial, sans-serif; background: #fff; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; color: #3c4043; }
                            .card { border: 1px solid #dadce0; border-radius: 8px; padding: 40px; width: 320px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                            .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                            .g { color: #4285F4; } .o1 { color: #EA4335; } .o2 { color: #FBBC05; } .g2 { color: #4285F4; } .l { color: #34A853; } .e { color: #EA4335; }
                            h2 { font-size: 22px; font-weight: 400; margin-bottom: 8px; }
                            p { font-size: 14px; color: #5f6368; margin-bottom: 24px; }
                            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 28px; height: 28px; animation: spin 0.8s linear infinite; margin: 0 auto 20px auto; }
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <div class="logo"><span class="g">G</span><span class="o1">o</span><span class="o2">o</span><span class="g2">g</span><span class="l">l</span><span class="e">e</span></div>
                            <h2>Sign in with Google</h2>
                            <p>to continue to Hari Bot & Business Solutions</p>
                            <div class="loader"></div>
                            <div style="font-size: 13px; color: #70757a;">Connecting securely...</div>
                        </div>
                    </body>
                    </html>
                `);
                
                setTimeout(() => {
                    popup.close();
                    
                    const googleNames = ["Hari S", "Aravind Kumar", "Vijay Raj", "Divya M", "Subash P", "Preeti K"];
                    const randomName = googleNames[Math.floor(Math.random() * googleNames.length)];
                    const randomEmail = `${randomName.toLowerCase().replace(" ", "")}@gmail.com`;
                    
                    const userSession = {
                        name: randomName,
                        contact: randomEmail,
                        method: 'Google Authentication',
                        password: null,
                        isGuest: false
                    };
                    
                    btnGoogleLogin.disabled = false;
                    btnGoogleLogin.innerHTML = originalText;
                    
                    completeLogin(userSession);
                }, 2000);
            } else {
                alert('Pop-up blocked! Please allow pop-ups to log in with Google.');
                btnGoogleLogin.disabled = false;
                btnGoogleLogin.innerHTML = originalText;
            }
        });
    }
    
    // Complete Login: Save, Notify backend, update UI
    async function completeLogin(session) {
        localStorage.setItem('haribot_session', JSON.stringify(session));
        hideLoginModal();
        updateAuthUI();
        
        // Show welcome popup
        alert(`Welcome, ${session.name}! Session initialized successfully.`);
        
        // Send email notification to backend API
        try {
            await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: session.name,
                    contact: session.contact,
                    method: session.method,
                    hasPassword: !!session.password
                })
            });
        } catch (err) {
            console.error('Error triggering login notification:', err);
        }
    }
    
    // Sign Out Flow
    function handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('haribot_session');
            updateAuthUI();
            alert('Signed out successfully.');
        }
    }
    
    if (navLogoutBtn) navLogoutBtn.addEventListener('click', handleLogout);
    if (navLogoutBtnMobile) navLogoutBtnMobile.addEventListener('click', handleLogout);
    
    // Profile Reset / Password Change Modals
    if (userNameDisplay) userNameDisplay.addEventListener('click', () => showPasswordModal());
    if (userNameDisplayMobile) userNameDisplayMobile.addEventListener('click', () => showPasswordModal());
    
    // Submit Password Management Form
    if (passwordManageForm) {
        passwordManageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newPass = newProfilePassword.value;
            const confirmPass = confirmProfilePassword.value;
            
            if (newPass !== confirmPass) {
                showPasswordFeedback('Passwords do not match.', 'error');
                return;
            }
            
            // Save password in active session
            const session = JSON.parse(localStorage.getItem('haribot_session'));
            if (session) {
                session.password = newPass;
                localStorage.setItem('haribot_session', JSON.stringify(session));
                showPasswordFeedback('Password updated successfully! This will secure your next login.', 'success');
                
                // Hide modal after delay
                setTimeout(() => {
                    hidePasswordModal();
                }, 1500);
            }
        });
    }
    
    function showPasswordFeedback(msg, type) {
        if (passwordFeedback) {
            passwordFeedback.className = `password-feedback ${type}`;
            passwordFeedback.textContent = msg;
            passwordFeedback.style.display = 'block';
        }
    }
    
    // Update navbar indicators based on localStorage
    function updateAuthUI() {
        const session = JSON.parse(localStorage.getItem('haribot_session'));
        
        if (session) {
            // Hide login buttons
            if (navLoginBtn) navLoginBtn.style.display = 'none';
            if (navLoginBtnMobile) navLoginBtnMobile.style.display = 'none';
            
            // Show profile menu
            if (userProfileMenu) userProfileMenu.style.display = 'flex';
            if (userProfileMenuMobile) userProfileMenuMobile.style.display = 'flex';
            
            // Display visitor name
            const displayName = session.isGuest ? 'Guest' : session.name.split(' ')[0];
            if (userNameDisplay) userNameDisplay.textContent = displayName;
            if (userNameDisplayMobile) userNameDisplayMobile.textContent = displayName;
        } else {
            // Show login buttons
            if (navLoginBtn) navLoginBtn.style.display = 'flex';
            if (navLoginBtnMobile) navLoginBtnMobile.style.display = 'flex';
            
            // Hide profile menu
            if (userProfileMenu) userProfileMenu.style.display = 'none';
            if (userProfileMenuMobile) userProfileMenuMobile.style.display = 'none';
        }
    }
});
