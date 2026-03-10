import React from 'react';
import { motion } from 'framer-motion';

export default function ChefSpecial() {
    return (
        <section className="chef-special" style={{ padding: '80px 5%', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(230,57,70,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
                <motion.div
                    style={{ flex: '1 1 400px' }}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 style={{ fontSize: '3rem', color: '#fff', marginBottom: '15px', fontWeight: 800, lineHeight: 1.1 }}>
                        <span style={{ color: '#E63946' }}>Chef's</span><br />Signature
                    </h2>
                    <h3 style={{ fontSize: '1.8rem', color: '#ccc', marginBottom: '20px', fontWeight: 400 }}>Royal Mutton Biryani</h3>
                    <p style={{ color: '#aaa', lineHeight: 1.8, marginBottom: '35px', fontSize: '1.1rem' }}>
                        Slow-cooked to perfection over 12 hours with secret family spices. The meat falls right off the bone, layered with fragrant saffron basmati rice and crowned with crispy fried onions. A truly royal experience.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ padding: '12px 30px', fontSize: '1.1rem' }}
                    >
                        Order Now
                    </button>
                </motion.div>

                <motion.div
                    style={{ flex: '1 1 400px', position: 'relative' }}
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, type: 'spring' }}
                    whileHover={{ scale: 1.02, rotate: 2 }}
                >
                    <div style={{
                        width: '100%',
                        paddingTop: '100%',
                        position: 'relative',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #E63946, #FFB703)',
                        padding: '6px', // For the border effect
                        boxShadow: '0 20px 50px rgba(230,57,70,0.3)'
                    }}>
                        <img
                            src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&fit=crop"
                            alt="Royal Mutton Biryani"
                            style={{
                                position: 'absolute',
                                top: '6px', left: '6px', right: '6px', bottom: '6px',
                                width: 'calc(100% - 12px)', height: 'calc(100% - 12px)',
                                objectFit: 'cover',
                                borderRadius: '50%'
                            }}
                        />
                    </div>
                    {/* Floating badge */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            bottom: '5%',
                            right: '-5%',
                            background: 'rgba(25, 25, 25, 0.95)',
                            backdropFilter: 'blur(10px)',
                            padding: '15px 30px',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ color: '#E63946', fontSize: '1.8rem', fontWeight: 'bold' }}>₹550</span>
                        <span style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Best Seller</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
