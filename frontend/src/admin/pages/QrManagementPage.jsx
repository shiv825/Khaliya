import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';
import Swal from 'sweetalert2';

export default function QrManagementPage() {
    const { tables } = useAdmin();
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [cardTheme, setCardTheme] = useState('gold'); // 'gold' (Dark Luxury) or 'white' (Crisp Printable White)

    const categories = ['ALL', ...new Set(tables.map(t => t.category || t.section || 'Ground Hall'))];

    const filteredTables = tables.filter(t => {
        const cat = t.category || t.section || 'Ground Hall';
        const matchesCat = selectedCategory === 'ALL' || cat === selectedCategory;
        const queryLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery || 
            t.name.toLowerCase().includes(queryLower) ||
            t.id.toLowerCase().includes(queryLower) ||
            cat.toLowerCase().includes(queryLower);
        return matchesCat && matchesSearch;
    });

    const getTableQrUrl = (tableId) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/table/${tableId}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const drawFullTableCardToCanvas = (table, isDark) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const width = 600;
            const height = 920;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Background
            if (isDark) {
                const grad = ctx.createLinearGradient(0, 0, width, height);
                grad.addColorStop(0, '#181e2b');
                grad.addColorStop(1, '#0f131c');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = '#FFFFFF';
            }
            ctx.fillRect(0, 0, width, height);

            // Outer Border
            ctx.lineWidth = 12;
            ctx.strokeStyle = isDark ? '#D4AF37' : '#CBD5E1';
            ctx.strokeRect(10, 10, width - 20, height - 20);

            // Inner Gold Accent Line
            ctx.lineWidth = 2;
            ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.4)' : '#AA7C11';
            ctx.strokeRect(20, 20, width - 40, height - 40);

            // Brand Header
            ctx.fillStyle = isDark ? '#D4AF37' : '#AA7C11';
            ctx.font = '900 22px "Cinzel", Georgia, serif';
            ctx.textAlign = 'center';
            ctx.fillText('KHALIYA RESTAURANT', width / 2, 75);

            // Table Name Title
            ctx.fillStyle = isDark ? '#FFFFFF' : '#1A202C';
            ctx.font = '900 52px "Cinzel", Georgia, serif';
            ctx.fillText(table.name || 'TABLE 01', width / 2, 140);

            // Floor Section
            ctx.fillStyle = isDark ? '#8A94A6' : '#718096';
            ctx.font = '700 24px "Outfit", sans-serif';
            ctx.fillText(table.category || table.section || 'Ground Hall', width / 2, 180);

            // QR Target Link
            const qrTargetUrl = getTableQrUrl(table.id);
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrTargetUrl)}&color=000000&bgcolor=ffffff`;

            const qrImg = new Image();
            qrImg.crossOrigin = 'anonymous';
            qrImg.onload = () => {
                // QR White Frame Container
                const boxSize = 420;
                const boxX = (width - boxSize) / 2;
                const boxY = 210;

                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(boxX, boxY, boxSize, boxSize);

                ctx.lineWidth = 6;
                ctx.strokeStyle = isDark ? '#D4AF37' : '#1A202C';
                ctx.strokeRect(boxX, boxY, boxSize, boxSize);

                // Draw QR Image inside frame
                ctx.drawImage(qrImg, boxX + 20, boxY + 20, 380, 380);

                // CTA Callout
                ctx.fillStyle = isDark ? '#FFFFFF' : '#1A202C';
                ctx.font = '900 28px "Outfit", sans-serif';
                ctx.fillText('📱 SCAN TO ORDER DINE-IN', width / 2, 690);

                // Multi-Language Subtext
                ctx.fillStyle = isDark ? '#FFD700' : '#AA7C11';
                ctx.font = '800 22px "Outfit", sans-serif';
                ctx.fillText('ऑर्डर करने के लिए स्कैन करें | امسح للطلب', width / 2, 735);

                // Subtitle Instructions
                ctx.fillStyle = isDark ? '#8A94A6' : '#718096';
                ctx.font = '600 18px "Outfit", sans-serif';
                ctx.fillText('View digital menu, order dishes & request your', width / 2, 780);
                ctx.fillText('bill directly from your table.', width / 2, 810);

                // Capacity Footer Badge
                ctx.fillStyle = isDark ? '#D4AF37' : '#4A5568';
                ctx.font = '800 20px "Outfit", sans-serif';
                ctx.fillText(`Khaliya Table Stand Card • ${table.capacity || 4} Seats`, width / 2, 875);

                canvas.toBlob(blob => resolve(blob), 'image/png');
            };

            qrImg.onerror = () => reject(new Error('Failed to load QR image'));
            qrImg.src = qrApiUrl;
        });
    };

    const handleDownloadQrPng = async (table) => {
        const isDark = cardTheme === 'gold';
        try {
            Swal.fire({
                title: 'Generating Luxury Full Card PNG...',
                text: `Rendering full stand card for ${table.name}`,
                icon: 'info',
                showConfirmButton: false,
                timer: 1500,
                background: '#121620',
                color: '#FFF'
            });

            const blob = await drawFullTableCardToCanvas(table, isDark);
            const blobUrl = URL.createObjectURL(blob);

            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = `Khaliya_FullCard_${table.id}_${table.name.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobUrl);

            Swal.fire({
                title: '📥 Full Stand Card Downloaded!',
                text: `Saved Khaliya_FullCard_${table.id}.png to downloads folder.`,
                icon: 'success',
                confirmButtonColor: '#D4AF37',
                background: '#121620',
                color: '#FFF'
            });
        } catch (err) {
            console.error('Error generating card canvas:', err);
            Swal.fire({
                title: 'Download Error',
                text: 'Could not generate full stand card image.',
                icon: 'error',
                background: '#121620',
                color: '#FFF'
            });
        }
    };

    const handleDownloadAllQrPngs = async () => {
        Swal.fire({
            title: `Downloading ${filteredTables.length} Full Stand Cards...`,
            text: 'Preparing high-res PNG files for acrylic table displays',
            icon: 'info',
            showConfirmButton: false,
            timer: 3000,
            background: '#121620',
            color: '#FFF'
        });

        for (let i = 0; i < filteredTables.length; i++) {
            const table = filteredTables[i];
            await new Promise(r => setTimeout(r, 600));
            handleDownloadQrPng(table);
        }
    };

    return (
        <div style={{ padding: '5px' }}>
            {/* Header & Main Controls (Hidden during print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-qrcode" style={{ color: 'var(--admin-primary)' }}></i>
                        Table QR Stand Generator
                    </h1>
                    <p style={{ color: 'var(--admin-text-muted)', margin: '5px 0 0 0', fontSize: '0.92rem' }}>
                        Generate high-res vector printable QR stand cards for acrylic table displays. Scanning launches instant customer dine-in ordering.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '4px', display: 'flex', gap: '4px' }}>
                        <button
                            onClick={() => setCardTheme('gold')}
                            style={{
                                background: cardTheme === 'gold' ? 'var(--admin-primary)' : 'transparent',
                                color: cardTheme === 'gold' ? '#000' : 'var(--admin-text-muted)',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                cursor: 'pointer'
                            }}
                        >
                            🌙 Dark Gold
                        </button>
                        <button
                            onClick={() => setCardTheme('white')}
                            style={{
                                background: cardTheme === 'white' ? '#FFF' : 'transparent',
                                color: cardTheme === 'white' ? '#000' : 'var(--admin-text-muted)',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                cursor: 'pointer'
                            }}
                        >
                            ☀️ Crisp White
                        </button>
                    </div>

                    <button
                        onClick={handleDownloadAllQrPngs}
                        style={{
                            background: 'rgba(46, 204, 113, 0.2)',
                            color: '#2ECC71',
                            border: '1px solid #2ECC71',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="fas fa-download"></i> Download All PNGs
                    </button>

                    <button
                        onClick={handlePrint}
                        style={{
                            background: 'linear-gradient(135deg, var(--admin-primary), #AA7C11)',
                            color: '#000',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                        }}
                    >
                        <i className="fas fa-print"></i> Print QR Stand Cards ({filteredTables.length})
                    </button>
                </div>
            </div>

            {/* Instant Search & Section Filters (Hidden during print) */}
            <div className="no-print" style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}></i>
                    <input
                        type="text"
                        placeholder="Search table name or floor area..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            background: 'var(--admin-surface)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '12px',
                            color: 'var(--admin-text)',
                            fontSize: '0.88rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                                background: selectedCategory === cat ? 'var(--admin-primary)' : 'var(--admin-surface)',
                                color: selectedCategory === cat ? '#000' : 'var(--admin-text)',
                                border: `1px solid ${selectedCategory === cat ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Print Stylesheet Injection for Thermal/Paper Cards */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .admin-layout-wrapper { display: block !important; }
                    .admin-sidebar, .admin-topbar { display: none !important; }
                    .admin-main-full { padding: 0 !important; }
                    .qr-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; page-break-inside: avoid; }
                    .qr-card { border: 2px solid #000 !important; background: #fff !important; color: #000 !important; page-break-inside: avoid; }
                    .qr-card-title { color: #000 !important; }
                    .qr-card-sub { color: #555 !important; }
                    .qr-card-brand { color: #9b720b !important; }
                    .qr-cta { color: #000 !important; }
                }
            `}</style>

            {/* Printable QR Stand Cards Grid */}
            <div className="qr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                {filteredTables.map(table => {
                    const qrTargetUrl = getTableQrUrl(table.id);
                    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrTargetUrl)}&color=000000&bgcolor=ffffff`;
                    const catName = table.category || table.section || 'Ground Hall';

                    const isDark = cardTheme === 'gold';

                    return (
                        <div
                            key={table.id}
                            className="qr-card"
                            style={{
                                background: isDark ? 'linear-gradient(145deg, #181e2b, #0f131c)' : '#FFFFFF',
                                border: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.4)' : '#E2E8F0'}`,
                                borderRadius: '24px',
                                padding: '25px 20px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(0,0,0,0.08)',
                                position: 'relative',
                                transition: 'transform 0.2s',
                                color: isDark ? '#FFF' : '#1A202C'
                            }}
                        >
                            {/* Capacity Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: isDark ? 'rgba(212, 175, 55, 0.15)' : '#F7FAFC',
                                color: isDark ? '#D4AF37' : '#4A5568',
                                border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.3)' : '#CBD5E0'}`,
                                borderRadius: '12px',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                fontWeight: '800'
                            }}>
                                <i className="fas fa-user-friends" style={{ marginRight: '4px' }}></i> {table.capacity || 4} Seats
                            </div>

                            {/* Card Brand Header */}
                            <div className="qr-card-brand" style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '900', color: isDark ? '#D4AF37' : '#AA7C11', marginBottom: '4px' }}>
                                KHALIYA RESTAURANT
                            </div>
                            
                            <h2 className="qr-card-title" style={{ fontSize: '1.6rem', fontWeight: '900', margin: '0 0 2px 0', color: isDark ? '#FFF' : '#1A202C' }}>
                                {table.name}
                            </h2>
                            
                            <div className="qr-card-sub" style={{ fontSize: '0.8rem', color: isDark ? 'var(--admin-text-muted)' : '#718096', marginBottom: '18px', fontWeight: '700' }}>
                                {catName}
                            </div>

                            {/* High Quality QR Frame */}
                            <div style={{
                                background: '#FFF',
                                padding: '16px',
                                borderRadius: '20px',
                                border: `3px solid ${isDark ? '#D4AF37' : '#1A202C'}`,
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                marginBottom: '16px'
                            }}>
                                <img
                                    src={qrImageUrl}
                                    alt={`QR Code for ${table.name}`}
                                    style={{ width: '170px', height: '170px', display: 'block', borderRadius: '6px' }}
                                />
                            </div>

                            {/* Multi-Language CTA */}
                            <div className="qr-cta" style={{ fontSize: '0.92rem', fontWeight: '900', color: isDark ? '#FFF' : '#1A202C', marginBottom: '4px' }}>
                                📱 SCAN TO ORDER DINE-IN
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isDark ? '#D4AF37' : '#AA7C11', fontWeight: '800', marginBottom: '6px' }}>
                                ऑर्डर करने के लिए स्कैन करें | امسح للطلب
                            </div>
                            <div style={{ fontSize: '0.72rem', color: isDark ? 'var(--admin-text-muted)' : '#718096', maxWidth: '230px', lineHeight: '1.3' }}>
                                View digital menu, order dishes & request your bill directly from your table.
                            </div>

                            {/* Action Buttons for Admin Testing & Downloads */}
                            <div className="no-print" style={{ marginTop: '16px', width: '100%', display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => handleDownloadQrPng(table)}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(46, 204, 113, 0.15)',
                                        color: '#2ECC71',
                                        border: '1px solid #2ECC71',
                                        padding: '7px 4px',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <i className="fas fa-download"></i> Download PNG
                                </button>
                                <a
                                    href={qrTargetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        flex: 1,
                                        background: 'rgba(212, 175, 55, 0.15)',
                                        color: isDark ? '#D4AF37' : '#AA7C11',
                                        border: `1px solid ${isDark ? '#D4AF37' : '#AA7C11'}`,
                                        padding: '7px 4px',
                                        borderRadius: '10px',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <i className="fas fa-external-link-alt"></i> Test Order
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

