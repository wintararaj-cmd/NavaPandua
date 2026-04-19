import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FocusAreas from './components/FocusAreas';
import Impact from './components/Impact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <FocusAreas />
      <Impact />
      
      {/* Call to Action Section */}
      <section style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white' }}>Join Us in Closing the <span style={{ color: 'var(--accent)' }}>Equity Gap</span>.</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto 2.5rem' }}>
            Whether you're a parent, teacher, or community leader, your voice matters in the fight for educational justice.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#" className="btn" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>Donate Now</a>
            <a href="#" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Volunteer</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
