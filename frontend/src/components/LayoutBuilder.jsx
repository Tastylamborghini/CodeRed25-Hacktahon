import React, { useState, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Grid, RoomCard, Toolbar, AIHelper, PresetSelector } from './index';
import { Plus, RotateCcw, Save, Download } from 'lucide-react';

const LayoutBuilder = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [draggedRoom, setDraggedRoom] = useState(null);
  const [gridSize, setGridSize] = useState({ rows: 10, cols: 10 });
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const roomTypes = [
    { id: 'bedroom', name: 'Bedroom', color: '#FFB6C1', icon: '🛏️' },
    { id: 'bathroom', name: 'Bathroom', color: '#87CEEB', icon: '🚿' },
    { id: 'kitchen', name: 'Kitchen', color: '#F0E68C', icon: '🍳' },
    { id: 'living', name: 'Living Room', color: '#98FB98', icon: '🛋️' },
    { id: 'dining', name: 'Dining Room', color: '#DDA0DD', icon: '🍽️' },
    { id: 'study', name: 'Study Room', color: '#F5DEB3', icon: '📚' },
    { id: 'office', name: 'Office', color: '#E6E6FA', icon: '💼' },
    { id: 'storage', name: 'Storage', color: '#D3D3D3', icon: '📦' }
  ];

  const presets = [
    {
      id: 'accessibility',
      name: 'Accessibility Focused',
      description: 'Optimized for wheelchair access and mobility aids',
      rooms: [
        { type: 'bedroom', x: 1, y: 1, width: 3, height: 2 },
        { type: 'bathroom', x: 4, y: 1, width: 2, height: 2 },
        { type: 'living', x: 1, y: 3, width: 4, height: 3 }
      ]
    },
    {
      id: 'space-optimized',
      name: 'Space Optimized',
      description: 'Maximizes space efficiency for smaller homes',
      rooms: [
        { type: 'bedroom', x: 1, y: 1, width: 2, height: 2 },
        { type: 'kitchen', x: 3, y: 1, width: 2, height: 2 },
        { type: 'living', x: 1, y: 3, width: 4, height: 2 },
        { type: 'bathroom', x: 5, y: 3, width: 1, height: 2 }
      ]
    },
    {
      id: 'open-concept',
      name: 'Open Concept',
      description: 'Modern open floor plan design',
      rooms: [
        { type: 'living', x: 1, y: 1, width: 5, height: 3 },
        { type: 'kitchen', x: 1, y: 4, width: 3, height: 2 },
        { type: 'dining', x: 4, y: 4, width: 2, height: 2 }
      ]
    }
  ];

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setDraggedRoom(active);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (over && over.id.startsWith('grid-')) {
      const [_, x, y] = over.id.split('-');
      const roomType = active.data.current?.roomType;
      
      if (roomType) {
        const newRoom = {
          id: `${roomType}-${Date.now()}`,
          type: roomType,
          x: parseInt(x),
          y: parseInt(y),
          width: 2,
          height: 2,
          structuralElements: []
        };
        
        setRooms(prev => [...prev, newRoom]);
      }
    }
    
    setDraggedRoom(null);
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const handleRoomUpdate = (roomId, updates) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    ));
  };

  const handleRoomDelete = (roomId) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(null);
    }
  };

  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    const presetRooms = preset.rooms.map((room, index) => ({
      id: `${room.type}-${Date.now()}-${index}`,
      type: room.type,
      x: room.x,
      y: room.y,
      width: room.width,
      height: room.height,
      structuralElements: []
    }));
    setRooms(presetRooms);
  };

  const clearLayout = () => {
    setRooms([]);
    setSelectedRoom(null);
    setSelectedPreset(null);
  };

  const saveLayout = () => {
    const layoutData = {
      rooms,
      gridSize,
      preset: selectedPreset?.id,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="layout-builder">
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="builder-header">
          <h1 className="builder-title">Home Layout Optimizer</h1>
          <div className="builder-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowAIHelper(!showAIHelper)}
            >
              AI Helper
            </button>
            <button className="btn btn-secondary" onClick={clearLayout}>
              <RotateCcw size={16} />
              Clear
            </button>
            <button className="btn btn-primary" onClick={saveLayout}>
              <Save size={16} />
              Save Layout
            </button>
          </div>
        </div>

        <div className="builder-content">
          <Toolbar 
            roomTypes={roomTypes}
            presets={presets}
            onPresetSelect={applyPreset}
            selectedPreset={selectedPreset}
          />
          
          <div className="workspace-container">
            <Grid
              rooms={rooms}
              gridSize={gridSize}
              onRoomClick={handleRoomClick}
              onRoomUpdate={handleRoomUpdate}
              onRoomDelete={handleRoomDelete}
              selectedRoom={selectedRoom}
            />
            
            {showAIHelper && (
              <AIHelper 
                rooms={rooms}
                onSuggestionApply={(suggestions) => {
                  // Apply AI suggestions to rooms
                  console.log('Applying AI suggestions:', suggestions);
                }}
              />
            )}
          </div>
        </div>

        <DragOverlay>
          {draggedRoom ? (
            <div className="dragging-room">
              {roomTypes.find(rt => rt.id === draggedRoom.data.current?.roomType)?.icon}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default LayoutBuilder;
