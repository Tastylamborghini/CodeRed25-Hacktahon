// Mock API service layer for Express backend integration

/**
 * Saves the current floor plan state to the backend.
 * @param {object} planData - The current state of walls, furniture, etc.
 */
export const savePlan = async (planData) => {
    // In a real application, this would be an API call:
    /*
    const response = await fetch('http://localhost:3000/api/plan/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
    });
    if (!response.ok) throw new Error('Failed to save plan');
    */
    
    // Mock successful save
    console.log("MOCK API: Plan data saved successfully to Express backend.", planData);
    return { success: true, timestamp: Date.now() };
};

/**
 * Loads a plan by ID from the backend.
 * @param {string} planId
 */
export const loadPlan = async (planId) => {
     // Mock successful load
     console.log(`MOCK API: Loading plan with ID: ${planId}`);
     return {
        // Mock data structure, must match getInitialState()
        horizontalWalls: [], 
        verticalWalls: [], 
        furniture: [], 
     };
};