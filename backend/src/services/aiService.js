const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load AI context documentation
let contextDocumentation = '';
let templateFloorPlan = {};

try {
    const contextPath = path.join(__dirname, '../docs/floor-plan-context.md');
    const templatePath = path.join(__dirname, '../docs/template-floor-plan.json');
    
    if (fs.existsSync(contextPath)) {
        contextDocumentation = fs.readFileSync(contextPath, 'utf8');
    }
    
    if (fs.existsSync(templatePath)) {
        templateFloorPlan = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    }
} catch (error) {
    console.log('Warning: Could not load AI context files:', error.message);
}

// Analyze floor plan structure
const analyzeFloorPlan = (floorPlanData) => {
    const rooms = floorPlanData.rooms || [];
    const furniture = floorPlanData.furniture || [];
    
    const roomCount = rooms.length;
    const totalArea = rooms.reduce((sum, room) => sum + (room.cells ? room.cells.length : 0), 0);
    const roomTypes = rooms.map(room => room.name).filter((name, index, arr) => arr.indexOf(name) === index);
    const furnitureCount = furniture.length;
    
    const roomSizes = rooms.map(room => ({
        name: room.name,
        size: room.cells ? room.cells.length : 0,
        isLarge: room.cells ? room.cells.length > 20 : false,
        isSmall: room.cells ? room.cells.length < 6 : false
    }));
    
    const hasLargeRooms = roomSizes.some(room => room.isLarge);
    const hasSmallRooms = roomSizes.some(room => room.isSmall);
    
    return {
        roomCount,
        totalArea,
        roomTypes,
        furnitureCount,
        roomSizes,
        hasLargeRooms,
        hasSmallRooms
    };
};

// Generate design tips based on analysis
const generateDesignTips = (analysis) => {
    const tips = [];
    
    if (analysis.hasLargeRooms) {
        tips.push("Consider creating distinct zones in large rooms for better functionality");
    }
    
    if (analysis.hasSmallRooms) {
        tips.push("Maximize small room efficiency with multi-functional furniture");
    }
    
    if (analysis.furnitureCount === 0) {
        tips.push("Start by adding essential furniture pieces like seating and storage");
    }
    
    if (analysis.roomCount > 5) {
        tips.push("Ensure good flow between rooms with proper door placement");
    }
    
    return tips;
};

// Helper function to parse user message for furniture requests
const parseFurnitureRequest = (message) => {
    const furnitureTypes = [];
    const lowerMessage = message.toLowerCase();
    
    // Common furniture keywords
    const furnitureKeywords = {
        'sofa': ['sofa', 'couch', 'loveseat'],
        'coffee table': ['coffee table', 'coffee', 'table'],
        'side table': ['side table', 'end table'],
        'accent chair': ['accent chair', 'chair', 'armchair'],
        'bed': ['bed', 'queen bed', 'king bed', 'twin bed'],
        'nightstand': ['nightstand', 'night stand'],
        'dresser': ['dresser', 'chest of drawers'],
        'dining table': ['dining table', 'dinner table'],
        'chair': ['chair', 'dining chair'],
        'kitchen island': ['kitchen island', 'island'],
        'desk': ['desk', 'writing desk'],
        'bookshelf': ['bookshelf', 'bookcase', 'shelf']
    };
    
    // Check for specific furniture mentions
    Object.entries(furnitureKeywords).forEach(([furnitureType, keywords]) => {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            furnitureTypes.push(furnitureType);
        }
    });
    
    // If user asks for general suggestions, return empty array (no auto-furniture)
    if (lowerMessage.includes('suggest') && !lowerMessage.includes('add') && !lowerMessage.includes('place')) {
        return [];
    }
    
    return furnitureTypes;
};

// Helper function to determine if furniture should be added to a room
const shouldAddFurnitureToRoom = (furnitureType, roomName) => {
    const room = roomName.toLowerCase();
    
    switch (furnitureType) {
        case 'sofa':
        case 'coffee table':
        case 'side table':
        case 'accent chair':
            return room.includes('living') || room.includes('family') || room.includes('lounge');
        case 'bed':
        case 'nightstand':
        case 'dresser':
            return room.includes('bedroom') || room.includes('master');
        case 'dining table':
        case 'chair':
            return room.includes('dining') || room.includes('kitchen');
        case 'kitchen island':
            return room.includes('kitchen');
        case 'desk':
            return room.includes('office') || room.includes('study') || room.includes('bedroom');
        case 'bookshelf':
            return room.includes('living') || room.includes('office') || room.includes('study');
        default:
            return false;
    }
};

