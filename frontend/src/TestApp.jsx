import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test App</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        width: '200px', 
        height: '200px', 
        backgroundColor: '#f0f0f0', 
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '1rem'
      }}>
        Test Box
      </div>
    </div>
  );
}

export default TestApp;
