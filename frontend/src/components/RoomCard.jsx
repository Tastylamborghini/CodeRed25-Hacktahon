import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Move, RotateCw, Square } from 'lucide-react';

const RoomCard = ({ 
  room, 
  onClick, 
  onRightClick, 
  isSelected, 
  onUpdate 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: room.id,
    data: {
      roomType: room.type,
      room: room
    }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    gridColumn: `${room.x + 1} / span ${room.width}`,
    gridRow: `${room.y + 1} / span ${room.height}`,
    opacity: isDragging ? 0.5 : 1,
  };

  const roomTypeConfig = {
    bedroom: { color: '#FFB6C1', icon: '🛏️', name: 'Bedroom' },
    bathroom: { color: '#87CEEB', icon: '🚿', name: 'Bathroom' },
    kitchen: { color: '#F0E68C', icon: '🍳', name: 'Kitchen' },
    living: { color: '#98FB98', icon: '🛋️', name: 'Living Room' },
    dining: { color: '#DDA0DD', icon: '🍽️', name: 'Dining Room' },
    study: { color: '#F5DEB3', icon: '📚', name: 'Study Room' },
    office: { color: '#E6E6FA', icon: '💼', name: 'Office' },
    storage: { color: '#D3D3D3', icon: '📦', name: 'Storage' }
  };

  const config = roomTypeConfig[room.type] || { 
    color: '#E0E0E0', 
    icon: '🏠', 
    name: 'Room' 
  };

  const handleDrag = (e) => {
    if (e.target.closest('.room-controls')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const gridRect = e.currentTarget.parentElement.getBoundingClientRect();
    
    const x = Math.floor((e.clientX - gridRect.left) / (gridRect.width / 10));
    const y = Math.floor((e.clientY - gridRect.top) / (gridRect.height / 10));
    
    if (x >= 0 && y >= 0 && x < 10 && y < 10) {
      onUpdate({ x, y });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`room-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseUp={handleDrag}
      {...attributes}
      {...listeners}
    >
      <div 
        className="room-content"
        style={{ backgroundColor: config.color }}
      >
        <div className="room-header">
          <span className="room-icon">{config.icon}</span>
          <span className="room-name">{config.name}</span>
        </div>
        
        <div className="room-size">
          {room.width} × {room.height}
        </div>

        {/* Structural Elements */}
        {room.structuralElements && room.structuralElements.length > 0 && (
          <div className="structural-elements">
            {room.structuralElements.map(element => (
              <div
                key={element.id}
                className="structural-element"
                style={{
                  position: 'absolute',
                  left: `${element.x * 100}%`,
                  top: `${element.y * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={element.type}
              >
                {element.type === 'door' && '🚪'}
                {element.type === 'window' && '🪟'}
                {element.type === 'outlet' && '🔌'}
                {element.type === 'toilet' && '🚽'}
                {element.type === 'sink' && '🚰'}
                {element.type === 'stove' && '🔥'}
                {element.type === 'fridge' && '❄️'}
              </div>
            ))}
          </div>
        )}

        {/* Room Controls */}
        <div className="room-controls" onClick={(e) => e.stopPropagation()}>
          <button
            className="room-control-btn"
            title="Move"
            {...listeners}
          >
            <Move size={12} />
          </button>
          <button
            className="room-control-btn"
            title="Rotate"
            onClick={() => onUpdate({ 
              width: room.height, 
              height: room.width 
            })}
          >
            <RotateCw size={12} />
          </button>
          <button
            className="room-control-btn"
            title="Resize"
            onClick={(e) => {
              e.stopPropagation();
              // This will be handled by the parent component
            }}
          >
            <Square size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
