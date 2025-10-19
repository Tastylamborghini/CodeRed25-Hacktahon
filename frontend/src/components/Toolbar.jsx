import React from 'react';
import { Button } from './ui/button'; // Assumes shadcn/ui Button is generated here

const Toolbar = ({ addFurniture, clearAll, undo, redo }) => (
    <div className="flex justify-center items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg border">
        
        <Button onClick={addFurniture} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
            ➕ Add Item
        </Button>
        
        <Button onClick={clearAll} variant="destructive">
            🗑️ Clear Plan
        </Button>

        <div className="flex space-x-1">
            <Button onClick={undo} variant="outline" size="icon" title="Undo (Ctrl+Z)">
                ↩
            </Button>
            <Button onClick={redo} variant="outline" size="icon" title="Redo (Ctrl+Y)">
                ↪
            </Button>
        </div>
        
        {/* Wall/Door/Window controls would use a selection state and different buttons/icons */}
        <span className="text-sm text-gray-500 ml-4">
            Click wall segment to change type (Wall, Door, Window, None)
        </span>
    </div>
);

export default Toolbar;