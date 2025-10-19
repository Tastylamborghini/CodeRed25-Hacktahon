const express = require('express');
const AIService = require('../services/aiService');

const router = express.Router();
const aiService = new AIService();

// POST /api/ai/chat - General AI chat with structured suggestions
router.post('/chat', async (req, res) => {
  const { message, layout, constraints } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const response = await aiService.generateResponse(message, layout, constraints);
    
    res.json({ 
      text: response.text,
      suggestions: response.suggestions,
      hasStructuredData: response.hasStructuredData,
      success: true 
    });
  } catch (error) {
    console.error('Chat endpoint error:', error.message);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/layout/suggest - Furniture layout suggestions
router.post('/layout/suggest', async (req, res) => {
  const { roomData } = req.body;

  if (!roomData) {
    return res.status(400).json({ error: 'Room data is required' });
  }

  try {
    const suggestions = await aiService.generateFurnitureLayout(roomData);
    res.json({ suggestions, success: true });
  } catch (error) {
    console.error('Layout suggestion error:', error.message);
    res.status(500).json({ error: 'Failed to generate layout suggestions' });
  }
});

// POST /api/ai/layout/accessibility - Accessibility analysis
router.post('/layout/accessibility', async (req, res) => {
  const { layout } = req.body;

  if (!layout) {
    return res.status(400).json({ error: 'Layout data is required' });
  }

  try {
    const recommendations = await aiService.analyzeAccessibility(layout);
    res.json({ recommendations, success: true });
  } catch (error) {
    console.error('Accessibility analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze accessibility' });
  }
});

// POST /api/ai/layout/optimize - Space optimization
router.post('/layout/optimize', async (req, res) => {
  const { layout } = req.body;

  if (!layout) {
    return res.status(400).json({ error: 'Layout data is required' });
  }

  try {
    const recommendations = await aiService.optimizeSpace(layout);
    res.json({ recommendations, success: true });
  } catch (error) {
    console.error('Space optimization error:', error.message);
    res.status(500).json({ error: 'Failed to optimize space' });
  }
});

module.exports = router;
