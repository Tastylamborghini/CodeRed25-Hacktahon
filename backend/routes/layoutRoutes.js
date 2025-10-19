const express = require('express');

const router = express.Router();

// GET /api/layout/presets - Get available layout presets
router.get('/presets', (req, res) => {
  const presets = {
    accessibility: {
      name: 'Accessibility Optimized',
      description: 'Layout optimized for wheelchair accessibility and universal design',
      features: ['Wide pathways', 'Lower counter heights', 'Accessible storage', 'Clear sight lines']
    },
    spaceOptimized: {
      name: 'Space Maximized',
      description: 'Layout optimized for maximum usable space in small areas',
      features: ['Multi-functional furniture', 'Vertical storage', 'Open floor plans', 'Hidden storage']
    },
    openConcept: {
      name: 'Open Concept',
      description: 'Modern open floor plan layout',
      features: ['Connected living spaces', 'Natural light flow', 'Flexible zones', 'Minimal walls']
    },
    traditional: {
      name: 'Traditional',
      description: 'Classic room separation with defined spaces',
      features: ['Separate rooms', 'Formal dining', 'Private spaces', 'Traditional furniture placement']
    }
  };

  res.json({ presets, success: true });
});

// GET /api/layout/room-types - Get available room types
router.get('/room-types', (req, res) => {
  const roomTypes = [
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️', defaultSize: { width: 12, height: 10 } },
    { id: 'living-room', name: 'Living Room', icon: '🛋️', defaultSize: { width: 16, height: 12 } },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳', defaultSize: { width: 10, height: 8 } },
    { id: 'bathroom', name: 'Bathroom', icon: '🚿', defaultSize: { width: 8, height: 6 } },
    { id: 'dining-room', name: 'Dining Room', icon: '🍽️', defaultSize: { width: 12, height: 10 } },
    { id: 'study', name: 'Study/Office', icon: '📚', defaultSize: { width: 10, height: 8 } },
    { id: 'laundry', name: 'Laundry Room', icon: '🧺', defaultSize: { width: 6, height: 6 } },
    { id: 'garage', name: 'Garage', icon: '🚗', defaultSize: { width: 20, height: 12 } }
  ];

  res.json({ roomTypes, success: true });
});

// POST /api/layout/validate - Validate layout structure
router.post('/validate', (req, res) => {
  const { layout } = req.body;

  if (!layout) {
    return res.status(400).json({ error: 'Layout data is required' });
  }

  // Basic validation
  const errors = [];
  const warnings = [];

  if (!layout.rooms || !Array.isArray(layout.rooms)) {
    errors.push('Layout must contain a rooms array');
  }

  if (layout.rooms && layout.rooms.length === 0) {
    warnings.push('Layout has no rooms');
  }

  // Check for overlapping rooms
  if (layout.rooms && layout.rooms.length > 1) {
    for (let i = 0; i < layout.rooms.length; i++) {
      for (let j = i + 1; j < layout.rooms.length; j++) {
        const room1 = layout.rooms[i];
        const room2 = layout.rooms[j];
        
        if (isOverlapping(room1, room2)) {
          errors.push(`Rooms "${room1.name}" and "${room2.name}" are overlapping`);
        }
      }
    }
  }

  res.json({
    valid: errors.length === 0,
    errors,
    warnings,
    success: true
  });
});

// Helper function to check if two rooms overlap
function isOverlapping(room1, room2) {
  return !(room1.x + room1.width <= room2.x || 
           room2.x + room2.width <= room1.x || 
           room1.y + room1.height <= room2.y || 
           room2.y + room2.height <= room1.y);
}

module.exports = router;
