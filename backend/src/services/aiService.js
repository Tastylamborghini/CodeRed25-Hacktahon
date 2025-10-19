const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Load context documentation and template
let contextDocumentation = '';
let templateFloorPlan = null;

// Load context files on startup
const loadContext = async () => {
    try {
        const contextPath = path.join(__dirname, '../docs/floor-plan-context.md');
        const templatePath = path.join(__dirname, '../docs/template-floor-plan.json');
        
        contextDocumentation = await fs.readFile(contextPath, 'utf8');
        const templateData = await fs.readFile(templatePath, 'utf8');
        templateFloorPlan = JSON.parse(templateData);
        
        console.log('✅ AI context loaded successfully');
        console.log('🔧 Environment check:');
        console.log('  - AI_SERVICE:', process.env.AI_SERVICE);
        console.log('  - GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
        console.log('  - GEMINI_API_KEY first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));
    } catch (error) {
        console.error('❌ Failed to load AI context:', error.message);
        // Fallback context
        contextDocumentation = 'Floor plan JSON format with walls, furniture, and rooms. Grid size is 15x15 with 40px cells.';
        templateFloorPlan = {
            "walls": [],
            "furniture": [],
            "rooms": [],
            "metadata": {"gridSize": 15, "cellSize": 40}
        };
    }
};

// Initialize context loading
loadContext();

// Initialize AI services based on environment variables
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Generate AI response using the selected service
const generateAIResponse = async (message, floorPlanData, conversationHistory) => {
    const aiService = process.env.AI_SERVICE || 'openai';
    console.log('=== AI Service Debug ===');
    console.log('AI_SERVICE env var:', process.env.AI_SERVICE);
    console.log('AI_SERVICE resolved:', aiService);
    console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
    console.log('Message:', message);
    
    const analysis = analyzeFloorPlan(floorPlanData);
    
    try {
        switch (aiService.toLowerCase()) {
            case 'openai':
                console.log('Using OpenAI service');
                return await generateOpenAIResponse(message, floorPlanData, analysis, conversationHistory);
            case 'claude':
                console.log('Using Claude service');
                return await generateClaudeResponse(message, floorPlanData, analysis, conversationHistory);
            case 'gemini':
                console.log('Using Gemini service');
                const result = await generateGeminiResponse(message, floorPlanData, analysis, conversationHistory);
                console.log('Gemini result:', result ? 'success' : 'null');
                // Add debug info to result
                if (result) {
                    result.debug = {
                        ...result.debug,
                        generateAIResponseCalled: true,
                        aiService: aiService,
                        geminiApiKeyPresent: !!process.env.GEMINI_API_KEY
                    };
                }
                return result;
            default:
                console.log('Using mock response (default case)');
                return await generateMockResponse(message, floorPlanData, analysis);
        }
    } catch (error) {
        console.error('AI service error:', error);
        console.error('Error details:', error.message);
        console.error('Using service:', process.env.AI_SERVICE);
        console.error('Gemini API key present:', !!process.env.GEMINI_API_KEY);
        // Fallback to mock response if AI service fails
        return await generateMockResponse(message, floorPlanData, analysis);
    }
};

// OpenAI Integration
const generateOpenAIResponse = async (message, floorPlanData, analysis, conversationHistory) => {
    if (!openai) {
        throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert interior designer AI assistant with deep knowledge of floor plan design and JSON data structures.

CONTEXT DOCUMENTATION:
${contextDocumentation}

TEMPLATE EXAMPLE:
${JSON.stringify(templateFloorPlan, null, 2)}

CURRENT FLOOR PLAN ANALYSIS:
- Room Count: ${analysis.roomCount}
- Total Area: ${analysis.totalArea} grid units
- Room Types: ${analysis.roomTypes.join(', ')}
- Existing Furniture: ${analysis.furnitureCount} pieces

INSTRUCTIONS:
1. You are an expert interior designer providing helpful advice
2. Speak naturally about furniture, colors, layouts, and design principles
3. When users request specific furniture, mention that you've placed it in their floor plan
4. If furniture cannot be placed due to space constraints, explain why and suggest alternatives
5. Focus on design advice, aesthetics, and functionality
6. Never mention JSON files, coordinates, or technical implementation details
7. Be conversational, helpful, and professional

RESPONSE FORMAT:
- Provide helpful interior design advice in natural language
- If the user requests specific furniture to be added, mention that furniture has been placed in their floor plan
- If furniture cannot be placed due to space constraints or overlaps, explain why and suggest alternatives
- Focus on design principles, aesthetics, and practical functionality
- Always mention what actions were taken (furniture added, advice given, etc.)
- Never mention technical details like coordinates, JSON, or file formats

Be conversational, helpful, and precise in your recommendations.`;

    const userPrompt = `User Question: "${message}"

Floor Plan Data:
${JSON.stringify(floorPlanData, null, 2)}

Please provide helpful interior design advice and suggestions.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    const suggestions = generateDesignTips(analysis);
    const updatedFloorPlan = generateUpdatedFloorPlan(floorPlanData, analysis, message);

    return {
        response,
        suggestions,
        updatedFloorPlan
    };
};

// Claude Integration (using Anthropic API)
const generateClaudeResponse = async (message, floorPlanData, analysis, conversationHistory) => {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        throw new Error('Claude API key not configured');
    }

    const prompt = `You are an expert interior designer AI assistant with deep knowledge of floor plan design and JSON data structures.

CONTEXT DOCUMENTATION:
${contextDocumentation}

TEMPLATE EXAMPLE:
${JSON.stringify(templateFloorPlan, null, 2)}

CURRENT FLOOR PLAN ANALYSIS:
- Room Count: ${analysis.roomCount}
- Total Area: ${analysis.totalArea} grid units
- Room Types: ${analysis.roomTypes.join(', ')}
- Existing Furniture: ${analysis.furnitureCount} pieces

INSTRUCTIONS:
1. Use the context documentation to understand the JSON format and constraints
2. Provide specific, actionable advice with exact coordinates
3. Ensure all suggestions follow the grid system rules (15x15 grid, 40px cells)
4. Respect furniture placement constraints (no overlaps, proper clearance)
5. Consider room proportions and traffic flow
6. When suggesting furniture, provide exact pixel coordinates
7. Explain your reasoning for each recommendation

User Question: "${message}"

Floor Plan Data:
${JSON.stringify(floorPlanData, null, 2)}

Please provide specific, actionable interior design advice and suggestions with exact coordinates.`;

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [
            { role: 'user', content: prompt }
        ]
    }, {
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
    });

    const aiResponse = response.data.content[0].text;
    const suggestions = generateDesignTips(analysis);
    const updatedFloorPlan = generateUpdatedFloorPlan(floorPlanData, analysis, message);

    return {
        response: aiResponse,
        suggestions,
        updatedFloorPlan
    };
};

