import React, { useMemo } from 'react';
import WallSegment from './WallSegment.jsx'; 
import FurniturePiece from './FurniturePiece.jsx'; 

const Canvas = ({ 
    svgRef, state, rooms, selectedFurnitureId, cellSize, gridSize, WALL_TYPE,
    handleMouseDown, dragPreview, handleContextMenu, isDrawingFurniture
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
                        r={1.5}
                        fill="#cbd5e1"
                        opacity="0.6"
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
        <div 
            id="canvas-container" 
            className={`relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 shadow-lg ${isDrawingFurniture ? 'border-blue-500 border-dashed' : 'border-gray-200'}`}
            style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
        >
            {isDrawingFurniture && (
                <div 
                    className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold z-10 shadow-lg"
                    style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    Furniture Mode - Click and drag to place furniture
                </div>
            )}
            <svg 
                id="floor-plan-svg" 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                onMouseDown={handleMouseDown}
                className={isDrawingFurniture ? 'cursor-crosshair' : ''}
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
                            className="room-cell cursor-pointer"
                            style={{ 
                                transition: 'fill 0.2s ease-in-out',
                                cursor: 'pointer'
                            }}
                        />
                    )))}
                </g>

                {/* Room Names Background Text */}
                <g id="room-names-group">
                    {rooms.map(room => (
                        <g key={`room-name-${room.id}`}>
                            {/* Background circle for better readability */}
                            <circle
                                cx={room.centerX}
                                cy={room.centerY}
                                r={Math.min(cellSize * 0.5, 24)}
                                fill="rgba(255, 255, 255, 0.8)"
                                stroke="rgba(0, 0, 0, 0.15)"
                                strokeWidth="1.5"
                            />
                            {/* Room name text */}
                            <text
                                x={room.centerX}
                                y={room.centerY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={Math.min(cellSize * 0.5, 16)}
                                fill="rgba(0, 0, 0, 0.7)"
                                fontWeight="700"
                                style={{ 
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                                }}
                            >
                                {room.name}
                            </text>
                        </g>
                    ))}
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
                            onContextMenu={handleContextMenu}
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
            
        </div>
    );
};

export default Canvas;