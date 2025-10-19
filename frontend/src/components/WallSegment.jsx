import React from 'react';

const WallSegment = ({ type, r, c, wallType, cellSize, WALL_TYPE }) => {
    const isHorizontal = type === 'h';
    const startX = (c + 0.5) * cellSize;
    const startY = (r + 0.5) * cellSize;
    
    let element = null;

    if (wallType === WALL_TYPE.WALL) {
        element = (
            <line
                x1={startX} y1={startY}
                x2={isHorizontal ? startX + cellSize : startX}
                y2={isHorizontal ? startY : startY + cellSize}
                stroke="#1f2937" 
                strokeWidth="6" 
                strokeLinecap="round"
            />
        );
    } else if (wallType === WALL_TYPE.DOOR) {
        // Door (gap with a subtle indicator line)
        const size = cellSize;
        const offset = size / 4;
        const length = size / 2;
        
        element = (
            <g>
                {/* Wall segments */}
                <line x1={startX} y1={startY} x2={isHorizontal ? startX + offset : startX} y2={isHorizontal ? startY : startY + offset} stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
                <line x1={isHorizontal ? startX + offset + length : startX} y1={isHorizontal ? startY : startY + offset + length} x2={isHorizontal ? startX + size : startX} y2={isHorizontal ? startY : startY + size} stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
                {/* Arc for door swing (simplified) */}
                <rect x={isHorizontal ? startX + offset : startX - 2} y={isHorizontal ? startY - 2 : startY + offset} width={isHorizontal ? length : 4} height={isHorizontal ? 4 : length} fill="#9ca3af" />
            </g>
        );
    } else if (wallType === WALL_TYPE.WINDOW) {
        // Window (double line)
        element = (
            <g>
                <line x1={startX} y1={startY} x2={isHorizontal ? startX + cellSize : startX} y2={isHorizontal ? startY : startY + cellSize} stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                <line x1={isHorizontal ? startX : startX - 3} y1={isHorizontal ? startY - 3 : startY} x2={isHorizontal ? startX + cellSize : startX - 3} y2={isHorizontal ? startY - 3 : startY + cellSize} stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
                <line x1={isHorizontal ? startX : startX + 3} y1={isHorizontal ? startY + 3 : startY} x2={isHorizontal ? startX + cellSize : startX + 3} y2={isHorizontal ? startY + 3 : startY + cellSize} stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
            </g>
        );
    }

    return (
        <g>
            {element}
        </g>
    );
};

export default WallSegment;