// Gemini Integration (using Google AI API)
const generateGeminiResponse = async (message, floorPlanData, analysis, conversationHistory) => {
    console.log('=== generateGeminiResponse called ===');
    console.log('Message:', message);
    console.log('Floor plan data:', !!floorPlanData);
    console.log('Analysis:', analysis);
    
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
2. When users ask for help with their floor plan, proactively suggest appropriate furniture for each room
3. Mention that you've placed suggested furniture in their floor plan
4. If furniture cannot be placed due to space constraints, explain why and suggest alternatives
5. Focus on design principles, functionality, and visual appeal
6. Never mention technical details like coordinates, JSON, or file formats
7. Be conversational, helpful, and professional

RESPONSE FORMAT:
- Provide helpful interior design advice in natural language
- Proactively suggest appropriate furniture for each room based on room type and size
- Mention that suggested furniture has been placed in their floor plan
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
        }, {
            timeout: 30000, // 30 second timeout
            headers: {
                'Content-Type': 'application/json'
            }
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
            debug: {
                generateGeminiResponseCalled: true,
                generateUpdatedFloorPlanCalled: true,
                furnitureCount: updatedFloorPlan?.furniture?.length || 0,
                analysis: analysis
            }
        };
    } catch (error) {
        console.error('Gemini API error:', error.message);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

// Mock response (fallback)
const generateMockResponse = async (message, floorPlanData, analysis) => {
    const suggestions = generateFurnitureSuggestions(floorPlanData, analysis);
    const designTips = generateDesignTips(analysis);
    
    let response = generateContextualResponse(message, analysis, designTips);
    
    if (message.toLowerCase().includes('furniture') || message.toLowerCase().includes('suggest')) {
        response += `\n\nHere are some furniture suggestions for your space:\n${suggestions.map(s => `• ${s}`).join('\n')}`;
    }
    
    return {
        response,
        suggestions: designTips,
        updatedFloorPlan: generateUpdatedFloorPlan(floorPlanData, analysis, message),
        debug: {
            mockResponseUsed: true,
            generateAIResponseCalled: true,
            aiService: process.env.AI_SERVICE || 'openai',
            geminiApiKeyPresent: !!process.env.GEMINI_API_KEY
        }
    };
};

// Analysis functions (same as before)
const analyzeFloorPlan = (floorPlanData) => {
    if (!floorPlanData) return { roomCount: 0, totalArea: 0, roomTypes: [] };
    
    const rooms = floorPlanData.rooms || [];
    const furniture = floorPlanData.furniture || [];
    const walls = floorPlanData.walls || [];
    
    const roomTypes = rooms.map(room => room.name);
    const totalArea = rooms.reduce((sum, room) => sum + room.cells.length, 0);
    const furnitureCount = furniture.length;
    
    const roomSizes = rooms.map(room => ({
        name: room.name,
        size: room.cells.length,
        isLarge: room.cells.length > 8,
        isSmall: room.cells.length < 4
    }));
    
    return {
        roomCount: rooms.length,
        totalArea,
        roomTypes,
        furnitureCount,
        roomSizes,
        hasLargeRooms: roomSizes.some(r => r.isLarge),
        hasSmallRooms: roomSizes.some(r => r.isSmall)
    };
};

const generateFurnitureSuggestions = (floorPlanData, analysis) => {
    const suggestions = [];
    const rooms = floorPlanData?.rooms || [];
    
    rooms.forEach(room => {
        const roomSize = room.cells.length;
        const roomName = room.name.toLowerCase();
        
        if (roomName.includes('living') || roomName.includes('lounge')) {
            if (roomSize >= 8) {
                suggestions.push(`Large sofa (3-4 seats) for your spacious ${room.name}`);
                suggestions.push(`Coffee table and side tables for the ${room.name}`);
                suggestions.push(`TV stand or entertainment center for the ${room.name}`);
            } else {
                suggestions.push(`Compact loveseat for your ${room.name}`);
                suggestions.push(`Small coffee table for the ${room.name}`);
            }
        } else if (roomName.includes('bedroom')) {
            suggestions.push(`Queen or King bed for your ${room.name}`);
            suggestions.push(`Nightstands on both sides of the bed`);
            suggestions.push(`Dresser or wardrobe for storage in ${room.name}`);
        } else if (roomName.includes('kitchen')) {
            suggestions.push(`Kitchen island (if space allows) for your ${room.name}`);
            suggestions.push(`Dining table and chairs for the ${room.name}`);
            suggestions.push(`Kitchen storage solutions for the ${room.name}`);
        } else if (roomName.includes('office') || roomName.includes('study')) {
            suggestions.push(`Desk and ergonomic chair for your ${room.name}`);
            suggestions.push(`Bookshelf or storage unit for the ${room.name}`);
            suggestions.push(`Good lighting for your ${room.name}`);
        }
    });
    
    return suggestions;
};

const generateDesignTips = (analysis) => {
    const tips = [];
    
    if (analysis.hasLargeRooms) {
        tips.push("Large rooms benefit from zoning - create distinct areas for different activities");
        tips.push("Use area rugs to define spaces in large rooms");
    }
    
    if (analysis.hasSmallRooms) {
        tips.push("Small rooms work best with multi-functional furniture");
        tips.push("Use light colors and mirrors to make small spaces feel larger");
    }
    
    if (analysis.roomCount > 3) {
        tips.push("Consider traffic flow between rooms when placing furniture");
        tips.push("Create a cohesive color scheme throughout your home");
    }
    
    tips.push("Leave at least 3 feet of clearance for main walkways");
    tips.push("Group furniture to create conversation areas");
    tips.push("Consider natural light when placing seating areas");
    
    return tips;
};

const generateContextualResponse = (message, analysis, designTips) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return `Hello! I'm your interior design AI assistant. I can see you have a ${analysis.roomCount}-room floor plan with ${analysis.totalArea} total grid units. How can I help you improve your space?`;
    }
    
    if (lowerMessage.includes('furniture') || lowerMessage.includes('suggest')) {
        return `Based on your floor plan, I can suggest furniture that would work well in your space. Your ${analysis.roomCount} rooms offer great potential for creating functional and beautiful living areas.`;
    }
    
    if (lowerMessage.includes('design') || lowerMessage.includes('style')) {
        return `Here are some design tips for your space:\n${designTips.slice(0, 3).map(tip => `• ${tip}`).join('\n')}`;
    }
    
    if (lowerMessage.includes('layout') || lowerMessage.includes('arrange')) {
        return `Your current layout has ${analysis.roomCount} rooms. I can help you optimize the furniture placement and room flow. Would you like specific suggestions for any particular room?`;
    }
    
    return `I can help you with furniture suggestions, design tips, and layout optimization for your floor plan. What would you like to know about your space?`;
};

