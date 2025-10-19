import React from 'react';

// Dialog (The Modal Backdrop)
const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    const handleBackdropClick = (e) => {
        // Only close if clicking the actual backdrop, not the content
        if (e.target === e.currentTarget) {
            onOpenChange(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4"
            onClick={handleBackdropClick}
        >
            {children}
        </div>
    );
};

// Dialog Content (The Modal Box)
const DialogContent = ({ className = '', children }) => (
    <div 
        className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all ${className}`}
    >
        {children}
    </div>
);

// Helper Components for structure (no logic, just styling)
const DialogHeader = ({ children }) => (<div className="flex flex-col space-y-1.5 mb-4">{children}</div>);
const DialogTitle = ({ children }) => (<h2 className="text-lg font-semibold">{children}</h2>);
const DialogDescription = ({ children }) => (<p className="text-sm text-gray-500">{children}</p>);
const DialogFooter = ({ children }) => (<div className="flex justify-end space-x-2 mt-6">{children}</div>);

export { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
};