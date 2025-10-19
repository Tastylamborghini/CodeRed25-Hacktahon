import React, { useRef, useState } from 'react';
import { useFloorPlan } from './hooks/userFloorPlan.js';
import Canvas from './components/Canvas.jsx';
import Toolbar from './components/Toolbar.jsx';
import RenameDialog from './components/RenameDialog.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import AIChatbot from './components/AIChatbot.jsx';
import ErrorPopup from './components/ErrorPopup.jsx';
import * as floorPlanService from './services/floorPlanService.js';
import './index.css'; // Tailwind import

const App = () => {
    const svgRef = useRef(null);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [errorPopup, setErrorPopup] = useState({ isOpen: false, message: '' });
    
    const showError = (message) => {
        console.log('=== showError called ===', message);
        setErrorPopup({ isOpen: true, message });
    };

    const closeError = () => {
        console.log('=== closeError called ===');
        setErrorPopup({ isOpen: false, message: '' });
    };
    
        const { 
            state, rooms, selectedFurnitureId, cellSize, gridSize, WALL_TYPE, dragPreview,
            renameTarget, isDrawingFurniture, contextMenu,
            addFurniture, clearAll, undo, redo, handleMouseDown, deleteFurniture, completeRename, 
            handleContextMenu, closeContextMenu, handleRenameFromContextMenu, handleDeleteFromContextMenu,
            closeRenameDialog, loadFloorPlan,
        } = useFloorPlan(svgRef, showError);

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
                    
                    // Validate the JSON structure
                    if (!data.walls || !data.furniture || !data.rooms || !data.metadata) {
                        throw new Error('Invalid floor plan format. Missing required fields: walls, furniture, rooms, or metadata.');
                    }
                    
                    const loadedData = floorPlanService.convertFromBackendFormat(data);
                    
                    // Load the floor plan data
                    loadFloorPlan(loadedData.state, loadedData.rooms);
                    alert(`Loaded floor plan: ${file.name}`);
                    console.log('Loaded data:', loadedData);
                } catch (error) {
                    console.error('Error loading floor plan:', error);
                    if (error instanceof SyntaxError) {
                        showError('Invalid JSON file. Please make sure the file contains valid JSON format.');
                    } else if (error.message.includes('Invalid floor plan format')) {
                        showError(error.message);
                    } else {
                        showError('Failed to load floor plan. Please check the file format and try again.');
                    }
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
            console.log('=== handleApplyAISuggestions called ===');
            console.log('updatedFloorPlan:', updatedFloorPlan);
            
            if (updatedFloorPlan) {
                try {
                    console.log('Converting from backend format...');
                    const convertedData = floorPlanService.convertFromBackendFormat(updatedFloorPlan);
                    console.log('Converted data:', convertedData);
                    console.log('Furniture count:', convertedData.state.furniture.length);
                    
                    loadFloorPlan(convertedData.state, convertedData.rooms);
                    setIsAIChatOpen(false);
                    console.log('Successfully applied AI suggestions');
                } catch (error) {
                    console.error('Error applying AI suggestions:', error);
                    alert('Failed to apply AI suggestions: ' + error.message);
                }
            }
        };

    return (
        <div 
            className="min-h-screen bg-gray-50"
            style={{
                minHeight: '100vh',
                backgroundColor: '#f9fafb'
            }}
        >
            <div className="container mx-auto px-4 py-8 animate-fade-in-up">
                <div 
                    className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                    style={{
                        width: '100%',
                        maxWidth: '72rem',
                        margin: '0 auto',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #f1f5f9',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div 
                        className="bg-gray-800 px-8 py-6"
                        style={{
                            backgroundColor: '#1f2937',
                            padding: '24px 32px'
                        }}
                    >
                        <h1 
                            className="text-3xl font-bold text-white text-center tracking-tight"
                            style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#ffffff',
                                letterSpacing: '-0.025em',
                                textAlign: 'center'
                            }}
                        >
                            Floor Plan Designer
                        </h1>
                        <p 
                            className="text-gray-300 text-center mt-2 text-sm"
                            style={{
                                color: '#d1d5db',
                                textAlign: 'center',
                                marginTop: '8px',
                                fontSize: '14px'
                            }}
                        >
                            Design, customize, and optimize your space with AI assistance
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="p-8" style={{ padding: '32px' }}>

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
                    
                    {/* Error Popup */}
                    <ErrorPopup
                        isOpen={errorPopup.isOpen}
                        message={errorPopup.message}
                        onClose={closeError}
                    />
                    
                    {/* Debug Error State */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs">
                            Error State: {JSON.stringify(errorPopup)}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
        );
    };

export default App;