// Validation functions for furniture placement
const isValidPlacement = (newFurniture, existingFurniture, walls, doors, room) => {
    console.log(`Validating furniture: ${newFurniture.name} at (${newFurniture.origin_x}, ${newFurniture.origin_y})`);
    console.log(`Walls count: ${walls.length}, Doors count: ${doors.length}`);
    
    // 1. Check furniture overlap
    for (let furniture of existingFurniture) {
        if (overlaps(newFurniture, furniture)) {
            console.log(`❌ Furniture overlap with ${furniture.name}`);
            return false;
        }
    }
    
    // 2. Check wall collision
    // Temporarily disabled for debugging
    // if (collidesWithWalls(newFurniture, walls)) {
    //     console.log(`❌ Wall collision detected`);
    //     return false;
    // }
    
    // 3. Check door blocking
    if (blocksDoor(newFurniture, doors)) {
        console.log(`❌ Door blocking detected`);
        return false;
    }
    
    // 4. Check room boundaries
    if (!withinRoom(newFurniture, room)) {
        console.log(`❌ Outside room boundaries`);
        return false;
    }
    
    console.log(`✅ Furniture placement valid`);
    return true;
};

const overlaps = (furniture1, furniture2) => {
    const f1Left = furniture1.origin_x;
    const f1Right = furniture1.end_x;
    const f1Top = furniture1.origin_y;
    const f1Bottom = furniture1.end_y;
    
    const f2Left = furniture2.origin_x;
    const f2Right = furniture2.end_x;
    const f2Top = furniture2.origin_y;
    const f2Bottom = furniture2.end_y;
    
    return !(f1Right <= f2Left || f1Left >= f2Right || f1Bottom <= f2Top || f1Top >= f2Bottom);
};

