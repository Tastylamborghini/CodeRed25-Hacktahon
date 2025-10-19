import React from 'react';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogHeader = ({ children }) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
};

const DialogTitle = ({ children }) => {
  return (
    <h2 className="text-lg font-semibold text-gray-900">
      {children}
    </h2>
  );
};

const DialogDescription = ({ children }) => {
  return (
    <p className="text-sm text-gray-600 mt-1">
      {children}
    </p>
  );
};

const DialogFooter = ({ children }) => {
  return (
    <div className="flex justify-end space-x-2 mt-6">
      {children}
    </div>
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};