// Helper function to create furniture objects
const createFurniture = (furnitureType, minC, minR, maxC, maxR, furnitureId, attempt = 0) => {
    const roomWidth = maxC - minC;
    const roomHeight = maxR - minR;
    const cellSize = 80; // Use 80-pixel increments
    
    // Adjust positioning based on attempt
    const offsetX = attempt * 1; // Try different X positions
    const offsetY = attempt * 1; // Try different Y positions
    
    switch (furnitureType) {
        case 'sofa':
            const sofaWidth = Math.min(2, roomWidth); // Don't subtract 1, use full room width
            if (sofaWidth >= 1) {
                return {
                    name: sofaWidth >= 2 ? 'Large Sofa' : 'Loveseat',
                    origin_x: (minC + offsetX) * cellSize, // Start at room edge + offset
                    origin_y: (minR + offsetY) * cellSize, // Start at room edge + offset
                    end_x: (minC + offsetX + sofaWidth) * cellSize,
                    end_y: (minR + offsetY + 1) * cellSize, // 1 cell height
                    width: sofaWidth * cellSize,
                    height: cellSize,
                    id: furnitureId
                };
            }
            break;
        case 'coffee table':
            if (roomHeight >= 1) { // Reduced requirement to work with 2-row rooms
                const tableWidth = Math.min(2, roomWidth); // Don't subtract 2
                if (tableWidth >= 1) {
                    return {
                        name: 'Coffee Table',
                        origin_x: (minC + offsetX) * cellSize,
                        origin_y: (minR + offsetY) * cellSize, // Place in first row + offset
                        end_x: (minC + offsetX + tableWidth) * cellSize,
                        end_y: (minR + offsetY + 1) * cellSize,
                        width: tableWidth * cellSize,
                        height: cellSize,
                        id: furnitureId
                    };
                }
            }
            break;
        case 'side table':
            return {
                name: 'Side Table',
                origin_x: (minC + offsetX) * cellSize,
                origin_y: (minR + offsetY) * cellSize,
                end_x: (minC + offsetX + 1) * cellSize,
                end_y: (minR + offsetY + 1) * cellSize,
                width: cellSize,
                height: cellSize,
                id: furnitureId
            };
        case 'accent chair':
            return {
                name: 'Accent Chair',
                origin_x: (minC + 2) * cellSize,
                origin_y: minR * cellSize,
                end_x: (minC + 3) * cellSize,
                end_y: (minR + 1) * cellSize,
                width: cellSize,
                height: cellSize,
                id: furnitureId
            };
        case 'bed':
            const bedWidth = Math.min(2, roomWidth);
            const bedHeight = Math.min(2, roomHeight);
            if (bedWidth >= 1 && bedHeight >= 1) {
                return {
                    name: bedWidth >= 2 ? 'Queen Bed' : 'Twin Bed',
                    origin_x: minC * cellSize,
                    origin_y: minR * cellSize,
                    end_x: (minC + bedWidth) * cellSize,
                    end_y: (minR + bedHeight) * cellSize,
                    width: bedWidth * cellSize,
                    height: bedHeight * cellSize,
                    id: furnitureId
                };
            }
            break;
        case 'nightstand':
            return {
                name: 'Nightstand',
                origin_x: (minC + 2) * cellSize,
                origin_y: minR * cellSize,
                end_x: (minC + 3) * cellSize,
                end_y: (minR + 1) * cellSize,
                width: cellSize,
                height: cellSize,
                id: furnitureId
            };
        case 'dresser':
            const dresserWidth = Math.min(3, roomWidth);
            if (dresserWidth >= 2) {
                return {
                    name: 'Dresser',
                    origin_x: minC * cellSize,
                    origin_y: (minR + 2) * cellSize,
                    end_x: (minC + dresserWidth) * cellSize,
                    end_y: (minR + 3) * cellSize,
                    width: dresserWidth * cellSize,
                    height: cellSize,
                    id: furnitureId
                };
            }
            break;
        case 'dining table':
            const tableWidth = Math.min(3, roomWidth);
            const tableHeight = Math.min(2, roomHeight);
            if (tableWidth >= 2 && tableHeight >= 1) {
                return {
                    name: 'Dining Table',
                    origin_x: minC * cellSize,
                    origin_y: minR * cellSize,
                    end_x: (minC + tableWidth) * cellSize,
                    end_y: (minR + tableHeight) * cellSize,
                    width: tableWidth * cellSize,
                    height: tableHeight * cellSize,
                    id: furnitureId
                };
            }
            break;
        case 'chair':
            return {
                name: 'Dining Chair',
                origin_x: (minC + 1) * cellSize,
                origin_y: (minR + 2) * cellSize,
                end_x: (minC + 2) * cellSize,
                end_y: (minR + 3) * cellSize,
                width: cellSize,
                height: cellSize,
                id: furnitureId
            };
        case 'kitchen island':
            if (roomWidth >= 3 && roomHeight >= 2) { // Reduced requirements
                const islandWidth = Math.min(2, roomWidth - 1);
                const islandHeight = Math.min(1, roomHeight - 1);
                if (islandWidth >= 1 && islandHeight >= 1) {
                    return {
                        name: islandWidth >= 2 ? 'Kitchen Island' : 'Small Island',
                        origin_x: (minC + 1) * cellSize,
                        origin_y: (minR + 1) * cellSize,
                        end_x: (minC + 1 + islandWidth) * cellSize,
                        end_y: (minR + 1 + islandHeight) * cellSize,
                        width: islandWidth * cellSize,
                        height: islandHeight * cellSize,
                        id: furnitureId
                    };
                }
            }
            break;
        case 'desk':
            const deskWidth = Math.min(2, roomWidth);
            if (deskWidth >= 1) {
                return {
                    name: 'Desk',
                    origin_x: minC * cellSize,
                    origin_y: minR * cellSize,
                    end_x: (minC + deskWidth) * cellSize,
                    end_y: (minR + 1) * cellSize,
                    width: deskWidth * cellSize,
                    height: cellSize,
                    id: furnitureId
                };
            }
            break;
        case 'bookshelf':
            const shelfWidth = Math.min(2, roomWidth);
            const shelfHeight = Math.min(3, roomHeight);
            if (shelfWidth >= 1 && shelfHeight >= 1) {
                return {
                    name: 'Bookshelf',
                    origin_x: (minC + roomWidth - shelfWidth) * cellSize,
                    origin_y: minR * cellSize,
                    end_x: (minC + roomWidth) * cellSize,
                    end_y: (minR + shelfHeight) * cellSize,
                    width: shelfWidth * cellSize,
                    height: shelfHeight * cellSize,
                    id: furnitureId
                };
            }
            break;
    }
    return null;
};

