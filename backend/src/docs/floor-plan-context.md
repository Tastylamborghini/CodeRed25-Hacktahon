# Floor Plan JSON Format Documentation

## Overview

This document describes the JSON format used for floor plan data in the interior design application. The AI agent should use this information to provide accurate suggestions and modifications.

## JSON Structure

```json
{
  "walls": [
    {
      "x": 0.5,
      "y": 0.5,
      "type": "wall|door|window",
      "orientation": "horizontal|vertical"
    }
  ],
  "furniture": [
    {
      "name": "Item Name",
      "origin_x": 0,
      "origin_y": 0,
      "end_x": 1,
      "end_y": 1,
      "width": 1,
      "height": 1,
      "id": 1234567890
    }
  ],
  "rooms": [
    {
      "id": 1,
      "name": "Room Name",
      "cells": [
        { "r": 0, "c": 0 },
        { "r": 0, "c": 1 }
      ],
      "centerX": 20,
      "centerY": 20,
      "color": "#ffcc9980"
    }
  ],
  "metadata": {
    "gridSize": 15,
    "cellSize": 40,
    "name": "Floor Plan Name",
    "version": "1.0"
  }
}
```

## Grid System

### Grid Dimensions

- **Grid Size**: 15x15 cells (0-14 for both rows and columns)
- **Cell Size**: 80 pixels per cell
- **Total Canvas**: 1200x1200 pixels (15 \* 80)

### Coordinate System

- **Grid Coordinates**: Integer values (0-14)
- **Pixel Coordinates**: Calculated as `grid_coord * 80`
- **Cell Centers**: `(grid_coord + 0.5) * 80`

## Walls

### Wall Types

- **wall**: Solid wall (blocks movement)
- **door**: Doorway (allows movement)
- **window**: Window (blocks movement but allows light)

### Wall Constraints

- **Position**: Must be on grid lines (0.5, 1.5, 2.5, etc.)
- **Orientation**: Either "horizontal" or "vertical"
- **No Overlap**: Walls cannot overlap with furniture
- **Room Boundaries**: Walls define room boundaries

### Wall Placement Rules

- Horizontal walls: `y` coordinate must be 0.5, 1.5, 2.5, etc.
- Vertical walls: `x` coordinate must be 0.5, 1.5, 2.5, etc.
- Walls must connect to form enclosed rooms

## Furniture

### Furniture Constraints

- **Grid Alignment**: All furniture must align to full grid cells only
- **Integer Dimensions**: Width and height must be whole numbers (1, 2, 3, etc.)
- **Minimum Size**: Minimum 1x1 cells (80x80 pixels)
- **Maximum Size**: Limited by room size and grid boundaries
- **Size Types**: Full-cell only (1x1, 2x1, 3x2, etc. in 80px increments)

### Furniture Placement Rules

- **origin_x, origin_y**: Top-left corner in pixels
- **end_x, end_y**: Bottom-right corner in pixels
- **width, height**: Dimensions in pixels
- **Grid Conversion**: `grid_x = Math.floor(pixel_x / cellSize)`
- **Full-Cell Positioning**: `grid_col * cellSize` for alignment

### Collision Detection

- **No Overlap**: Furniture cannot overlap with other furniture
- **Wall Clearance**: Furniture cannot be placed on walls
- **Room Boundaries**: Furniture must be within room boundaries
- **Door Clearance**: Leave 1-cell clearance around doors
- **Door Blocking**: NEVER place furniture that blocks door openings
- **Furniture Stacking**: NEVER place furniture on top of other furniture

### Critical Placement Rules

#### Door Protection Rules

- **Door Access**: Always ensure doors remain accessible
- **Door Clearance**: Maintain at least 1-cell clearance around all doors
- **Door Blocking**: Furniture must NEVER block door openings
- **Traffic Flow**: Ensure clear paths to and from doors

#### Furniture Overlap Rules

- **No Stacking**: Furniture cannot be placed on top of other furniture
- **No Overlap**: All furniture must have distinct, non-overlapping positions
- **Collision Detection**: Check all furniture boundaries before placement
- **Space Validation**: Ensure sufficient space for furniture dimensions

#### Wall Interaction Rules

- **Wall Clearance**: Furniture cannot be placed on walls
- **Wall Adjacency**: Furniture can be placed adjacent to walls
- **Wall Blocking**: Furniture cannot block wall segments
- **Room Integrity**: Maintain room boundaries and structure

### Furniture Types and Recommendations

#### Living Room Furniture

- **Large Sofa**: 3-4 cells wide, 1-2 cells deep
- **Small Sofa**: 2-3 cells wide, 1 cell deep
- **Coffee Table**: 2-3 cells wide, 1 cell deep
- **TV Stand**: 2-4 cells wide, 1 cell deep
- **Side Tables**: 1 cell square
- **Accent Chairs**: 1x1 cells

#### Bedroom Furniture

- **Queen Bed**: 2-3 cells wide, 3-4 cells long
- **King Bed**: 3-4 cells wide, 4-5 cells long
- **Twin Bed**: 2-3 cells wide, 3-4 cells long
- **Nightstands**: 1 cell square
- **Dresser**: 2-4 cells wide, 1 cell deep
- **Wardrobe**: 1-2 cells wide, 2-3 cells deep

#### Kitchen Furniture

- **Kitchen Island**: 2-3 cells wide, 1-2 cells deep
- **Dining Table**: 2-4 cells wide, 2-3 cells long
- **Chairs**: 1 cell square
- **Storage**: 1-2 cells wide, 1 cell deep

#### Office Furniture

