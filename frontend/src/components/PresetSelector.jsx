import React from 'react';
import { Palette, Check } from 'lucide-react';

const PresetSelector = ({ presets, onPresetSelect, selectedPreset }) => {
  return (
    <div className="preset-selector">
      <h3>
        <Palette size={20} />
        Quick Start Presets
      </h3>
      <p>Choose a preset to get started quickly with a pre-designed layout</p>
      
      <div className="presets-grid">
        {presets.map(preset => (
          <div
            key={preset.id}
            className={`preset-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
            onClick={() => onPresetSelect(preset)}
          >
            <div className="preset-header">
              <h4>{preset.name}</h4>
              {selectedPreset?.id === preset.id && (
                <Check size={16} className="selected-icon" />
              )}
            </div>
            <p className="preset-description">{preset.description}</p>
            <div className="preset-preview">
              {/* Mini preview of the preset layout */}
              <div className="preset-preview-grid">
                {preset.rooms.map((room, index) => (
                  <div
                    key={index}
                    className="preset-room-preview"
                    style={{
                      gridColumn: `${room.x + 1} / span ${room.width}`,
                      gridRow: `${room.y + 1} / span ${room.height}`,
                      backgroundColor: getRoomColor(room.type)
                    }}
                    title={room.type}
                  >
                    {getRoomIcon(room.type)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getRoomColor = (type) => {
  const colors = {
    bedroom: '#FFB6C1',
    bathroom: '#87CEEB',
    kitchen: '#F0E68C',
    living: '#98FB98',
    dining: '#DDA0DD',
    study: '#F5DEB3',
    office: '#E6E6FA',
    storage: '#D3D3D3'
  };
  return colors[type] || '#E0E0E0';
};

const getRoomIcon = (type) => {
  const icons = {
    bedroom: '🛏️',
    bathroom: '🚿',
    kitchen: '🍳',
    living: '🛋️',
    dining: '🍽️',
    study: '📚',
    office: '💼',
    storage: '📦'
  };
  return icons[type] || '🏠';
};

export default PresetSelector;
