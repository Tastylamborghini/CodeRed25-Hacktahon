import React from 'react';

const FurniturePiece = ({ furniture, cellSize, isSelected, onContextMenu }) => {
    const { col, row, w, h, name, id } = furniture;

    const x = (col + 0.5) * cellSize;
    const y = (row + 0.5) * cellSize;
    const width = w * cellSize;
    const height = h * cellSize;

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, id);
    };

    return (
        <g>
            {/* Furniture Rectangle */}
            <rect
                data-id={id}
                x={x}
                y={y}
                width={width}
                height={height}
                rx="4"
                fill="#a5b4fc"
                stroke={isSelected ? "#ef4444" : "#6366f1"}
                strokeWidth={isSelected ? "3" : "2"}
                className={`furniture-rect cursor-grab transition-all duration-100 ease-in-out`}
                onContextMenu={handleContextMenu}
            />

            {/* Furniture Name Text */}
            <text
                x={x + width / 2}
                y={y + height / 2 + 5} 
                textAnchor="middle"
                fontSize="12"
                fill="#4b5563"
                style={{ pointerEvents: 'none' }}
            >
                {name || 'Item'}
            </text>

            {/* Resize Handle (only visible when selected) - Bottom Right */}
            {isSelected && (
                <rect
                    data-id={id}
                    data-direction="br"
                    x={x + width - 10}
                    y={y + height - 10}
                    width="10"
                    height="10"
                    rx="2"
                    className="resize-handle cursor-nwse-resize fill-emerald-500 stroke-emerald-700"
                />
            )}
        </g>
    );
};

export default FurniturePiece;