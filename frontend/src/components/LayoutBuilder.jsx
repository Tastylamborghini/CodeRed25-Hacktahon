import React, { useState, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Grid from './Grid';
import RoomCard from './RoomCard';
import Toolbar from './Toolbar';
import AIHelper from './AIHelper';
import PresetSelector from './PresetSelector';
import { Plus, RotateCcw, Save, Download, Menu, X } from 'lucide-react';

const LayoutBuilder = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [draggedRoom, setDraggedRoom] = useState(null);
  const [gridSize, setGridSize] = useState({ rows: 10, cols: 10 });
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const roomTypes = [
    { id: 'bedroom', name: 'Bedroom', color: '#f8fafc', icon: 'bed' },
    { id: 'bathroom', name: 'Bathroom', color: '#f1f5f9', icon: 'shower' },
    { id: 'kitchen', name: 'Kitchen', color: '#f8fafc', icon: 'chef-hat' },
    { id: 'living', name: 'Living Room', color: '#f1f5f9', icon: 'sofa' },
    { id: 'dining', name: 'Dining Room', color: '#f8fafc', icon: 'utensils' },
    { id: 'study', name: 'Study Room', color: '#f1f5f9', icon: 'book-open' },
    { id: 'office', name: 'Office', color: '#f8fafc', icon: 'briefcase' },
    { id: 'storage', name: 'Storage', color: '#f1f5f9', icon: 'package' }
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

  const categories = [
    {
      id: 'rooms',
      name: 'Rooms',
      icon: 'home',
      description: 'Drag and drop room types to build your layout',
      color: '#6366f1'
    },
    {
      id: 'presets',
      name: 'Presets',
      icon: 'layers',
      description: 'Choose from pre-designed layouts',
      color: '#8b5cf6'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: 'settings',
      description: 'Configure grid and export options',
      color: '#64748b'
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
          <div className="builder-header-left">
            <button 
              className="toolbar-toggle"
              onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
              title={isToolbarExpanded ? "Hide Toolbar" : "Show Toolbar"}
            >
              {isToolbarExpanded ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="builder-title">Home Layout Optimizer</h1>
          </div>
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
          {isToolbarExpanded && (
            <Toolbar 
              categories={categories}
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
              roomTypes={roomTypes}
              presets={presets}
              onPresetSelect={applyPreset}
              selectedPreset={selectedPreset}
            />
          )}
          
          <div className={`workspace-container ${!isToolbarExpanded ? 'full-width' : ''}`}>
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