- **Large Desk**: 2-4 cells wide, 1-2 cells deep
- **Small Desk**: 2-3 cells wide, 1 cell deep
- **Chair**: 1 cell square
- **Bookshelf**: 1-2 cells wide, 1 cell deep
- **Storage**: 1-2 cells wide, 1 cell deep

## Rooms

### Room Detection

- Rooms are automatically detected based on wall boundaries
- Each room gets a unique ID and color
- Room names can be customized by users

### Room Constraints

- **Minimum Size**: Rooms must be at least 1x1 cells
- **Enclosed**: Rooms must be completely enclosed by walls
- **Accessible**: Rooms must have at least one door

### Room Types and Sizing

- **Living Room**: Minimum 6x4 cells, optimal 8x6 cells
- **Bedroom**: Minimum 4x4 cells, optimal 6x5 cells
- **Kitchen**: Minimum 4x3 cells, optimal 6x4 cells
- **Bathroom**: Minimum 3x3 cells, optimal 4x4 cells
- **Office**: Minimum 3x3 cells, optimal 4x4 cells
- **Hallway**: Minimum 1x3 cells, optimal 2x4 cells

## Design Principles

### Traffic Flow

- **Main Pathways**: 2-cell wide corridors
- **Secondary Pathways**: 1-cell wide passages
- **Door Clearance**: 1-cell clearance around doors
- **Furniture Spacing**: 1-cell clearance between furniture pieces

### Room Proportions

- **Golden Ratio**: Aim for 1.6:1 length-to-width ratio
- **Ceiling Height**: Assume 8-10 feet ceiling height
- **Window Placement**: Windows should face exterior walls
- **Door Placement**: Doors should not block furniture

### Furniture Placement Guidelines

- **Conversation Areas**: Group seating furniture in clusters
- **Traffic Flow**: Leave clear pathways between rooms
- **Natural Light**: Place seating near windows
- **Storage**: Place storage against walls
- **Symmetry**: Balance furniture placement for visual harmony

## AI Placement Validation Rules

### Critical Validation Checks

Before suggesting ANY furniture placement, the AI MUST:

1. **Check Door Clearance**: Ensure no furniture blocks door openings
2. **Check Furniture Overlap**: Verify no overlap with existing furniture
3. **Check Wall Clearance**: Ensure furniture doesn't overlap walls
4. **Check Room Boundaries**: Verify furniture fits within room
5. **Check Traffic Flow**: Maintain clear paths to doors

### Validation Algorithm

```javascript
// For each furniture placement, check:
function isValidPlacement(newFurniture, existingFurniture, walls, doors) {
  // 1. Check furniture overlap
  for (let furniture of existingFurniture) {
    if (overlaps(newFurniture, furniture)) return false;
  }

  // 2. Check wall collision
  if (collidesWithWalls(newFurniture, walls)) return false;

  // 3. Check door blocking
  if (blocksDoor(newFurniture, doors)) return false;

  // 4. Check room boundaries
  if (!withinRoom(newFurniture, room)) return false;

  return true;
}
```

### Error Prevention Rules

- **NEVER** suggest furniture that blocks doors
- **NEVER** suggest furniture that overlaps existing furniture
- **NEVER** suggest furniture that collides with walls
- **ALWAYS** validate placement before suggesting
- **ALWAYS** maintain clear access to doors

## Common Mistakes to Avoid

### Furniture Placement Errors

- ❌ Placing furniture on walls
- ❌ Overlapping furniture pieces
- ❌ Blocking doorways
- ❌ Creating half-cell furniture
- ❌ Placing furniture outside room boundaries
- ❌ Stacking furniture on top of other furniture
- ❌ Placing furniture without door clearance

### Wall Placement Errors

- ❌ Creating walls that don't connect
- ❌ Placing walls on furniture
- ❌ Creating inaccessible rooms
- ❌ Overlapping wall segments

### Room Design Errors

- ❌ Creating rooms that are too small
- ❌ Blocking natural light sources
- ❌ Creating dead-end spaces
- ❌ Ignoring traffic flow patterns

## AI Agent Instructions

When suggesting modifications to floor plans:

1. **Analyze Current Layout**: Understand existing walls, furniture, and rooms
2. **Identify Issues**: Look for design problems, space inefficiencies, or constraint violations
3. **Suggest Improvements**: Provide specific, actionable recommendations
4. **Respect Constraints**: Ensure all suggestions follow the rules above
5. **Provide Alternatives**: Offer multiple options when possible
6. **Explain Reasoning**: Explain why each suggestion improves the design

### Response Format

When providing suggestions, include:

- **Specific Coordinates**: Exact pixel coordinates for new furniture
- **Room Recommendations**: Which room each piece should go in
- **Size Justifications**: Why specific dimensions are recommended
- **Placement Reasoning**: Why the suggested location is optimal
- **Alternative Options**: Other viable placement options

### Example Response Format

```
Based on your floor plan analysis, I recommend:

1. **Living Room Sofa**: Place a 3-cell wide sofa at coordinates (120, 80) to (240, 120)
   - Reason: Centered in the room with 1-cell clearance from walls
   - Alternative: Place at (80, 80) to (200, 120) for more space

2. **Coffee Table**: Add a 2-cell wide table at (160, 140) to (240, 180)
   - Reason: 1-cell clearance from sofa, accessible from all sides
   - Alternative: 1-cell wide table at (180, 140) to (220, 180)

3. **Design Tip**: Consider adding a rug under the seating area to define the space
```

Remember: Always provide specific, actionable suggestions that respect the grid system and design constraints.
