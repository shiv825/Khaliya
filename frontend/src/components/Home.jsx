import React, { useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import FeaturedSpecials from './FeaturedSpecials';
import Movements from './Movements';
import Testimonials from './Testimonials';
import Menu from './Menu';
import Reviews from './Reviews';
import HoursAndLocation from './HoursAndLocation';
import Tables from './Tables';
import Reservations from './Reservations';
import Footer from './Footer';
import AiAssistant from './AiAssistant';

export default function Home() {
    const [selectedTableType, setSelectedTableType] = useState('');

    const handleTableSelect = (type) => {
        setSelectedTableType(type);
    };

    return (
        <>
            <Navbar />

            <main>
                <Hero />
                <FeaturedSpecials />
                <Movements />
                <Testimonials />
                <Menu />
                <Reviews />
                <HoursAndLocation />
                <Tables onSelectTable={handleTableSelect} />

                {/* Pass down the selected table from the Tables component to auto-fill the form if needed */}
                <Reservations predefinedTable={selectedTableType} />
            </main>

            <Footer />
            <AiAssistant />
        </>
    );
}
