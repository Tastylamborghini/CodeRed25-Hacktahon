import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Home, Settings, Palette, Download } from 'lucide-react';

const Toolbar = ({ roomTypes, presets, onPresetSelect, selectedPreset }) => {
  const [activeTab, setActiveTab] = useState('rooms');

  const DraggableRoomType = ({ roomType }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: `room-type-${roomType.id}`,
      data: {
        roomType: roomType.id
      }
    });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="draggable-room-type"
        {...attributes}
        {...listeners}
      >
        <div 
          className="room-type-card"
          style={{ backgroundColor: roomType.color }}
        >
          <span className="room-type-icon">{roomType.icon}</span>
          <span className="room-type-name">{roomType.name}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="toolbar">
      <div className="toolbar-tabs">
        <button 
          className={`tab ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          <Home size={16} />
          Rooms
        </button>
        <button 
          className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          <Palette size={16} />
          Presets
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      <div className="toolbar-content">
        {activeTab === 'rooms' && (
          <div className="room-types">
            <h3>Room Types</h3>
            <p className="toolbar-description">
              Drag and drop room types onto the grid to build your layout
            </p>
            <div className="room-types-grid">
              {roomTypes.map(roomType => (
                <DraggableRoomType key={roomType.id} roomType={roomType} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="presets">
            <h3>Layout Presets</h3>
            <p className="toolbar-description">
              Choose from pre-designed layouts optimized for different needs
            </p>
            <div className="presets-list">
              {presets.map(preset => (
                <div
                  key={preset.id}
                  className={`preset-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                  onClick={() => onPresetSelect(preset)}
                >
                  <div className="preset-header">
                    <h4>{preset.name}</h4>
                    {selectedPreset?.id === preset.id && (
                      <span className="selected-badge">Selected</span>
                    )}
                  </div>
                  <p className="preset-description">{preset.description}</p>
                  <div className="preset-preview">
                    {preset.rooms.map((room, index) => (
                      <div
                        key={index}
                        className="preset-room-mini"
                        style={{
                          gridColumn: `${room.x + 1} / span ${room.width}`,
                          gridRow: `${room.y + 1} / span ${room.height}`,
                          backgroundColor: roomTypes.find(rt => rt.id === room.type)?.color || '#E0E0E0'
                        }}
                      >
                        {roomTypes.find(rt => rt.id === room.type)?.icon}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings">
            <h3>Grid Settings</h3>
            <div className="setting-group">
              <label>
                Grid Size:
                <select>
                  <option value="8x8">8 × 8 (Small)</option>
                  <option value="10x10" selected>10 × 10 (Medium)</option>
                  <option value="12x12">12 × 12 (Large)</option>
                  <option value="15x15">15 × 15 (Extra Large)</option>
                </select>
              </label>
            </div>
            
            <div className="setting-group">
              <h4>Export Options</h4>
              <button className="btn btn-secondary">
                <Download size={16} />
                Export as Image
              </button>
              <button className="btn btn-secondary">
                <Download size={16} />
                Export as PDF
              </button>
            </div>

            <div className="setting-group">
              <h4>View Options</h4>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Show Grid Lines
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Show Room Labels
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                Show Measurements
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
