import React, { useRef, useState } from 'react';
import { useFloorPlan } from './hooks/userFloorPlan.js';
import Canvas from './components/Canvas.jsx';
import Toolbar from './components/Toolbar.jsx';
import RenameDialog from './components/RenameDialog.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import * as floorPlanService from './services/floorPlanService.js';
import './index.css'; // Tailwind import

const App = () => {
    const svgRef = useRef(null);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    
        const { 
            state, rooms, selectedFurnitureId, cellSize, gridSize, WALL_TYPE, dragPreview,
            renameTarget, isDrawingFurniture, contextMenu,
            addFurniture, clearAll, undo, redo, handleMouseDown, deleteFurniture, completeRename, 
            handleContextMenu, closeContextMenu, handleRenameFromContextMenu, handleDeleteFromContextMenu,
            closeRenameDialog, loadFloorPlan,
        } = useFloorPlan(svgRef);

        const handleSave = async () => {
            try {
                console.log('Attempting to save floor plan...', { state, rooms, gridSize, cellSize });
                
                // Convert to backend format
                const data = floorPlanService.convertToBackendFormat(state, rooms, gridSize, cellSize);
                
                // Create filename with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `floor-plan-${timestamp}.json`;
                
                // Create and trigger download
                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                console.log('Floor plan downloaded successfully');
                alert(`Floor plan downloaded successfully! Filename: ${filename}`);
            } catch (error) {
                console.error('Error saving floor plan:', error);
                alert(`Failed to save floor plan: ${error.message}. Please check console for details.`);
            }
        };

        const handleLoad = () => {
            // Create file input for loading JSON files
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    const loadedData = floorPlanService.convertFromBackendFormat(data);
                    
                    // Load the floor plan data
                    loadFloorPlan(loadedData.state, loadedData.rooms);
                    alert(`Loaded floor plan: ${file.name}`);
                    console.log('Loaded data:', loadedData);
                } catch (error) {
                    console.error('Error loading floor plan:', error);
                    alert('Failed to load floor plan. Please check the file format.');
                }
            };
            input.click();
        };

        const handleOpenAI = () => {
            setIsAIChatOpen(true);
        };

        const handleCloseAI = () => {
            setIsAIChatOpen(false);
        };

        const handleApplyAISuggestions = (updatedFloorPlan) => {
            if (updatedFloorPlan) {
                const convertedData = floorPlanService.convertFromBackendFormat(updatedFloorPlan);
                loadFloorPlan(convertedData.state, convertedData.rooms);
                setIsAIChatOpen(false);
            }
        };

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
                        onSave={handleSave}
                        onLoad={handleLoad}
                        onOpenAI={handleOpenAI}
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

                    {/* AI Chatbot */}
                    <AIChatbot
                        isOpen={isAIChatOpen}
                        onClose={handleCloseAI}
                        floorPlanData={floorPlanService.convertToBackendFormat(state, rooms, gridSize, cellSize)}
                        onApplySuggestions={handleApplyAISuggestions}
                    />
                </div>
            </div>
        );
    };

export default App;