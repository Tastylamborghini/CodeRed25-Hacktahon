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
            console.log('=== Sending AI request ===');
            console.log('Request URL:', 'http://localhost:3001/api/ai/chat');
            console.log('Request data:', {
                message: inputMessage,
                floorPlanData: floorPlanData,
                conversationHistory: messages.slice(-5)
            });
            
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

            console.log('=== Response received ===');
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('=== Response data ===');
            console.log('Response data:', data);
            
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: data.response,
                suggestions: data.suggestions,
                updatedFloorPlan: data.updatedFloorPlan,
                timestamp: data.timestamp
            };

            console.log('=== AI Message created ===');
            console.log('AI Message:', aiMessage);

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('=== Error in AI request ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
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
        console.log('=== applySuggestions called ===');
        console.log('updatedFloorPlan:', updatedFloorPlan);
        console.log('onApplySuggestions function:', !!onApplySuggestions);
        
        if (updatedFloorPlan && onApplySuggestions) {
            console.log('Calling onApplySuggestions...');
            onApplySuggestions(updatedFloorPlan);
        } else {
            console.log('Missing updatedFloorPlan or onApplySuggestions callback');
        }
    };

    return (
        <>
            {/* Backdrop - only show when sidebar is open */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-40"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        zIndex: 40
                    }}
                    onClick={onClose}
                />
            )}
            
                {/* Sidebar */}
                <div 
                    className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-gray-200 ${
                        isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        height: '100vh',
                        width: '24rem', // 384px
                        backgroundColor: '#ffffff',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                        transition: 'transform 300ms ease-in-out',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: '1px solid #e5e7eb'
                    }}
                >
                {/* Header */}
                <div 
                    className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-800"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#1f2937'
                    }}
                >
                    <h2 
                        className="text-xl font-bold text-white"
                        style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#ffffff',
                            margin: 0
                        }}
                    >
                        AI Design Assistant
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                        style={{
                            padding: '8px',
                            backgroundColor: 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: 'none',
                            fontSize: '18px',
                            color: '#ffffff'
                        }}
                    >
                        ✕
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
                                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-sm ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                    style={{
                                        maxWidth: message.type === 'user' ? '12rem' : '24rem',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        backgroundColor: message.type === 'user' ? '#2563eb' : '#ffffff',
                                        color: message.type === 'user' ? '#ffffff' : '#111827',
                                        whiteSpace: 'pre-wrap',
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                        border: message.type === 'user' ? 'none' : '1px solid #e5e7eb'
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
                                
                                    {/* Apply suggestions button - always show if there's an updatedFloorPlan */}
                                    {message.updatedFloorPlan && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('=== Apply Suggestions button clicked ===');
                                                console.log('message.updatedFloorPlan:', message.updatedFloorPlan);
                                                console.log('Button element:', e.target);
                                                applySuggestions(message.updatedFloorPlan);
                                            }}
                                            className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                                            style={{
                                                marginTop: '12px',
                                                padding: '8px 16px',
                                                backgroundColor: '#059669',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            {message.updatedFloorPlan.furniture && message.updatedFloorPlan.furniture.length > 0 
                                                ? 'Apply Suggestions' 
                                                : 'Apply Changes'
                                            }
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
                    className="p-6 border-t border-gray-200 bg-gray-50"
                    style={{
                        padding: '24px',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                    }}
                >
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about furniture, design tips, or layout suggestions..."
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                outline: 'none',
                                fontSize: '14px',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                            }}
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#7c3aed',
                                color: '#ffffff',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChatbot;
