import React, { useState, useRef, useEffect } from 'react';
import * as floorPlanService from '../services/floorPlanService.js';

const AIChatbot = ({ isOpen, onClose, floorPlanData, onApplySuggestions }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hello! I'm your interior design AI assistant. I can analyze your floor plan and provide furniture suggestions, design tips, and layout recommendations. How can I help you today?",
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    floorPlanData: floorPlanData,
                    conversationHistory: messages.slice(-5) // Send last 5 messages for context
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: data.response,
                suggestions: data.suggestions,
                updatedFloorPlan: data.updatedFloorPlan,
                timestamp: data.timestamp
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const applySuggestions = (updatedFloorPlan) => {
        if (updatedFloorPlan && onApplySuggestions) {
            onApplySuggestions(updatedFloorPlan);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
                onClick={onClose}
            />
            
            {/* Chat Window */}
            <div 
                className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 h-96 flex flex-col"
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '48rem',
                    margin: '0 16px',
                    height: '24rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 51
                }}
            >
                {/* Header */}
                <div 
                    className="flex justify-between items-center p-4 border-b"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderBottom: '1px solid #e5e7eb'
                    }}
                >
                    <h2 
                        className="text-lg font-semibold text-gray-900"
                        style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827'
                        }}
                    >
                        🤖 AI Design Assistant
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        style={{
                            color: '#9ca3af',
                            cursor: 'pointer',
                            fontSize: '20px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Messages */}
                <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}
                >
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            style={{
                                display: 'flex',
                                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                                style={{
                                    maxWidth: message.type === 'user' ? '12rem' : '24rem',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    backgroundColor: message.type === 'user' ? '#2563eb' : '#f3f4f6',
                                    color: message.type === 'user' ? '#ffffff' : '#111827',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {message.content}
                                
                                {/* Show suggestions if available */}
                                {message.suggestions && message.suggestions.length > 0 && (
                                    <div className="mt-2">
                                        <div className="text-sm font-medium mb-1">💡 Design Tips:</div>
                                        <ul className="text-sm space-y-1">
                                            {message.suggestions.slice(0, 3).map((tip, index) => (
                                                <li key={index}>• {tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Apply suggestions button */}
                                {message.updatedFloorPlan && (
                                    <button
                                        onClick={() => applySuggestions(message.updatedFloorPlan)}
                                        className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                        style={{
                                            marginTop: '8px',
                                            padding: '4px 12px',
                                            backgroundColor: '#059669',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Apply Suggestions
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div 
                                className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: '#f3f4f6',
                                    color: '#111827',
                                    padding: '8px 16px',
                                    borderRadius: '8px'
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                    <span>AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div 
                    className="p-4 border-t"
                    style={{
                        padding: '16px',
                        borderTop: '1px solid #e5e7eb'
                    }}
                >
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about furniture, design tips, or layout suggestions..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                outline: 'none',
                                fontSize: '14px'
                            }}
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatbot;
