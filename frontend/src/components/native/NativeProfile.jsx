import React from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export default function NativeProfile() {
    const storedUserStr = localStorage.getItem('khaliya_native_user');
    const user = storedUserStr ? JSON.parse(storedUserStr) : { name: 'shiv', email: 'shivkumarrdn7@gmail.com', phone: '8252731784' };

    const handleAppLogout = () => {
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to log out?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#E23744',
            cancelButtonColor: '#666',
            confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('khaliya_native_user');
                window.location.reload();
            }
        });
    };

    const handleFeatureClick = (label) => {
        if (label === 'Admin Portal') {
            window.location.href = '/admin'; // Navigate to the web admin route
            return;
        }

        Swal.fire({
            title: label,
            text: `${label} feature is coming soon in the next update!`,
            icon: 'info',
            confirmButtonColor: '#E23744',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        });
    };

    const menuItems = [
        { icon: 'fas fa-user-shield', label: 'Admin Portal', color: '#E23744' },
        { icon: 'fas fa-thumbs-up', label: 'Your feedback' },
        { icon: 'fas fa-info-circle', label: 'About' },
        { icon: 'fas fa-edit', label: 'Send feedback' },
        { icon: 'fas fa-exclamation-triangle', label: 'Report a safety emergency' },
        { icon: 'fas fa-universal-access', label: 'Accessibility' },
        { icon: 'fas fa-cog', label: 'Settings' }
    ];

    return (
        <div style={{ background: '#f8f8f8', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header / Back Arrow */}
            <div style={{ padding: '20px 15px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-arrow-left" style={{ fontSize: '1.2rem', color: '#1c1c1c' }}></i>
            </div>

            {/* Profile Card */}
            <div className="zomato-profile-card" style={{ marginBottom: '10px' }}>
                <div className="zomato-avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{user.name}</h2>
                    <p style={{ color: '#696969', margin: '2px 0 5px 0', fontSize: '0.9rem' }}>{user.email}</p>
                    <span
                        style={{ color: '#E23744', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}
                        onClick={() => handleFeatureClick('View Profile')}
                    >
                        View profile <i className="fas fa-caret-right"></i>
                    </span>
                </div>
            </div>

            {/* Gold Banner */}
            <motion.div
                className="zomato-gold-banner"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFeatureClick('Khaliya Gold')}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #ffd700, #ffc107)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-crown" style={{ color: '#1c1c1c', fontSize: '0.9rem' }}></i>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>Join Khaliya Gold</span>
                </div>
                <i className="fas fa-chevron-right" style={{ fontSize: '0.9rem' }}></i>
            </motion.div>

            {/* More Section */}
            <div className="more-section-title">More</div>

            <div className="zomato-settings-list">
                {menuItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        className="zomato-menu-item"
                        whileTap={{ background: '#f0f0f0' }}
                        onClick={() => handleFeatureClick(item.label)}
                    >
                        <i className={item.icon} style={item.color ? { color: item.color } : {}}></i>
                        <span>{item.label}</span>
                        <i className="fas fa-chevron-right"></i>
                    </motion.div>
                ))}

                <motion.div
                    className="zomato-menu-item profile-logout"
                    whileTap={{ background: '#fff5f5' }}
                    onClick={handleAppLogout}
                >
                    <i className="fas fa-power-off"></i>
                    <span>Log out</span>
                    <i className="fas fa-chevron-right"></i>
                </motion.div>
            </div>

            <div style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ opacity: 0.3, fontWeight: 700, fontSize: '2rem', letterSpacing: '2px', color: '#000', fontFamily: 'Playfair Display' }}>khaliya</div>
                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '5px' }}>v1.0.0 (Synced)</p>
            </div>
        </div>
    );
}
