// Chat.js - Frontend script for the IIT Patna FAQ Chatbot

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const suggestionChips = document.getElementById('suggestionChips');
    const mobileChatBtn = document.getElementById('mobileChatBtn');
    const toggleChatBtn = document.getElementById('toggleChatBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatContainer = document.getElementById('chatContainer');
    const infoPanel = document.getElementById('infoPanel');
    
    // Chat state
    let sessionId = generateSessionId();
    let isTyping = false;
    
    // API endpoint (update this with your actual backend URL)
    const API_URL = 'http://localhost:5000/api';
    
    // Event Listeners
    chatForm.addEventListener('submit', handleSubmit);
    
    // Handle suggestion chip clicks
    suggestionChips.addEventListener('click', function(e) {
        if (e.target.classList.contains('suggestion-chip')) {
            userInput.value = e.target.textContent;
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // Mobile UI Controls
    mobileChatBtn.addEventListener('click', toggleChat);
    toggleChatBtn.addEventListener('click', toggleChat);
    closeChatBtn.addEventListener('click', toggleChat);
    
    // Focus input field when chat is opened
    function toggleChat() {
        chatContainer.classList.toggle('hidden');
        chatContainer.classList.toggle('active');
        infoPanel.classList.toggle('hidden');
        
        if (!chatContainer.classList.contains('hidden')) {
            userInput.focus();
            // Scroll to bottom of messages
            scrollToBottom();
        }
    }
    
    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, 'user');
        
        // Clear input
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Process with Dialogflow
        processUserMessage(message);
    }
    
    // Process message through backend
    async function processUserMessage(message) {
        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    session_id: sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Remove typing indicator
            hideTypingIndicator();
            
            // Add bot response to chat
            addMessage(data.response, 'bot');
            
            // Update suggestions if provided
            if (data.suggestions && data.suggestions.length > 0) {
                updateSuggestionChips(data.suggestions);
            }
            
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
        }
    }
    
    // Add message to chat window
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('flex', 'items-start', 'chat-message-in');
        
        if (sender === 'user') {
            messageDiv.classList.add('justify-end');
            messageDiv.innerHTML = `
                <div class="user-message shadow-sm">
                    ${escapeHTML(text)}
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                    <i class="fas fa-robot text-indigo-800"></i>
                </div>
                <div class="ml-3 bot-message shadow-sm">
                    ${formatBotMessage(text)}
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (isTyping) return;
        
        isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.classList.add('flex', 'items-start', 'chat-message-in');
        typingDiv.innerHTML = `
            <div class="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                <i class="fas fa-robot text-indigo-800"></i>
            </div>
            <div class="ml-3 bg-indigo-100 py-2 px-4 rounded-lg rounded-tl-none max-w-xs">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        scrollToBottom();
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        isTyping = false;
    }
    
    // Update suggestion chips
    function updateSuggestionChips(suggestions) {
        suggestionChips.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.textContent = suggestion;
            chip.classList.add('suggestion-chip');
            suggestionChips.appendChild(chip);
        });
    }
    
    // Generate a unique session ID
    function generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // Format bot message with Markdown-like syntax
    function formatBotMessage(text) {
        // Convert URLs to hyperlinks
        text = text.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Convert *text* to bold
        text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        
        // Convert _text_ to italic
        text = text.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // Convert newlines to <br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // Escape HTML to prevent XSS
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Initial focus
    userInput.focus();
});