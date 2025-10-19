import React, { useState, useEffect } from 'react';

const RenameDialog = ({ target, onRename, onClose }) => {
  const [name, setName] = useState('');
  
  useEffect(() => {
    if (target) {
      setName(target.currentName || '');
    }
  }, [target]);

  const handleSave = () => {
    if (name.trim()) {
      onRename(name.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const itemType = target?.type || 'Item';

  if (!target) return null;

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
      
      {/* Dialog */}
      <div 
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          width: '100%',
          maxWidth: '28rem',
          margin: '0 16px',
          position: 'relative',
          zIndex: 51
        }}
      >
        <h2 
          className="text-lg font-semibold text-gray-900 mb-2"
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px'
          }}
        >
          Rename {itemType}
        </h2>
        
        <p 
          className="text-sm text-gray-600 mb-4"
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '16px'
          }}
        >
          Give your {itemType} a new, meaningful name.
        </p>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '14px'
          }}
          placeholder="Enter new name..."
        />
        
        <div 
          className="flex justify-end space-x-2 mt-6"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '24px'
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: '#374151',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameDialog;