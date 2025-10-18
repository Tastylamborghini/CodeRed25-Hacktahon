import React, { useState } from 'react';
import { Bot, Lightbulb, RefreshCw, Check, X } from 'lucide-react';

const AIHelper = ({ rooms, onSuggestionApply }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');

  const generateSuggestions = async () => {
    setIsLoading(true);
    
    // Simulate AI API call
    setTimeout(() => {
      const mockSuggestions = [
        {
          id: 1,
          title: "Optimize Space Flow",
          description: "Rearrange rooms to create better flow between living areas",
          type: "layout",
          confidence: 0.85,
          changes: [
            { roomId: "living-1", action: "move", from: { x: 1, y: 1 }, to: { x: 2, y: 1 } },
            { roomId: "kitchen-1", action: "move", from: { x: 3, y: 1 }, to: { x: 1, y: 1 } }
          ]
        },
        {
          id: 2,
          title: "Add Accessibility Features",
          description: "Widen doorways and add accessible bathroom features",
          type: "accessibility",
          confidence: 0.92,
          changes: [
            { roomId: "bathroom-1", action: "resize", width: 3, height: 2 },
            { roomId: "bathroom-1", action: "addElement", element: "grab_bar" }
          ]
        },
        {
          id: 3,
          title: "Furniture Layout Suggestion",
          description: "Optimize furniture placement for better functionality",
          type: "furniture",
          confidence: 0.78,
          changes: [
            { roomId: "bedroom-1", action: "furniture", layout: "bed_north_wall" },
            { roomId: "living-1", action: "furniture", layout: "tv_fireplace_wall" }
          ]
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 2000);
  };

  const applySuggestion = (suggestion) => {
    onSuggestionApply(suggestion);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const rejectSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'layout': return '🏗️';
      case 'accessibility': return '♿';
      case 'furniture': return '🪑';
      case 'lighting': return '💡';
      case 'storage': return '📦';
      default: return '💡';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="ai-helper">
      <div className="ai-helper-header">
        <div className="ai-helper-title">
          <Bot size={20} />
          <h3>AI Layout Assistant</h3>
        </div>
        <button 
          className="btn btn-primary"
          onClick={generateSuggestions}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw size={16} className="spinning" />
          ) : (
            <Lightbulb size={16} />
          )}
          {isLoading ? 'Analyzing...' : 'Get Suggestions'}
        </button>
      </div>

      <div className="ai-helper-content">
        <div className="ai-prompt-section">
          <label htmlFor="ai-prompt">Custom Request:</label>
          <textarea
            id="ai-prompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Ask the AI for specific layout advice... (e.g., 'Make this more accessible for wheelchair users')"
            rows={3}
          />
          <button 
            className="btn btn-secondary"
            onClick={() => {
              // Handle custom prompt
              console.log('Custom prompt:', userPrompt);
              setUserPrompt('');
            }}
            disabled={!userPrompt.trim()}
          >
            Ask AI
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions-section">
            <h4>AI Suggestions</h4>
            <div className="suggestions-list">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="suggestion-card">
                  <div className="suggestion-header">
                    <div className="suggestion-title">
                      <span className="suggestion-icon">
                        {getSuggestionIcon(suggestion.type)}
                      </span>
                      <h5>{suggestion.title}</h5>
                    </div>
                    <div className="suggestion-confidence">
                      <div 
                        className="confidence-bar"
                        style={{ 
                          backgroundColor: getConfidenceColor(suggestion.confidence),
                          width: `${suggestion.confidence * 100}%`
                        }}
                      />
                      <span className="confidence-text">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  
                  <p className="suggestion-description">
                    {suggestion.description}
                  </p>

                  {suggestion.changes && suggestion.changes.length > 0 && (
                    <div className="suggestion-changes">
                      <h6>Proposed Changes:</h6>
                      <ul>
                        {suggestion.changes.map((change, index) => (
                          <li key={index}>
                            {change.action === 'move' && 
                              `Move ${change.roomId} from (${change.from.x},${change.from.y}) to (${change.to.x},${change.to.y})`
                            }
                            {change.action === 'resize' && 
                              `Resize ${change.roomId} to ${change.width}×${change.height}`
                            }
                            {change.action === 'addElement' && 
                              `Add ${change.element} to ${change.roomId}`
                            }
                            {change.action === 'furniture' && 
                              `Apply ${change.layout} furniture layout to ${change.roomId}`
                            }
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="suggestion-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <Check size={16} />
                      Apply
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => rejectSuggestion(suggestion.id)}
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {suggestions.length === 0 && !isLoading && (
          <div className="no-suggestions">
            <Bot size={48} />
            <h4>Ready to Help!</h4>
            <p>Click "Get Suggestions" to receive AI-powered layout recommendations based on your current design.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHelper;
