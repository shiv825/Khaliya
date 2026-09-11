import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AiAssistant from '../components/AiAssistant';
import PwaBanner from '../components/PwaBanner';

export default function PublicLayout() {
    return (
        <div className="public-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: '80px' }}>
                <Outlet />
            </main>
            <Footer />
            <AiAssistant />
            <PwaBanner />
        </div>
    );
}
