# Floor Plan Context Documentation

## Grid System

- **Grid Size**: 15x15 cells
- **Cell Size**: 80 pixels per cell
- **Total Canvas**: 1200x1200 pixels

## Coordinate System

- **Origin**: Top-left corner (0,0)
- **X-axis**: Horizontal (left to right)
- **Y-axis**: Vertical (top to bottom)
- **All coordinates must be multiples of 80 pixels**

## Wall System

- **Walls**: Solid barriers that block movement
- **Doors**: Openings in walls (80px wide)
- **Windows**: Transparent openings in walls
- **Walls cannot overlap with doors or windows**

## Furniture Placement Rules

1. **Grid Alignment**: All furniture must align to 80-pixel grid
2. **No Overlaps**: Furniture cannot overlap with other furniture
3. **Wall Clearance**: Furniture cannot be placed on walls
4. **Door Access**: Furniture cannot block door openings
5. **Room Boundaries**: Furniture must stay within room boundaries

## Furniture Types and Sizes

- **Sofa**: 160x80px (2x1 cells) or 80x80px (1x1 cells)
- **Coffee Table**: 160x80px (2x1 cells) or 80x80px (1x1 cells)
- **Side Table**: 80x80px (1x1 cells)
- **Accent Chair**: 80x80px (1x1 cells)
- **Bed**: 160x160px (2x2 cells) or 80x160px (1x2 cells)
- **Nightstand**: 80x80px (1x1 cells)
- **Dresser**: 240x80px (3x1 cells) or 160x80px (2x1 cells)
- **Dining Table**: 240x160px (3x2 cells) or 160x160px (2x2 cells)
- **Dining Chair**: 80x80px (1x1 cells)
- **Kitchen Island**: 160x80px (2x1 cells) or 80x80px (1x1 cells)
- **Desk**: 160x80px (2x1 cells) or 80x80px (1x1 cells)
- **Bookshelf**: 160x240px (2x3 cells) or 80x240px (1x3 cells)

## Room Detection

- Rooms are automatically detected using flood-fill algorithm
- Each room has a unique ID and name
- Room names are used to determine appropriate furniture placement

## Design Principles

1. **Functionality**: Furniture should serve a purpose
2. **Flow**: Maintain clear pathways between rooms
3. **Proportion**: Furniture size should match room size
4. **Balance**: Distribute furniture evenly in large rooms
5. **Accessibility**: Ensure all areas are reachable