// Helper function to check if furniture overlaps with existing furniture
const checkFurnitureOverlap = (newFurniture, existingFurniture) => {
    for (const existing of existingFurniture) {
        if (newFurniture.origin_x < existing.end_x &&
            newFurniture.end_x > existing.origin_x &&
            newFurniture.origin_y < existing.end_y &&
            newFurniture.end_y > existing.origin_y) {
            return true;
        }
    }
    return false;
};

// Helper function to check if furniture collides with walls
const checkWallCollision = (furniture, walls) => {
    for (const wall of walls) {
        // Check if furniture overlaps with wall
        if (furniture.origin_x < wall.end_x &&
            furniture.end_x > wall.origin_x &&
            furniture.origin_y < wall.end_y &&
            furniture.end_y > wall.origin_y) {
            return true;
        }
    }
    return false;
};

// Helper function to check if furniture blocks doors
const checkDoorBlocking = (furniture, doors) => {
    for (const door of doors) {
        // Check if furniture overlaps with door
        if (furniture.origin_x < door.end_x &&
            furniture.end_x > door.origin_x &&
            furniture.origin_y < door.end_y &&
            furniture.end_y > door.origin_y) {
            return true;
        }
    }
    return false;
};

// Helper function to safely add furniture
const addFurnitureSafely = (furniture, newFurniture, existingFurniture, walls, doors, room) => {
    // Check if furniture fits within room bounds
    const roomCells = room.cells || [];
    if (roomCells.length === 0) return false;
    
    const minC = Math.min(...roomCells.map(c => c.c));
    const maxC = Math.max(...roomCells.map(c => c.c));
    const minR = Math.min(...roomCells.map(c => c.r));
    const maxR = Math.max(...roomCells.map(c => c.r));
    
    const cellSize = 80;
    const roomMinX = minC * cellSize;
    const roomMaxX = (maxC + 1) * cellSize;
    const roomMinY = minR * cellSize;
    const roomMaxY = (maxR + 1) * cellSize;
    
    // Check if furniture is within room bounds
    if (furniture.origin_x < roomMinX || furniture.end_x > roomMaxX ||
        furniture.origin_y < roomMinY || furniture.end_y > roomMaxY) {
        return false;
    }
    
    // Check for overlaps with existing furniture
    if (checkFurnitureOverlap(furniture, existingFurniture)) {
        console.log(`❌ Furniture overlap with ${existingFurniture.find(f => 
            furniture.origin_x < f.end_x && furniture.end_x > f.origin_x &&
            furniture.origin_y < f.end_y && furniture.end_y > f.origin_y
        )?.name || 'Unknown'}`);
        return false;
    }
    
    // Check for wall collisions
    if (checkWallCollision(furniture, walls)) {
        console.log(`❌ Furniture collision with wall`);
        return false;
    }
    
    // Check for door blocking
    if (checkDoorBlocking(furniture, doors)) {
        console.log(`❌ Furniture blocks door`);
        return false;
    }
    
    console.log(`Validating furniture: ${furniture.name} at (${furniture.origin_x}, ${furniture.origin_y})`);
    console.log(`Walls count: ${walls.length}, Doors count: ${doors.length}`);
    
    newFurniture.push(furniture);
    return true;
};

