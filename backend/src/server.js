const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '../data');
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

// Initialize data directory
ensureDataDir();

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});

// Save floor plan
app.post('/api/floor-plans', async (req, res) => {
    try {
        const floorPlanData = req.body;
        
        // Validate required fields
        if (!floorPlanData.walls || !floorPlanData.furniture || !floorPlanData.rooms) {
            return res.status(400).json({ 
                error: 'Missing required fields: walls, furniture, rooms' 
            });
        }

        // Add metadata
        const dataWithMetadata = {
            ...floorPlanData,
            metadata: {
                ...floorPlanData.metadata,
                lastModified: new Date().toISOString(),
                version: '1.0'
            }
        };

        // Save to file
        const filename = `floor-plan-${Date.now()}.json`;
        const filepath = path.join(DATA_DIR, filename);
        await fs.writeFile(filepath, JSON.stringify(dataWithMetadata, null, 2));

        res.json({ 
            success: true, 
            filename,
            message: 'Floor plan saved successfully' 
        });

    } catch (error) {
        console.error('Error saving floor plan:', error);
        res.status(500).json({ 
            error: 'Failed to save floor plan',
            details: error.message 
        });
    }
});

// Load floor plan
app.get('/api/floor-plans/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(DATA_DIR, filename);

        // Check if file exists
        try {
            await fs.access(filepath);
        } catch {
            return res.status(404).json({ 
                error: 'Floor plan not found' 
            });
        }

        // Read and parse file
        const fileContent = await fs.readFile(filepath, 'utf8');
        const floorPlanData = JSON.parse(fileContent);

        res.json(floorPlanData);

    } catch (error) {
        console.error('Error loading floor plan:', error);
        res.status(500).json({ 
            error: 'Failed to load floor plan',
            details: error.message 
        });
    }
});

// List all floor plans
app.get('/api/floor-plans', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR);
        const floorPlans = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filepath = path.join(DATA_DIR, file);
                    const content = await fs.readFile(filepath, 'utf8');
                    const data = JSON.parse(content);
                    
                    floorPlans.push({
                        filename: file,
                        name: data.metadata?.name || `Floor Plan ${file}`,
                        lastModified: data.metadata?.lastModified,
                        gridSize: data.metadata?.gridSize,
                        roomCount: data.rooms?.length || 0,
                        furnitureCount: data.furniture?.length || 0
                    });
                } catch (err) {
                    console.warn(`Error reading file ${file}:`, err.message);
                }
            }
        }

        // Sort by last modified (newest first)
        floorPlans.sort((a, b) => 
            new Date(b.lastModified) - new Date(a.lastModified)
        );

        res.json(floorPlans);

    } catch (error) {
        console.error('Error listing floor plans:', error);
        res.status(500).json({ 
            error: 'Failed to list floor plans',
            details: error.message 
        });
    }
});

// Delete floor plan
app.delete('/api/floor-plans/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(DATA_DIR, filename);

        // Check if file exists
        try {
            await fs.access(filepath);
        } catch {
            return res.status(404).json({ 
                error: 'Floor plan not found' 
            });
        }

        // Delete file
        await fs.unlink(filepath);

        res.json({ 
            success: true, 
            message: 'Floor plan deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting floor plan:', error);
        res.status(500).json({ 
            error: 'Failed to delete floor plan',
            details: error.message 
        });
    }
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
    try {
        console.log('=== AI Chat Endpoint Called ===');
        console.log('Message:', req.body.message);
        console.log('Floor plan data:', !!req.body.floorPlanData);
        console.log('Conversation history:', req.body.conversationHistory?.length || 0);
        
        const { message, floorPlanData, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }
        
        if (!floorPlanData) {
            return res.status(400).json({ 
                error: 'Floor plan data is required' 
            });
        }
        
        console.log('About to call aiService.generateAIResponse');
        
        // Import AI service
        const aiService = require('./services/aiService');
        
        const result = await aiService.generateAIResponse(message, floorPlanData, conversationHistory);
        
        console.log('aiService.generateAIResponse returned:', !!result);
        console.log('Response has debug field:', !!result.debug);
        
        res.json(result);
        
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            error: 'Failed to process AI request',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.originalUrl 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
