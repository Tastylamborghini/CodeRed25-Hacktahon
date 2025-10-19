const API_BASE_URL = 'http://localhost:3001/api';

// Convert frontend state to backend JSON format
export const convertToBackendFormat = (state, rooms, gridSize, cellSize) => {
    const walls = [];
    const furniture = [];
    const roomsData = [];

    // Convert walls
    // Horizontal walls
    for (let r = 0; r < state.horizontalWalls.length; r++) {
        for (let c = 0; c < state.horizontalWalls[r].length; c++) {
            const wallType = state.horizontalWalls[r][c];
            if (wallType !== 0) { // 0 = NONE
                const type = wallType === 1 ? 'wall' : wallType === 2 ? 'door' : 'window';
                walls.push({
                    x: (c + 0.5) * cellSize,
                    y: (r + 0.5) * cellSize,
                    type: type,
                    orientation: 'horizontal'
                });
            }
        }
    }

    // Vertical walls
    for (let r = 0; r < state.verticalWalls.length; r++) {
        for (let c = 0; c < state.verticalWalls[r].length; c++) {
            const wallType = state.verticalWalls[r][c];
            if (wallType !== 0) { // 0 = NONE
                const type = wallType === 1 ? 'wall' : wallType === 2 ? 'door' : 'window';
                walls.push({
                    x: (c + 0.5) * cellSize,
                    y: (r + 0.5) * cellSize,
                    type: type,
                    orientation: 'vertical'
                });
            }
        }
    }

    // Convert furniture
    state.furniture.forEach(item => {
        furniture.push({
            name: item.name,
            origin_x: item.col * cellSize,
            origin_y: item.row * cellSize,
            end_x: (item.col + item.w) * cellSize,
            end_y: (item.row + item.h) * cellSize,
            width: item.w * cellSize,
            height: item.h * cellSize
        });
    });

    // Convert rooms
    rooms.forEach(room => {
        roomsData.push({
            id: room.id,
            name: room.name,
            cells: room.cells,
            centerX: room.centerX,
            centerY: room.centerY,
            color: room.color
        });
    });

    return {
        walls,
        furniture,
        rooms: roomsData,
        metadata: {
            gridSize,
            cellSize,
            name: `Floor Plan ${new Date().toLocaleDateString()}`,
            version: '1.0'
        }
    };
};

// Convert backend JSON format to frontend state
export const convertFromBackendFormat = (data) => {
    const gridSize = data.metadata?.gridSize || 15;
    const cellSize = data.metadata?.cellSize || 40;
    const WALL_TYPE = { NONE: 0, WALL: 1, DOOR: 2, WINDOW: 3 };

    // Initialize state
    const state = {
        horizontalWalls: Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(WALL_TYPE.NONE)),
        verticalWalls: Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(WALL_TYPE.NONE)),
        furniture: []
    };

    // Convert walls back
    data.walls?.forEach(wall => {
        const gridX = Math.floor(wall.x / cellSize - 0.5);
        const gridY = Math.floor(wall.y / cellSize - 0.5);
        
        let wallType = WALL_TYPE.WALL;
        if (wall.type === 'door') wallType = WALL_TYPE.DOOR;
        else if (wall.type === 'window') wallType = WALL_TYPE.WINDOW;

        if (wall.orientation === 'horizontal' && gridY >= 0 && gridY <= gridSize && gridX >= 0 && gridX < gridSize) {
            state.horizontalWalls[gridY][gridX] = wallType;
        } else if (wall.orientation === 'vertical' && gridY >= 0 && gridY < gridSize && gridX >= 0 && gridX <= gridSize) {
            state.verticalWalls[gridY][gridX] = wallType;
        }
    });

    // Convert furniture back
    data.furniture?.forEach((item, index) => {
        state.furniture.push({
            id: Date.now() + index, // Generate new ID
            name: item.name,
            col: Math.floor(item.origin_x / cellSize),
            row: Math.floor(item.origin_y / cellSize),
            w: Math.floor((item.end_x - item.origin_x) / cellSize),
            h: Math.floor((item.end_y - item.origin_y) / cellSize)
        });
    });

    return { state, rooms: data.rooms || [], gridSize, cellSize };
};

// API calls
export const saveFloorPlan = async (state, rooms, gridSize, cellSize) => {
    try {
        console.log('Converting to backend format...', { state, rooms, gridSize, cellSize });
        const data = convertToBackendFormat(state, rooms, gridSize, cellSize);
        console.log('Converted data:', data);
        
        console.log('Sending request to:', `${API_BASE_URL}/floor-plans`);
        const response = await fetch(`${API_BASE_URL}/floor-plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Save result:', result);
        return result;
    } catch (error) {
        console.error('Error saving floor plan:', error);
        throw error;
    }
};

export const loadFloorPlan = async (filename) => {
    try {
        const response = await fetch(`${API_BASE_URL}/floor-plans/${filename}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return convertFromBackendFormat(data);
    } catch (error) {
        console.error('Error loading floor plan:', error);
        throw error;
    }
};

export const listFloorPlans = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/floor-plans`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error listing floor plans:', error);
        throw error;
    }
};

export const deleteFloorPlan = async (filename) => {
    try {
        const response = await fetch(`${API_BASE_URL}/floor-plans/${filename}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting floor plan:', error);
        throw error;
    }
};