// Generate updated floor plan with furniture
const generateUpdatedFloorPlan = (originalData, analysis, userMessage) => {
    console.log('=== generateUpdatedFloorPlan called ===');
    console.log('Original data:', !!originalData);
    console.log('Analysis:', analysis);
    console.log('User message:', userMessage);
    
    const updatedData = JSON.parse(JSON.stringify(originalData));
    const rooms = updatedData.rooms || [];
    const existingFurniture = updatedData.furniture || [];
    const newFurniture = [];
    
    console.log('Rooms count:', rooms.length);
    
    const requestedFurniture = parseFurnitureRequest(userMessage);
    console.log('Requested furniture:', requestedFurniture);
    
    if (requestedFurniture.length === 0) {
        console.log('No specific furniture requested, returning original data');
        return updatedData;
    }
    
    let furnitureId = Date.now();
    
    rooms.forEach(room => {
        const roomCells = room.cells || [];
        if (roomCells.length === 0) return;
        
        const minC = Math.min(...roomCells.map(c => c.c));
        const maxC = Math.max(...roomCells.map(c => c.c));
        const minR = Math.min(...roomCells.map(c => c.r));
        const maxR = Math.max(...roomCells.map(c => c.r));
        
        const roomName = room.name.toLowerCase();
        console.log(`Room name: ${roomName}, bounds: r${minR}-${maxR}, c${minC}-${maxC}`);
        
        // Only add furniture that matches the user's request
        requestedFurniture.forEach(furnitureType => {
            if (shouldAddFurnitureToRoom(furnitureType, roomName)) {
                // Try multiple positions to avoid overlaps
                let furnitureAdded = false;
                for (let attempt = 0; attempt < 3 && !furnitureAdded; attempt++) {
                    const furniture = createFurniture(furnitureType, minC, minR, maxC, maxR, furnitureId++, attempt);
                    if (furniture && addFurnitureSafely(furniture, newFurniture, existingFurniture, updatedData.walls.filter(w => w.type === 'wall'), updatedData.walls.filter(w => w.type === 'door'), room)) {
                        console.log(`Added ${furniture.name} to ${room.name}`);
                        furnitureAdded = true;
                    }
                }
                if (!furnitureAdded) {
                    console.log(`Could not place ${furnitureType} in ${room.name} due to space constraints`);
                }
            }
        });
    });
    
    updatedData.furniture = [...existingFurniture, ...newFurniture];
    updatedData.debug = {
        roomsProcessed: rooms.length,
        newFurnitureCount: newFurniture.length,
        existingFurnitureCount: existingFurniture.length,
        totalFurnitureCount: updatedData.furniture.length,
        requestedFurniture: requestedFurniture,
        userMessage: userMessage,
        placementResults: {
            successful: newFurniture.map(f => f.name),
            failed: requestedFurniture.filter(type => 
                !newFurniture.some(f => f.name.toLowerCase().includes(type.toLowerCase()))
            )
        }
    };
    return updatedData;
};

