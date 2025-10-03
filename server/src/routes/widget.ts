import express from 'express';
import path from 'path';

const router = express.Router();

// Serve the chat widget HTML (with project support)
router.get('/', (req, res) => {
  const project = req.query.project || 'default';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@yourcompany.com';
  
  const widgetHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FAQ Chat Widget</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .chat-header {
            background: #3b82f6;
            color: white;
            padding: 16px;
            text-align: center;
            font-weight: 600;
        }
        
        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            max-height: 400px;
        }
        
        .message {
            margin-bottom: 12px;
            padding: 8px 12px;
            border-radius: 8px;
            max-width: 80%;
        }
        
        .message.user {
            background: #3b82f6;
            color: white;
            margin-left: auto;
        }
        
        .message.bot {
            background: #f1f5f9;
            color: #334155;
        }
        
        .chat-input-container {
            padding: 16px;
            border-top: 1px solid #e2e8f0;
            background: white;
        }
        
        .chat-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
        }
        
        .chat-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .send-button {
            width: 100%;
            margin-top: 8px;
            padding: 12px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .send-button:hover {
            background: #2563eb;
        }
        
        .send-button:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
        
        .loading {
            display: none;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 8px;
        }
        
        .error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            font-size: 14px;
        }
        
        .welcome-message {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            FAQ Assistant
        </div>
        <div class="chat-messages" id="messages">
            <div class="welcome-message">
                Ask me anything! I'm here to help with your questions.<br>
                <small style="font-size: 12px; color: #9ca3af;">Project: ${project}</small>
            </div>
        </div>
        <div class="chat-input-container">
            <input type="text" class="chat-input" id="messageInput" placeholder="Type your question here..." />
            <button class="send-button" id="sendButton">Send</button>
            <div class="loading" id="loading">Thinking...</div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.origin.replace(/\\d+$/, '3001') + '/api/public';
        const PROJECT = '${project}';
        const SUPPORT_EMAIL = '${supportEmail}';
        
        const messagesContainer = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const loading = document.getElementById('loading');
        
        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user' : 'bot'}\`;
            messageDiv.textContent = content;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            messagesContainer.appendChild(errorDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function setLoading(show) {
            loading.style.display = show ? 'block' : 'none';
            sendButton.disabled = show;
        }
        
        async function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;
            
            addMessage(message, true);
            messageInput.value = '';
            setLoading(true);
            
            try {
                const response = await fetch(\`\${API_BASE}/chat\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: message, project: PROJECT })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    addMessage(data.answer);
                } else if (response.status === 429) {
                    showError('Too many requests. Please wait a moment and try again.');
                } else {
                    showError(data.error || \`Failed to get response. Contact \${SUPPORT_EMAIL} for help.\`);
                }
            } catch (error) {
                console.error('Chat error:', error);
                showError('Sorry, I encountered an error. Please try again.');
            } finally {
                setLoading(false);
            }
        }
        
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Focus input on load
        messageInput.focus();
    </script>
</body>
</html>
  `;
  
  res.send(widgetHTML);
});

export { router as widgetRoutes };
