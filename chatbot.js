// Chatbot JavaScript with Gemini API Integration - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatbotBtn = document.getElementById('chatbot-btn');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    
    // Chatbot State
    let isChatOpen = false;
    let conversationHistory = [];
    let isProcessing = false;
    
    // 🌟 API CONFIG - Sử dụng đúng endpoint 🌟
    const GEMINI_API_KEY = 'AIzaSyAyHUhtIXXbg3XSR7Rs2_n8v9waFiqf774';
    
    // Restaurant information for AI context
    const restaurantContext = `Bạn là trợ lý ảo của JC RESTAURANT Hà Nội. 
    Trả lời ngắn gọn, thân thiện bằng tiếng Việt.
    
    THÔNG TIN NHÀ HÀNG:
    - Tên: JC RESTAURANT
    - Địa chỉ: 143 Nguyễn Chính, Hoàng Mai, Hà Nội
    - Điện thoại: 0987 724 041
    - Email: jcrestaurant@gmail.com
    - Giờ mở cửa: 10:00 - 22:00 hàng ngày
    - Chuyên: Ẩm thực Âu cao cấp
    
    TRẢ LỜI THEO CÁCH TỰ NHIÊN NHƯ CON NGƯỜI.`;
    
    // Initialize chatbot
    initChatbot();
    
    function initChatbot() {
        // Event Listeners
        chatbotBtn.addEventListener('click', toggleChatWindow);
        chatCloseBtn.addEventListener('click', closeChatWindow);
        chatSendBtn.addEventListener('click', handleSendMessage);
        
        // Enter key to send
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
        
        // Suggestion buttons
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const question = this.getAttribute('data-question');
                chatInput.value = question;
                handleSendMessage();
            });
        });
        
        // Auto-open chat on first visit
        setTimeout(() => {
            if (!localStorage.getItem('chatOpened') && !isChatOpen) {
                toggleChatWindow();
                showWelcomeMessage();
                localStorage.setItem('chatOpened', 'true');
            }
        }, 2000);
    }
    
    function toggleChatWindow() {
        isChatOpen = !isChatOpen;
        chatbotWindow.classList.toggle('active', isChatOpen);
        
        if (isChatOpen) {
            setTimeout(() => chatInput.focus(), 100);
            if (chatMessages.children.length === 0) {
                showWelcomeMessage();
            }
        }
    }
    
    function closeChatWindow() {
        isChatOpen = false;
        chatbotWindow.classList.remove('active');
    }
    
    function handleSendMessage() {
        if (isProcessing) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Display user message
        addMessageToChat(message, 'user');
        chatInput.value = '';
        
        // Show thinking indicator
        const thinkingId = showThinkingIndicator();
        
        // Process the message
        processUserMessage(message, thinkingId);
    }
    
    function addMessageToChat(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-text">${escapeHtml(text)}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        
        // Save to history
        saveMessageToHistory(text, sender);
    }
    
    function showThinkingIndicator() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message bot thinking';
        thinkingDiv.id = 'thinking-' + Date.now();
        
        thinkingDiv.innerHTML = `
            <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="thinking-text">Trợ lý AI đang suy nghĩ...</div>
        `;
        
        chatMessages.appendChild(thinkingDiv);
        scrollToBottom();
        
        return thinkingDiv.id;
    }
    
    function removeThinkingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }
    
    async function processUserMessage(userMessage, thinkingId) {
        isProcessing = true;
        
        try {
            // Phương án 1: Gọi Gemini API
            const aiResponse = await callGeminiAPI(userMessage);
            
            // Remove thinking indicator
            removeThinkingIndicator(thinkingId);
            
            // Display AI response
            addMessageToChat(aiResponse, 'bot');
            
        } catch (error) {
            console.error('Error:', error);
            
            // Remove thinking indicator
            removeThinkingIndicator(thinkingId);
            
            // Phương án 2: Fallback to intelligent response
            const fallbackResponse = generateSmartResponse(userMessage);
            addMessageToChat(fallbackResponse, 'bot');
        }
        
        isProcessing = false;
    }
    
    async function callGeminiAPI(userMessage) {
        try {
            // 🌟 ĐÂY LÀ CÁCH ĐÚNG ĐỂ GỌI GEMINI API 🌟
            const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
            
            const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${restaurantContext}\n\nKhách hàng hỏi: "${userMessage}"\n\nTrợ lý AI trả lời:`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 500,
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Extract response text
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text.trim();
            } else {
                throw new Error('Invalid API response');
            }
            
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error; // Re-throw để fallback xử lý
        }
    }
    
    function generateSmartResponse(userMessage) {
        const message = userMessage.toLowerCase().trim();
        
        // Smart responses based on keywords
        if (message.includes('chào') || message.includes('hello') || message.includes('hi')) {
            return "Xin chào quý khách! Rất vui được chào đón bạn đến với JC RESTAURANT. Tôi có thể giúp gì cho bạn hôm nay?";
        }
        
        if (message.includes('giờ mở cửa') || message.includes('mấy giờ mở')) {
            return "JC RESTAURANT mở cửa từ 10:00 sáng đến 22:00 tối tất cả các ngày trong tuần, kể cả ngày lễ. Rất mong được đón tiếp quý khách!";
        }
        
        if (message.includes('địa chỉ') || message.includes('ở đâu')) {
            return "Nhà hàng chúng tôi tọa lạc tại: 143 Nguyễn Chính, Hoàng Mai, Hà Nội. Có chỗ đỗ xe rộng rãi và rất dễ tìm!";
        }
        
        if (message.includes('đặt bàn') || message.includes('booking')) {
            return "Quý khách có thể đặt bàn qua:\n1. Website: Sử dụng form đặt bàn trên trang\n2. Hotline: 0987 724 041\n3. Đến trực tiếp nhà hàng\nVui lòng cho biết số người và thời gian mong muốn!";
        }
        
        if (message.includes('menu') || message.includes('thực đơn') || message.includes('giá')) {
            return "JC RESTAURANT có các set menu:\n• 2 người: 2.500.000 VNĐ\n• 4 người: 4.800.000 VNĐ\n• 6 người: 6.900.000 VNĐ\n• 8 người: 8.800.000 VNĐ\nCùng nhiều món à la carte hấp dẫn khác!";
        }
        
        if (message.includes('đặc biệt') || message.includes('best seller')) {
            return "Các món best seller của chúng tôi:\n• Bò Wellington\n• Cá Hồi Sốt Chanh\n• Pasta Hải Sản\n• Tomahawk Steak\nTất cả đều được chế biến từ nguyên liệu cao cấp!";
        }
        
        if (message.includes('cảm ơn') || message.includes('thanks')) {
            return "Cảm ơn quý khách! Rất hân hạnh được phục vụ. Chúc bạn một ngày tốt lành!";
        }
        
        // Default response for unknown questions
        return `Cảm ơn câu hỏi của bạn! 
        
Về "${userMessage}", tại JC RESTAURANT chúng tôi chuyên về ẩm thực Âu cao cấp với:
• Không gian sang trọng
• Nguyên liệu nhập khẩu
• Đầu bếp giàu kinh nghiệm

Bạn muốn biết thêm về:
1. Thông tin nhà hàng
2. Menu và giá cả
3. Đặt bàn
4. Dịch vụ tiệc

Tôi có thể giúp gì thêm cho bạn?`;
    }
    
    function showWelcomeMessage() {
        const welcomeMsg = `👋 **Chào mừng đến với JC RESTAURANT!**
        
Tôi là trợ lý AI của nhà hàng. Tôi có thể giúp bạn:

📌 **Thông tin nhà hàng:**
• Địa chỉ: 143 Nguyễn Chính, Hoàng Mai, Hà Nội
• Giờ mở cửa: 10:00 - 22:00 hàng ngày
• Hotline: 0987 724 041

🍽️ **Đặt bàn & Menu:**
• Set menu 2-8 người
• Món Âu cao cấp
• Setup tiệc theo yêu cầu

Bạn cần hỗ trợ gì ạ?`;

        addMessageToChat(welcomeMsg, 'bot');
    }
    
    function saveMessageToHistory(text, sender) {
        conversationHistory.push({
            text: text,
            sender: sender,
            time: new Date().toISOString()
        });
        
        // Keep only last 10 conversations
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
        
        // Save to localStorage
        localStorage.setItem('jcChatHistory', JSON.stringify(conversationHistory));
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

async function callGeminiViaProxy(userMessage) {
    // Sử dụng proxy CORS nếu cần
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${restaurantContext}\n\nCâu hỏi: ${userMessage}\n\nTrả lời:` }]
                }]
            })
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Proxy Error:', error);
        throw error;
    }
}