import React, { useState } from 'react';

const SimpleLayoutBuilder = () => {
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(true);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '1rem 2rem', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
            style={{
              padding: '0.5rem',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Toggle
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1a202c' }}>
            Home Layout Optimizer
          </h1>
        </div>
        <button style={{
          padding: '0.5rem 1rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}>
          Save Layout
        </button>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {isToolbarExpanded && (
          <div style={{ 
            width: '280px', 
            background: 'white', 
            borderRight: '1px solid #e5e7eb',
            padding: '1rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Toolbar</h3>
            <p style={{ color: '#64748b', margin: 0 }}>This is a test toolbar</p>
          </div>
        )}
        
        <div style={{ 
          flex: 1, 
          padding: '2rem',
          background: '#fafbfc'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gridTemplateRows: 'repeat(10, 1fr)',
            gap: '1px',
            background: '#e2e8f0',
            border: '2px solid #cbd5e1',
            borderRadius: '0.5rem',
            padding: '1px',
            minWidth: '600px',
            minHeight: '600px'
          }}>
            {Array.from({ length: 100 }, (_, i) => (
              <div 
                key={i}
                style={{
                  background: 'white',
                  minHeight: '40px',
                  minWidth: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: '#64748b'
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLayoutBuilder;