const collidesWithWalls = (furniture, walls) => {
    const fLeft = furniture.origin_x;
    const fRight = furniture.end_x;
    const fTop = furniture.origin_y;
    const fBottom = furniture.end_y;
    
    for (let wall of walls) {
        if (wall.type === 'wall') {
            // Wall coordinates are already in grid units (0.5, 1.5, etc.)
            // Convert to pixel coordinates
            const wallX = wall.x * 80; // Convert grid to pixels (80-pixel increments)
            const wallY = wall.y * 80; // Convert grid to pixels (80-pixel increments)
            
            if (wall.orientation === 'horizontal') {
                // Horizontal wall at y = wallY
                // Check if furniture overlaps with the wall line
                if (fTop < wallY && fBottom > wallY && fLeft < wallX + 80 && fRight > wallX) {
                    console.log(`Wall collision: Horizontal wall at (${wallX}, ${wallY}) overlaps furniture at (${fLeft}, ${fTop}) to (${fRight}, ${fBottom})`);
                    return true;
                }
            } else {
                // Vertical wall at x = wallX
                // Check if furniture overlaps with the wall line
                if (fLeft < wallX && fRight > wallX && fTop < wallY + 80 && fBottom > wallY) {
                    console.log(`Wall collision: Vertical wall at (${wallX}, ${wallY}) overlaps furniture at (${fLeft}, ${fTop}) to (${fRight}, ${fBottom})`);
                    return true;
                }
            }
        }
    }
    
    return false;
};

const blocksDoor = (furniture, doors) => {
    const fLeft = furniture.origin_x;
    const fRight = furniture.end_x;
    const fTop = furniture.origin_y;
    const fBottom = furniture.end_y;
    
    for (let door of doors) {
        if (door.type === 'door') {
            const doorX = door.x * 80; // Convert grid to pixels (80-pixel increments)
            const doorY = door.y * 80; // Convert grid to pixels (80-pixel increments)
            
            // Check if furniture blocks door (with 1-cell clearance)
            const clearance = 80; // 1 cell clearance (80 pixels)
            
            if (door.orientation === 'horizontal') {
                // Horizontal door - check clearance
                if (fTop < doorY + clearance && fBottom > doorY - clearance && 
                    fLeft < doorX + 80 + clearance && fRight > doorX - clearance) {
                    return true;
                }
            } else {
                // Vertical door - check clearance
                if (fLeft < doorX + clearance && fRight > doorX - clearance && 
                    fTop < doorY + 80 + clearance && fBottom > doorY - clearance) {
                    return true;
                }
            }
        }
    }
    
    return false;
};

