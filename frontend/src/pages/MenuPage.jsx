import React, { useEffect } from 'react';
import Menu from '../components/Menu';

export default function MenuPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="page-menu" style={{ paddingTop: '80px', paddingBottom: '4rem' }}>
            <Menu />
        </div>
    );
}