// Generate AI response using Gemini
const generateGeminiResponse = async (message, floorPlanData, analysis) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }

    console.log('Attempting Gemini API call with key:', apiKey.substring(0, 10) + '...');

    const prompt = `You are an expert interior designer AI assistant. You help people create beautiful, functional living spaces.

CONTEXT: You have access to the user's current floor plan layout and can suggest furniture placements.

User's Current Floor Plan:
${JSON.stringify(floorPlanData, null, 2)}

User Question: "${message}"

IMPORTANT RULES:
1. Speak naturally about interior design - furniture, colors, layouts, and aesthetics
2. When users request specific furniture, mention that you've placed it in their floor plan
3. If furniture cannot be placed due to space constraints, explain why and suggest alternatives
4. Focus on design principles, functionality, and visual appeal
5. Never mention technical details like coordinates, JSON, or file formats
6. Be conversational, helpful, and professional

RESPONSE FORMAT:
- Provide helpful interior design advice in natural language
- If the user requests specific furniture to be added, mention that furniture has been placed in their floor plan
- If furniture cannot be placed due to space constraints or overlaps, explain why and suggest alternatives
- Focus on design principles, aesthetics, and practical functionality
- Always mention what actions were taken (furniture added, advice given, etc.)
- Never mention technical details like coordinates, JSON, or file formats

Provide specific, actionable interior design advice.`;

    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        });

        console.log('Gemini API response status:', response.status);
        
        // First generate the updated floor plan to get placement results
        console.log('About to call generateUpdatedFloorPlan with analysis:', analysis);
        const updatedFloorPlan = generateUpdatedFloorPlan(floorPlanData, analysis, message);
        console.log('generateUpdatedFloorPlan returned:', updatedFloorPlan ? 'success' : 'null');
        console.log('Furniture count:', updatedFloorPlan?.furniture?.length || 0);
        
        // Add placement results to the prompt for AI context
        const placementResults = updatedFloorPlan?.debug?.placementResults;
        const aiContext = placementResults ? `\n\nPLACEMENT RESULTS: Successfully placed: ${placementResults.successful.join(', ') || 'none'}. Failed to place: ${placementResults.failed.join(', ') || 'none'}.` : '';
        
        const enhancedPrompt = prompt + aiContext;
        
        // Generate AI response with placement context
        const enhancedResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            contents: [{
                parts: [{
                    text: enhancedPrompt
                }]
            }]
        });
        
        const aiResponse = enhancedResponse.data.candidates[0].content.parts[0].text;
        const suggestions = generateDesignTips(analysis);

        return {
            response: aiResponse,
            suggestions,
            updatedFloorPlan,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Gemini API error:', error.response?.data || error.message);
        throw new Error('Failed to generate AI response');
    }
};

// Main AI response generation function
const generateAIResponse = async (message, floorPlanData, conversationHistory = []) => {
    try {
        console.log('=== AI Service Debug ===');
        console.log('AI_SERVICE env var:', process.env.AI_SERVICE);
        console.log('AI_SERVICE resolved:', process.env.AI_SERVICE || 'gemini');
        console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
        console.log('Message:', message);
        
        const analysis = analyzeFloorPlan(floorPlanData);
        console.log('Using Gemini service');
        
        return await generateGeminiResponse(message, floorPlanData, analysis);
    } catch (error) {
        console.error('AI Service Error:', error.message);
        throw error;
    }
};

module.exports = {
    generateAIResponse,
    analyzeFloorPlan,
    generateDesignTips
};
