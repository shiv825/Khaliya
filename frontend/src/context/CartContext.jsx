import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('khaliya_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('❌ [CartContext] Failed to load cart:', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('khaliya_cart', JSON.stringify(cart));
    }, [cart]);

    const getProductId = (item) => {
        if (!item) return Math.random().toString();
        
        // 1. If it has a real database ID, use it
        if (item.id !== undefined && item.id !== null) {
            return String(item.id);
        }
        
        // 2. Fallback to slug
        if (item.slug) return String(item.slug);
        
        // 3. Fallback to name object (en, hi, ar)
        if (item.name && typeof item.name === 'object') {
            const nameStr = item.name.en || item.name.hi || item.name.ar;
            if (nameStr) return String(nameStr).trim();
            return JSON.stringify(item.name);
        }
        
        // 4. Fallback to direct name string
        if (item.name && typeof item.name === 'string') {
            return item.name.trim();
        }
        
        // 5. Absolute fallback (should never merge items incorrectly)
        return JSON.stringify(item) + Math.random().toString();
    };

    const addToCart = (product) => {
        setCart(prevCart => {
            const pId = getProductId(product);
            
            // Check if product exists based on ID
            const existingItemIndex = prevCart.findIndex(item => getProductId(item) === pId);
            
            if (existingItemIndex >= 0) {
                // Create a new array to ensure immutability
                const newCart = [...prevCart];
                newCart[existingItemIndex] = { 
                    ...newCart[existingItemIndex], 
                    quantity: (newCart[existingItemIndex].quantity || 1) + 1 
                };
                return newCart;
            }
            
            // If completely new item
            return [...prevCart, { ...product, quantity: 1, cartItemId: pId }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => getProductId(item) !== String(productId)));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart =>
            prevCart.map(item => getProductId(item) === String(productId) ? { ...item, quantity } : item)
        );
    };

    const updateItemNotes = (productId, notes) => {
        setCart(prevCart =>
            prevCart.map(item => getProductId(item) === String(productId) ? { ...item, notes, specialInstructions: notes } : item)
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            let price = 0;
            if (typeof item.price === 'number') {
                price = item.price;
            } else if (typeof item.price === 'string') {
                price = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
            }
            return total + (price * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateItemNotes,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
