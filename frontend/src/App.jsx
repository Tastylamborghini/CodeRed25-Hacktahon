import React, { useRef } from 'react';
import { useFloorPlan } from './hooks/userFloorPlan.js';
import Canvas from './components/Canvas.jsx';
import Toolbar from './components/Toolbar.jsx';
import RenameDialog from './components/RenameDialog.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import './index.css'; // Tailwind import

const App = () => {
    const svgRef = useRef(null);
    
    const { 
        state, rooms, selectedFurnitureId, cellSize, gridSize, WALL_TYPE, dragPreview,
        renameTarget, isDrawingFurniture, contextMenu,
        addFurniture, clearAll, undo, redo, handleMouseDown, deleteFurniture, completeRename, 
        handleContextMenu, closeContextMenu, handleRenameFromContextMenu, handleDeleteFromContextMenu,
        closeRenameDialog,
    } = useFloorPlan(svgRef);

    return (
        <div 
            className="bg-gray-50 flex flex-col items-center justify-center min-h-screen p-4"
            style={{
                backgroundColor: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '16px'
            }}
        >
            <div 
                className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6"
                style={{
                    width: '100%',
                    maxWidth: '80rem',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    padding: '24px'
                }}
            >
                <div 
                    className="text-center mb-6"
                    style={{
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}
                >
                    <h1 
                        className="text-3xl font-extrabold text-gray-900 tracking-tight"
                        style={{
                            fontSize: '30px',
                            fontWeight: '800',
                            color: '#111827',
                            letterSpacing: '-0.025em'
                        }}
                    >
                        Floor Plan Designer
                    </h1>
                </div>

                <Toolbar 
                    addFurniture={addFurniture}
                    clearAll={clearAll}
                    undo={undo}
                    redo={redo}
                    isDrawingFurniture={isDrawingFurniture}
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
                    dragPreview={dragPreview}
                    handleContextMenu={handleContextMenu}
                    isDrawingFurniture={isDrawingFurniture}
                />
                
                {/* Rename Dialog (using shadcn/ui) */}
                <RenameDialog 
                    target={renameTarget} 
                    onRename={completeRename}
                    onClose={closeRenameDialog}
                />

                {/* Context Menu */}
                <ContextMenu
                    isOpen={contextMenu.isOpen}
                    position={contextMenu.position}
                    onRename={handleRenameFromContextMenu}
                    onDelete={handleDeleteFromContextMenu}
                    onClose={closeContextMenu}
                />
            </div>
        </div>
    );
};

export default App;