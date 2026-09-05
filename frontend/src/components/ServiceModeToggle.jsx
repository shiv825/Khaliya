import React from 'react';

export default function ServiceModeToggle({ currentMode = 'SERVICE', onToggleMode }) {
    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '30px',
            padding: '4px 6px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)'
        }}>
            <button
                onClick={() => onToggleMode && onToggleMode('SERVICE')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: currentMode === 'SERVICE' 
                        ? 'linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)' 
                        : 'transparent',
                    color: currentMode === 'SERVICE' ? '#0B0E14' : '#8A94A6',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: currentMode === 'SERVICE' ? '0 2px 8px rgba(212, 175, 55, 0.4)' : 'none'
                }}
            >
                <span>⚡</span>
                <span>Service Mode</span>
            </button>

            <button
                onClick={() => onToggleMode && onToggleMode('MANAGEMENT')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: 'none',
                    background: currentMode === 'MANAGEMENT' 
                        ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' 
                        : 'transparent',
                    color: currentMode === 'MANAGEMENT' ? '#FFFFFF' : '#8A94A6',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: currentMode === 'MANAGEMENT' ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none'
                }}
            >
                <span>🛠️</span>
                <span>Management Mode</span>
            </button>
        </div>
    );
}
