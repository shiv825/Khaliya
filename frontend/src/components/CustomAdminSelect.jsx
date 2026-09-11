import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomAdminSelect({ 
    options = [], 
    value, 
    onChange, 
    placeholder = 'Select an option...',
    icon,
    style = {},
    dropdownStyle = {}
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format options if passed as strings or objects { label, value }
    const normalizedOptions = options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
            return { label: opt.label || opt.name || opt.value, value: opt.value };
        }
        return { label: String(opt), value: opt };
    });

    const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

    const handleToggle = () => {
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 230 && rect.top > 200) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', userSelect: 'none', ...style }}>
            <div 
                onClick={handleToggle}
                style={{
                    background: 'rgba(12, 14, 22, 0.85)',
                    border: isOpen ? '1.5px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: selectedOption ? '#F3E5AB' : '#888',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isOpen ? '0 0 15px rgba(212, 175, 55, 0.25)' : 'none',
                    transition: 'all 0.25s ease',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {icon && <i className={icon} style={{ color: '#D4AF37' }}></i>}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <i 
                    className="fas fa-chevron-down" 
                    style={{ 
                        color: '#D4AF37', 
                        fontSize: '0.85rem', 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease'
                    }}
                ></i>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: openUpward ? 6 : -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: openUpward ? -4 : 4, scale: 1 }}
                        exit={{ opacity: 0, y: openUpward ? 6 : -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            top: openUpward ? 'auto' : '100%',
                            bottom: openUpward ? '100%' : 'auto',
                            left: 0,
                            right: 0,
                            zIndex: 10000,
                            background: 'linear-gradient(145deg, rgba(16, 18, 27, 0.98), rgba(10, 11, 16, 0.99))',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            borderRadius: '14px',
                            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(212, 175, 55, 0.2)',
                            backdropFilter: 'blur(20px)',
                            padding: '6px',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            marginTop: openUpward ? 0 : '4px',
                            marginBottom: openUpward ? '4px' : 0,
                            ...dropdownStyle
                        }}
                    >
                        {normalizedOptions.length === 0 ? (
                            <div style={{ padding: '10px 14px', color: '#777', fontSize: '0.85rem', textAlign: 'center' }}>
                                No options available
                            </div>
                        ) : (
                            normalizedOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            color: isSelected ? '#FFF' : '#DDD',
                                            background: isSelected 
                                                ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1))' 
                                                : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: isSelected ? '700' : '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.15s ease',
                                            borderLeft: isSelected ? '3px solid #D4AF37' : '3px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                                                e.currentTarget.style.color = '#FFF';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = '#DDD';
                                            }
                                        }}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && <i className="fas fa-check" style={{ color: '#D4AF37', fontSize: '0.85rem' }}></i>}
                                    </div>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