const withinRoom = (furniture, room) => {
    const fLeft = furniture.origin_x;
    const fRight = furniture.end_x;
    const fTop = furniture.origin_y;
    const fBottom = furniture.end_y;
    
    const roomCells = room.cells || [];
    if (roomCells.length === 0) return false;
    
    // Check if furniture corners are within room cells
    const corners = [
        { x: fLeft, y: fTop },
        { x: fRight, y: fTop },
        { x: fLeft, y: fBottom },
        { x: fRight, y: fBottom }
    ];
    
    for (let corner of corners) {
        const gridCol = Math.floor(corner.x / 80); // Use 80-pixel increments
        const gridRow = Math.floor(corner.y / 80); // Use 80-pixel increments
        
        const isInRoom = roomCells.some(cell => cell.r === gridRow && cell.c === gridCol);
        if (!isInRoom) {
            return false;
        }
    }
    
    return true;
};

// Helper function to safely add furniture with validation
const addFurnitureSafely = (furniture, newFurniture, existingFurniture, walls, doors, room) => {
    if (isValidPlacement(furniture, existingFurniture, walls, doors, room)) {
        newFurniture.push(furniture);
        return true;
    }
    return false;
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

// Helper function to suggest appropriate furniture for rooms
const suggestFurnitureForRooms = (rooms) => {
    const suggestions = [];
    
    rooms.forEach(room => {
        const roomName = room.name.toLowerCase();
        const roomCells = room.cells || [];
        
        if (roomCells.length === 0) return;
        
        const minC = Math.min(...roomCells.map(c => c.c));
        const maxC = Math.max(...roomCells.map(c => c.c));
        const minR = Math.min(...roomCells.map(c => c.r));
        const maxR = Math.max(...roomCells.map(c => c.r));
        
        const roomWidth = maxC - minC;
        const roomHeight = maxR - minR;
        
        // Suggest furniture based on room type and size
        if (roomName.includes('living') || roomName.includes('family') || roomName.includes('lounge')) {
            if (roomWidth >= 1 && roomHeight >= 1) {
                suggestions.push('sofa');
            }
            if (roomWidth >= 1 && roomHeight >= 1) {
                suggestions.push('coffee table');
            }
        } else if (roomName.includes('bedroom') || roomName.includes('master')) {
            if (roomWidth >= 1 && roomHeight >= 1) {
                suggestions.push('bed');
            }
            if (roomWidth >= 1 && roomHeight >= 1) {
                suggestions.push('nightstand');
            }
        } else if (roomName.includes('kitchen')) {
            if (roomWidth >= 2 && roomHeight >= 1) {
                suggestions.push('kitchen island');
            }
        } else if (roomName.includes('dining')) {
            if (roomWidth >= 2 && roomHeight >= 1) {
                suggestions.push('dining table');
            }
        } else if (roomName.includes('office') || roomName.includes('study')) {
            if (roomWidth >= 1 && roomHeight >= 1) {
                suggestions.push('desk');
            }
        }
    });
    
    return suggestions;
};

// Helper function to determine if furniture should be added to a room
const shouldAddFurnitureToRoom = (furnitureType, roomName) => {
    const roomType = roomName.toLowerCase();
    
    switch (furnitureType) {
        case 'sofa':
        case 'coffee table':
        case 'side table':
        case 'accent chair':
            return roomType.includes('living') || roomType.includes('lounge');
        case 'bed':
        case 'nightstand':
        case 'dresser':
            return roomType.includes('bedroom');
        case 'dining table':
        case 'chair':
        case 'kitchen island':
            return roomType.includes('kitchen') || roomType.includes('dining');
        case 'desk':
        case 'bookshelf':
            return roomType.includes('office') || roomType.includes('study');
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
            const bedHeight = Math.min(3, roomHeight);
            if (bedWidth >= 1 && bedHeight >= 2) {
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
            const dresserWidth = Math.min(2, roomWidth - 2);
            if (dresserWidth >= 1) {
                return {
                    name: dresserWidth >= 2 ? 'Dresser' : 'Small Dresser',
                    origin_x: (minC + 2) * cellSize,
                    origin_y: minR * cellSize,
                    end_x: (minC + 2 + dresserWidth) * cellSize,
                    end_y: (minR + 1) * cellSize,
                    width: dresserWidth * cellSize,
                    height: cellSize,
                    id: furnitureId
                };
            }
            break;
        case 'dining table':
            const tableWidth = Math.min(2, roomWidth);
            const tableHeight = Math.min(2, roomHeight);
            if (tableWidth >= 1 && tableHeight >= 1) {
                return {
                    name: tableWidth >= 2 ? 'Dining Table' : 'Small Dining Table',
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
                name: 'Chair',
                origin_x: minC * cellSize,
                origin_y: (minR + 2) * cellSize,
                end_x: (minC + 1) * cellSize,
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
            const deskHeight = Math.min(1, roomHeight);
            if (deskWidth >= 1 && deskHeight >= 1) {
                return {
                    name: deskWidth >= 2 ? 'Large Desk' : 'Small Desk',
                    origin_x: minC * cellSize,
                    origin_y: minR * cellSize,
                    end_x: (minC + deskWidth) * cellSize,
                    end_y: (minR + deskHeight) * cellSize,
                    width: deskWidth * cellSize,
                    height: deskHeight * cellSize,
                    id: furnitureId
                };
            }
            break;
        case 'bookshelf':
            const shelfWidth = Math.min(1, roomWidth - 2);
            if (shelfWidth >= 1) {
                return {
                    name: 'Bookshelf',
                    origin_x: (minC + 2) * cellSize,
                    origin_y: minR * cellSize,
                    end_x: (minC + 2 + shelfWidth) * cellSize,
                    end_y: (minR + 1) * cellSize,
                    width: shelfWidth * cellSize,
                    height: cellSize,
                    id: furnitureId
                };
            }
            break;
    }
    
    return null;
};

const generateUpdatedFloorPlan = (originalData, analysis, userMessage = '') => {
    console.log('=== generateUpdatedFloorPlan called ===');
    console.log('Original data:', !!originalData);
    console.log('Analysis:', analysis);
    console.log('User message:', userMessage);
    console.log('Rooms count:', originalData?.rooms?.length || 0);
    
    // Generate an updated floor plan with intelligently placed furniture based on user request
    if (!originalData) return null;
    
    const updatedData = JSON.parse(JSON.stringify(originalData));
    const rooms = updatedData.rooms || [];
    const existingFurniture = updatedData.furniture || [];
    const cellSize = updatedData.metadata?.cellSize || 80; // Use 80-pixel increments
    
    // Parse user message to understand what furniture they want
    const message = userMessage.toLowerCase();
    const requestedFurniture = parseFurnitureRequest(message);
    
    console.log('Requested furniture:', requestedFurniture);
    
    // If no specific furniture requested, suggest appropriate furniture for rooms
    let furnitureToAdd = requestedFurniture;
    if (requestedFurniture.length === 0) {
        console.log('No specific furniture requested, suggesting appropriate furniture for rooms');
        furnitureToAdd = suggestFurnitureForRooms(rooms);
        console.log('Suggested furniture:', furnitureToAdd);
    }
    
    if (furnitureToAdd.length === 0) {
        console.log('No furniture to add, returning original data');
        return updatedData;
    }
    
    // Find available spaces in each room
    const newFurniture = [];
    let furnitureId = Date.now();
    
    rooms.forEach(room => {
        const roomCells = room.cells || [];
        if (roomCells.length === 0) return;
        
        console.log(`Processing room: ${room.name} with ${roomCells.length} cells`);
        
        // Calculate room bounds
        const minR = Math.min(...roomCells.map(c => c.r));
        const maxR = Math.max(...roomCells.map(c => c.r));
        const minC = Math.min(...roomCells.map(c => c.c));
        const maxC = Math.max(...roomCells.map(c => c.c));
        
        const roomName = room.name.toLowerCase();
        console.log(`Room name: ${roomName}, bounds: r${minR}-${maxR}, c${minC}-${maxC}`);
        
        // Only add furniture that matches the user's request or suggestions
        furnitureToAdd.forEach(furnitureType => {
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

module.exports = {
    generateAIResponse,
    analyzeFloorPlan,
    generateFurnitureSuggestions,
    generateDesignTips,
    generateUpdatedFloorPlan
};
