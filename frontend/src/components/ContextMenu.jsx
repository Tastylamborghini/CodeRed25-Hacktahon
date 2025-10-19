import React from 'react';

const ContextMenu = ({ isOpen, position, onRename, onDelete, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
          onClick={() => {
            onRename();
            onClose();
          }}
        >
          ✏️ Rename
        </button>
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-red-600"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </>
  );
};

export default ContextMenu;
