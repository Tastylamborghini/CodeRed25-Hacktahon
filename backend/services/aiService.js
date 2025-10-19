const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
  }

  /**
   * Generate AI response for interior design assistance
   * @param {string} message - User's message/question
   * @param {Object} layout - Current room layout data
   * @param {Object} constraints - User constraints/preferences
   * @returns {Promise<Object>} AI response with both text and structured data
   */
  async generateResponse(message, layout = {}, constraints = {}) {
    try {
      const prompt = this.buildAssistantPrompt(message, layout, constraints);
      
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const rawResponse = this.extractResponse(response.data);
      return this.parseAssistantResponse(rawResponse, message, layout);
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Build the assistant prompt for Gemini - designed to return both chat and structured data
   */
  buildAssistantPrompt(message, layout, constraints) {
    return `You are an AI interior design assistant. You help users optimize their home layouts by providing conversational advice and, when appropriate, structured suggestions.

CURRENT LAYOUT:
${JSON.stringify(layout, null, 2)}

USER CONSTRAINTS/PREFERENCES:
${JSON.stringify(constraints, null, 2)}

USER MESSAGE: ${message}

RESPONSE GUIDELINES:
1. Always provide a helpful, conversational response to the user's message
2. Analyze the current layout and provide context-aware advice
3. ONLY include structured JSON suggestions when you have specific furniture placement recommendations, layout changes, or actionable improvements to suggest

WHEN TO INCLUDE JSON:
- User asks for furniture arrangement suggestions
- User wants specific layout changes
- You identify clear improvements that need positioning data
- User requests accessibility or space optimization recommendations

WHEN NOT TO INCLUDE JSON:
- General interior design questions
- Style advice or color recommendations
- General tips without specific positioning
- Questions about materials or shopping

JSON FORMAT (only when suggesting changes):
\`\`\`json
{
  "furnitureSuggestions": [
    {
      "type": "sofa",
      "position": {"x": 2, "y": 3},
      "size": {"width": 6, "height": 2},
      "reason": "Creates better conversation area"
    }
  ],
  "layoutChanges": [
    {
      "room": "living-room",
      "change": "move-sofa",
      "from": {"x": 0, "y": 0},
      "to": {"x": 2, "y": 3},
      "reason": "Better traffic flow"
    }
  ],
  "improvements": [
    "Add area rug to define seating area",
    "Consider side table for better functionality"
  ],
  "warnings": [
    "Ensure 36-inch clearance for wheelchair access"
  ]
}
\`\`\`

Be natural and conversational. Only suggest structured changes when you have specific, actionable recommendations!`;
  }

  /**
   * Extract the text response from Gemini's API response
   */
  extractResponse(data) {
    const response = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                    data.candidates?.[0]?.content?.text || 
                    'Sorry, I could not generate a response.';
    
    return response.trim();
  }

  /**
   * Parse the assistant response to extract both text and structured data
   */
  parseAssistantResponse(rawResponse, message, layout) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1].trim();
        const structuredData = JSON.parse(jsonString);
        
        // Remove the JSON section from the text response
        const textResponse = rawResponse.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
        
        return {
          text: textResponse,
          suggestions: structuredData,
          hasStructuredData: true
        };
      } else {
        // No JSON found, return just the text response
        return {
          text: rawResponse,
          suggestions: null,
          hasStructuredData: false
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error.message);
      // If JSON parsing fails, return the raw response
      return {
        text: rawResponse,
        suggestions: null,
        hasStructuredData: false,
        error: 'Failed to parse structured suggestions'
      };
    }
  }

  /**
   * Generate furniture layout suggestions based on room data
   * @param {Object} roomData - Room dimensions, type, and constraints
   * @returns {Promise<Object>} Structured furniture layout suggestions
   */
  async generateFurnitureLayout(roomData) {
    const message = `Generate a detailed furniture layout for this room: ${roomData.type || 'room'}. 
                     Dimensions: ${roomData.dimensions || 'not specified'}. 
                     Focus on: ${roomData.focus || 'general functionality'}.`;
    
    const response = await this.generateResponse(message, roomData, roomData.constraints);
    
    return {
      suggestions: response,
      roomType: roomData.type,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze layout for accessibility improvements
   * @param {Object} layout - Current layout data
   * @returns {Promise<string>} Accessibility recommendations
   */
  async analyzeAccessibility(layout) {
    const message = "Analyze this layout for accessibility improvements and ADA compliance. Focus on wheelchair accessibility, clear pathways, and universal design principles.";
    
    return await this.generateResponse(message, layout, { accessibility: true });
  }

  /**
   * Optimize layout for space maximization
   * @param {Object} layout - Current layout data
   * @returns {Promise<string>} Space optimization recommendations
   */
  async optimizeSpace(layout) {
    const message = "Optimize this layout to maximize usable space. Focus on efficient furniture placement, storage solutions, and multi-functional areas.";
    
    return await this.generateResponse(message, layout, { maximizeSpace: true });
  }
}

module.exports = AIService;
