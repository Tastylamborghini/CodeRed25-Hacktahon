import React from 'react';
import { Button } from './ui/button.jsx'; // Assumes shadcn/ui Button is generated here

const Toolbar = ({ addFurniture, clearAll, undo, redo, isDrawingFurniture, onSave, onLoad, onOpenAI }) => (
    <div 
        className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm animate-slide-in-right"
        style={{
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
    >
        <div className="flex flex-col space-y-4">
            {/* Primary Actions */}
            <div className="flex justify-center items-center space-x-3">
        
                <button 
                    onClick={addFurniture} 
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                        isDrawingFurniture 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-md'
                    }`}
                    style={{
                        backgroundColor: isDrawingFurniture ? '#2563eb' : '#ffffff',
                        color: isDrawingFurniture ? '#ffffff' : '#374151',
                        border: isDrawingFurniture ? 'none' : '2px solid #d1d5db',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: isDrawingFurniture ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {isDrawingFurniture ? "Click to Place Furniture" : "Add Furniture"}
                </button>
        
                <button 
                    onClick={clearAll} 
                    className="px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    Clear Plan
                </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex justify-center items-center space-x-4">
                {/* Undo/Redo */}
                <div className="flex space-x-2">
                    <button 
                        onClick={undo} 
                        className="h-12 w-12 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all duration-200 shadow-sm"
                        style={{
                            height: '48px',
                            width: '48px',
                            border: '2px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                        title="Undo (Ctrl+Z)"
                    >
                        <span className="text-lg">↩</span>
                    </button>
                    <button 
                        onClick={redo} 
                        className="h-12 w-12 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center transition-all duration-200 shadow-sm"
                        style={{
                            height: '48px',
                            width: '48px',
                            border: '2px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}
                        title="Redo (Ctrl+Y)"
                    >
                        <span className="text-lg">↪</span>
                    </button>
                </div>

                {/* File Operations */}
                <div className="flex space-x-3">
                    <button 
                        onClick={onSave} 
                        className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        style={{
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        Save Plan
                    </button>
                    <button 
                        onClick={onLoad} 
                        className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        Load Plan
                    </button>
                    <button 
                        onClick={onOpenAI} 
                        className="px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        style={{
                            backgroundColor: '#7c3aed',
                            color: '#ffffff',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        AI Assistant
                    </button>
                </div>
            </div>
            
            {/* Instructions */}
            <div className="text-center">
                <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm inline-block">
                    <strong>Tips:</strong> Click wall segments to change type • Click rooms to rename • Right-click furniture for options
                </p>
            </div>
        </div>
    </div>
);

export default Toolbar;