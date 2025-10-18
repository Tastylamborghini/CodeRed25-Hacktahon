import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Home, Settings, Layers, Download, ArrowLeft, 
  Bed, Droplets, ChefHat, Sofa, UtensilsCrossed, BookOpen, Briefcase, Package 
} from 'lucide-react';

const Toolbar = ({ 
  categories, 
  activeCategory, 
  onCategorySelect, 
  roomTypes, 
  presets, 
  onPresetSelect, 
  selectedPreset 
}) => {
  const getIconComponent = (iconName, size = 16) => {
    const iconMap = {
      'home': <Home size={size} />,
      'layers': <Layers size={size} />,
      'settings': <Settings size={size} />,
      'bed': <Bed size={size} />,
      'shower': <Droplets size={size} />,
      'chef-hat': <ChefHat size={size} />,
      'sofa': <Sofa size={size} />,
      'utensils': <UtensilsCrossed size={size} />,
      'book-open': <BookOpen size={size} />,
      'briefcase': <Briefcase size={size} />,
      'package': <Package size={size} />
    };
    return iconMap[iconName] || <Home size={size} />;
  };

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
          <span className="room-type-icon">{getIconComponent(roomType.icon, 18)}</span>
          <span className="room-type-name">{roomType.name}</span>
        </div>
      </div>
    );
  };

  const renderCategoryView = () => (
    <div className="category-view">
      <h3>Choose a Category</h3>
      <p className="toolbar-description">
        Select a category to access its tools and options
      </p>
      <div className="categories-grid">
        {categories.map(category => (
          <button
            key={category.id}
            className="category-card"
            onClick={() => onCategorySelect(category.id)}
            style={{ '--category-color': category.color }}
          >
            <div className="category-icon">{getIconComponent(category.icon, 20)}</div>
            <div className="category-info">
              <h4>{category.name}</h4>
              <p>{category.description}</p>
            </div>
            <div className="category-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDetailView = () => {
    const category = categories.find(cat => cat.id === activeCategory);
    
    return (
      <div className="detail-view">
        <div className="detail-header">
          <button 
            className="back-button"
            onClick={() => onCategorySelect(null)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="detail-title">
            <span className="detail-icon">{getIconComponent(category?.icon, 18)}</span>
            <h3>{category?.name}</h3>
          </div>
        </div>

        <div className="detail-content">
          {activeCategory === 'rooms' && (
            <div className="room-types">
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

          {activeCategory === 'presets' && (
            <div className="presets">
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

          {activeCategory === 'settings' && (
            <div className="settings">
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

  return (
    <div className="toolbar">
      <div className="toolbar-content">
        {!activeCategory ? renderCategoryView() : renderDetailView()}
      </div>
    </div>
  );
};

export default Toolbar;
