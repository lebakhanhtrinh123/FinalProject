import React, { useState, useEffect } from 'react';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';

const ChatBox = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showBubble, setShowBubble] = useState(true);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        setShowBubble(false);
    };

    const saveToSession = (key, value) => {
        sessionStorage.setItem(key, JSON.stringify(value));
    };

    const handleSendMessage = async () => {
        if (message.trim()) {
            const newMessage = { text: message, sender: 'customer', timestamp: new Date().toLocaleTimeString() };
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            setMessage('');
            saveToSession('chatMessages', updatedMessages);
    
            try {
                const response = await fetch('https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/ChatGpt/chat-boxgpt', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    },
                    body: JSON.stringify({ message: message })
                });
    
                const data = await response.json();
                console.log(data); 
    
                if (data && data.response) {
                    const botMessage = {
                        text: data.response, 
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString()
                    };
    
                    const updatedMessagesWithBot = [...updatedMessages, botMessage];
                    setMessages(updatedMessagesWithBot);
                    saveToSession('chatMessages', updatedMessagesWithBot);
                } else {
                    console.error("No response field in response:", data);
                    const botMessage = {
                        text: "Xin lỗi, tôi không hiểu câu hỏi của bạn.", 
                        sender: 'bot',
                        timestamp: new Date().toLocaleTimeString()
                    };
                    const updatedMessagesWithError = [...updatedMessages, botMessage];
                    setMessages(updatedMessagesWithError);
                    saveToSession('chatMessages', updatedMessagesWithError);
                }
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

    useEffect(() => {
        const storedMessages = sessionStorage.getItem('chatMessages');
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }
    }, []);

    return (
        <>
            <div className="fixed bottom-20 right-6 z-50">
                <button
                    onClick={toggleChat}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex items-center justify-center shadow-lg transition-all duration-300"
                    aria-label="Open chat"
                    onMouseEnter={() => setShowBubble(true)}
                >
                    <MessageOutlined className="text-white text-xl" />
                </button>

                {showBubble && !isChatOpen && (
                    <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-md px-3 py-2 text-pink-600 font-medium text-sm whitespace-nowrap animate-bounce">
                        Chat now!
                        <div className="absolute w-3 h-3 bg-white transform rotate-45 bottom-[-6px] right-6"></div>
                    </div>
                )}
            </div>

            {isChatOpen && (
                <div className="fixed bottom-36 right-6 w-80 h-96 bg-white rounded-lg shadow-xl z-40 overflow-hidden flex flex-col border border-gray-200">
                    <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
                        <h3 className="font-medium text-gray-800">Chat with us</h3>
                        <button
                            onClick={toggleChat}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close chat"
                        >
                            <CloseOutlined />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50 p-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'} mb-2`}>
                                <div className={`px-4 py-2 rounded-lg ${msg.sender === 'customer' ? 'bg-pink-600 text-white' : 'bg-gray-300 text-gray-800'}`}>
                                    <p>{msg.text}</p>
                                    <small className="text-xs text-white-500">{msg.timestamp}</small>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex p-3 border-t border-gray-200 bg-white">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button onClick={handleSendMessage} className="bg-pink-600 hover:bg-pink-700 text-white px-4 rounded-r">
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBox;
