import React from 'react';
import { Button } from './ui/button.jsx'; // Assumes shadcn/ui Button is generated here

const Toolbar = ({ addFurniture, clearAll, undo, redo, isDrawingFurniture }) => (
    <div className="flex justify-center items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg border">
        
        <button 
            onClick={addFurniture} 
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isDrawingFurniture 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={{
                backgroundColor: isDrawingFurniture ? '#4f46e5' : '#ffffff',
                color: isDrawingFurniture ? '#ffffff' : '#374151',
                border: isDrawingFurniture ? 'none' : '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer'
            }}
        >
            {isDrawingFurniture ? "🎯 Click to Place Furniture" : "➕ Add Furniture"}
        </button>
        
        <button 
            onClick={clearAll} 
            className="px-4 py-2 rounded-md font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer'
            }}
        >
            🗑️ Clear Plan
        </button>

        <div className="flex space-x-1">
            <button 
                onClick={undo} 
                className="h-10 w-10 rounded-md border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center"
                style={{
                    height: '40px',
                    width: '40px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Undo (Ctrl+Z)"
            >
                ↩
            </button>
            <button 
                onClick={redo} 
                className="h-10 w-10 rounded-md border border-gray-300 bg-white hover:bg-gray-100 flex items-center justify-center"
                style={{
                    height: '40px',
                    width: '40px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Redo (Ctrl+Y)"
            >
                ↪
            </button>
        </div>
        
        {/* Wall/Door/Window controls would use a selection state and different buttons/icons */}
        <span className="text-sm text-gray-500 ml-4">
            Click wall segment to change type (Wall, Door, Window, None)
        </span>
    </div>
);

export default Toolbar;