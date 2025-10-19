import React, { useMemo } from 'react';
import WallSegment from './WallSegment'; 
import FurniturePiece from './FurniturePiece'; 

const Canvas = ({ 
    svgRef, state, rooms, selectedFurnitureId, cellSize, gridSize, WALL_TYPE,
    handleMouseDown, deleteFurniture, dragPreview
}) => {
    
    const svgSize = (gridSize + 1) * cellSize;

    // Render the grid dots
    const gridDots = useMemo(() => {
        const dots = [];
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                dots.push(
                    <circle 
                        key={`${i}-${j}`}
                        cx={(j + 0.5) * cellSize}
                        cy={(i + 0.5) * cellSize}
                        r={2}
                        fill="#d1d5db"
                    />
                );
            }
        }
        return dots;
    }, [gridSize, cellSize]);
    
    // Render the interactive wall segments (clickable areas)
    const interactiveWalls = useMemo(() => {
        const walls = [];
        // Horizontal
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                walls.push(
                    <line
                        key={`h-${i}-${j}-interact`}
                        data-row={i}
                        data-col={j}
                        data-type="h"
                        x1={(j + 0.5) * cellSize}
                        y1={(i + 0.5) * cellSize}
                        x2={(j + 1.5) * cellSize}
                        y2={(i + 0.5) * cellSize}
                        stroke="transparent"
                        strokeWidth="10"
                        className="wall-line cursor-pointer"
                        // onMouseDown handled by the global SVG listener
                    />
                );
            }
        }
        // Vertical
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                walls.push(
                    <line
                        key={`v-${i}-${j}-interact`}
                        data-row={i}
                        data-col={j}
                        data-type="v"
                        x1={(j + 0.5) * cellSize}
                        y1={(i + 0.5) * cellSize}
                        x2={(j + 0.5) * cellSize}
                        y2={(i + 1.5) * cellSize}
                        stroke="transparent"
                        strokeWidth="10"
                        className="wall-line cursor-pointer"
                        // onMouseDown handled by the global SVG listener
                    />
                );
            }
        }
        return walls;
    }, [gridSize, cellSize]);


    return (
        <div id="canvas-container" className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
            <svg 
                id="floor-plan-svg" 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                onMouseDown={handleMouseDown}
            >
                {/* Rooms Group */}
                <g id="rooms-group">
                    {rooms.map(room => room.cells.map(cell => (
                        <rect
                            key={`room-${room.id}-${cell.r}-${cell.c}`}
                            data-roomid={room.id}
                            x={(cell.c + 0.5) * cellSize}
                            y={(cell.r + 0.5) * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill={room.color}
                        />
                    )))}
                </g>
                
                {/* Walls Group - Renders the actual visible lines */}
                <g id="walls-group">
                    {/* Horizontal Walls */}
                    {state.horizontalWalls.flatMap((row, r) => 
                        row.map((type, c) => type !== WALL_TYPE.NONE && (
                            <WallSegment 
                                key={`wall-h-${r}-${c}`}
                                type="h" r={r} c={c} wallType={type} 
                                cellSize={cellSize} WALL_TYPE={WALL_TYPE}
                            />
                        ))
                    )}
                    {/* Vertical Walls */}
                     {state.verticalWalls.flatMap((row, r) => 
                        row.map((type, c) => type !== WALL_TYPE.NONE && (
                            <WallSegment 
                                key={`wall-v-${r}-${c}`}
                                type="v" r={r} c={c} wallType={type} 
                                cellSize={cellSize} WALL_TYPE={WALL_TYPE}
                            />
                        ))
                    )}
                </g>

                {/* Grid Dots Group */}
                <g id="grid-group">{gridDots}</g>

                {/* Furniture Group */}
                <g id="furniture-group">
                    {state.furniture.map(f => (
                        <FurniturePiece
                            key={f.id}
                            furniture={f}
                            cellSize={cellSize}
                            isSelected={f.id === selectedFurnitureId}
                            onContextMenu={(e) => { e.preventDefault(); deleteFurniture(f.id); }} // Context menu for quick delete
                        />
                    ))}
                </g>

                {/* Drag Preview (for furniture creation) */}
                {dragPreview && (
                    <rect 
                        className="drag-preview-rect"
                        x={dragPreview.x}
                        y={dragPreview.y}
                        width={dragPreview.width}
                        height={dragPreview.height}
                        fill="#34d39966"
                        stroke="#059669"
                        strokeDasharray="4"
                    />
                )}

                {/* Interactive Wall Areas Group - MUST be rendered last for click priority */}
                <g id="interactive-group">{interactiveWalls}</g>
            </svg>
            
            {/* HTML Overlay for Room Labels (Pointer events handled by SVG background rect) */}
            <div id="html-overlay" className="absolute inset-0 pointer-events-none">
                {rooms.map(room => (
                    <div 
                        key={`label-${room.id}`}
                        data-roomid={room.id}
                        className="room-label pointer-events-auto cursor-pointer text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-md hover:ring-2 hover:ring-indigo-500 transition-shadow duration-150"
                        style={{ 
                            position: 'absolute',
                            left: `${room.centerX}px`, 
                            top: `${room.centerY}px`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {room.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Canvas;