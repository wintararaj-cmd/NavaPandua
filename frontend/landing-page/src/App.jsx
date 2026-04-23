import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FocusAreas from './components/FocusAreas';
import Impact from './components/Impact';
import Footer from './components/Footer';
import { Heart } from 'lucide-react';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <FocusAreas />
      <Impact />
      
      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <h2>
            BE THE <span className="script">change</span> IN A CHILD'S LIFE
          </h2>
          <p>
            Your contribution can provide a child with the education, nutrition, and safety they deserve. 
            Join us in our mission to create a brighter future. No matter how small, every act of kindness counts.
          </p>
          <div className="cta-buttons">
            <a href="#donate" className="btn btn-yellow" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              <Heart size={20} /> Donate Now
            </a>
            <a href="#volunteer" className="btn btn-outline-white" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Volunteer With Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
