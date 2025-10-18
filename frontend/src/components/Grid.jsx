import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import RoomCard from './RoomCard';
import { X, RotateCw, Move, Square } from 'lucide-react';

const Grid = ({ 
  rooms, 
  gridSize, 
  onRoomClick, 
  onRoomUpdate, 
  onRoomDelete, 
  selectedRoom 
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [resizingRoom, setResizingRoom] = useState(null);

  const { setNodeRef } = useDroppable({
    id: 'grid-droppable'
  });

  const gridCells = [];
  for (let row = 0; row < gridSize.rows; row++) {
    for (let col = 0; col < gridSize.cols; col++) {
      gridCells.push(
        <div
          key={`grid-${col}-${row}`}
          className="grid-cell"
          data-x={col}
          data-y={row}
        />
      );
    }
  }

  const handleGridClick = (e) => {
    if (e.target.classList.contains('grid-cell')) {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);
      onRoomClick({ x, y, type: 'empty' });
    }
  };

  const handleRoomRightClick = (e, room) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      room
    });
  };

  const handleContextMenuAction = (action, room) => {
    switch (action) {
      case 'delete':
        onRoomDelete(room.id);
        break;
      case 'duplicate':
        const newRoom = {
          ...room,
          id: `${room.type}-${Date.now()}`,
          x: room.x + 1,
          y: room.y + 1
        };
        onRoomUpdate(room.id, newRoom);
        break;
      case 'resize':
        setResizingRoom(room);
        break;
      default:
        break;
    }
    setContextMenu(null);
  };

  const structuralElements = [
    { type: 'door', icon: '🚪', name: 'Door' },
    { type: 'window', icon: '🪟', name: 'Window' },
    { type: 'outlet', icon: '🔌', name: 'Electrical Outlet' },
    { type: 'toilet', icon: '🚽', name: 'Toilet' },
    { type: 'sink', icon: '🚰', name: 'Sink' },
    { type: 'stove', icon: '🔥', name: 'Stove' },
    { type: 'fridge', icon: '❄️', name: 'Refrigerator' }
  ];

  const addStructuralElement = (elementType, room) => {
    const newElement = {
      id: `${elementType}-${Date.now()}`,
      type: elementType,
      x: Math.random() * 0.8 + 0.1, // Random position within room
      y: Math.random() * 0.8 + 0.1
    };
    
    onRoomUpdate(room.id, {
      structuralElements: [...(room.structuralElements || []), newElement]
    });
    setContextMenu(null);
  };

  return (
    <div className="grid-container">
      <div 
        ref={setNodeRef}
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
        }}
        onClick={handleGridClick}
      >
        {gridCells}
        
        {rooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => onRoomClick(room)}
            onRightClick={(e) => handleRoomRightClick(e, room)}
            isSelected={selectedRoom?.id === room.id}
            onUpdate={(updates) => onRoomUpdate(room.id, updates)}
          />
        ))}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000
          }}
        >
          <div className="context-menu-header">
            <span>{contextMenu.room.type}</span>
            <button 
              className="context-menu-close"
              onClick={() => setContextMenu(null)}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="context-menu-section">
            <h4>Room Actions</h4>
            <button onClick={() => handleContextMenuAction('duplicate', contextMenu.room)}>
              <Square size={16} />
              Duplicate
            </button>
            <button onClick={() => handleContextMenuAction('resize', contextMenu.room)}>
              <Move size={16} />
              Resize
            </button>
            <button 
              className="danger"
              onClick={() => handleContextMenuAction('delete', contextMenu.room)}
            >
              <X size={16} />
              Delete
            </button>
          </div>

          <div className="context-menu-section">
            <h4>Add Structure</h4>
            {structuralElements.map(element => (
              <button
                key={element.type}
                onClick={() => addStructuralElement(element.type, contextMenu.room)}
              >
                <span>{element.icon}</span>
                {element.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {resizingRoom && (
        <div className="resize-overlay">
          <div className="resize-controls">
            <h3>Resize {resizingRoom.type}</h3>
            <div className="resize-inputs">
              <label>
                Width:
                <input
                  type="number"
                  min="1"
                  max={gridSize.cols - resizingRoom.x}
                  value={resizingRoom.width}
                  onChange={(e) => onRoomUpdate(resizingRoom.id, { 
                    width: parseInt(e.target.value) 
                  })}
                />
              </label>
              <label>
                Height:
                <input
                  type="number"
                  min="1"
                  max={gridSize.rows - resizingRoom.y}
                  value={resizingRoom.height}
                  onChange={(e) => onRoomUpdate(resizingRoom.id, { 
                    height: parseInt(e.target.value) 
                  })}
                />
              </label>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setResizingRoom(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div 
          className="context-menu-overlay"
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Grid;
