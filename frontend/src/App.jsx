import React, { useRef } from 'react';
import { useFloorPlan } from './hooks/useFloorPlan';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import RenameDialog from './components/RenameDialog';
import './index.css'; // Tailwind import

const App = () => {
    const svgRef = useRef(null);
    
    const { 
        state, rooms, selectedFurnitureId, cellSize, gridSize, WALL_TYPE, dragPreview,
        renameTarget,
        addFurniture, clearAll, undo, redo, handleMouseDown, deleteFurniture, completeRename,
    } = useFloorPlan(svgRef);

    return (
        <div className="bg-gray-50 flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Floor Plan Designer</h1>
                </div>

                <Toolbar 
                    addFurniture={addFurniture}
                    clearAll={clearAll}
                    undo={undo}
                    redo={redo}
                />
                
                <Canvas
                    svgRef={svgRef}
                    state={state}
                    rooms={rooms}
                    selectedFurnitureId={selectedFurnitureId}
                    cellSize={cellSize}
                    gridSize={gridSize}
                    WALL_TYPE={WALL_TYPE}
                    handleMouseDown={handleMouseDown}
                    deleteFurniture={deleteFurniture}
                />
                
                {/* Rename Dialog (using shadcn/ui) */}
                <RenameDialog 
                    target={renameTarget} 
                    onRename={completeRename}
                    onClose={() => completeRename(null)} // Close without renaming
                />

                {/* Other features like Context Menu would be implemented here, potentially as a Popover */}
            </div>
        </div>
    );
};

export default App;