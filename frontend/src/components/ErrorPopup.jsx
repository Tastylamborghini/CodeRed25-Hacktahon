import React from 'react';

const ErrorPopup = ({ isOpen, message, onClose }) => {
    console.log('=== ErrorPopup render ===', { isOpen, message });
    
    if (!isOpen) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div 
                style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '400px',
                    margin: '20px'
                }}
            >
                <h3 style={{ color: 'red', marginBottom: '10px' }}>Error</h3>
                <p style={{ marginBottom: '20px' }}>{message}</p>
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default ErrorPopup;
