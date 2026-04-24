import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FocusAreas from './components/FocusAreas';
import Impact from './components/Impact';
import Footer from './components/Footer';
import AdmissionForm from './components/AdmissionForm';
import { Heart } from 'lucide-react';

function LandingPage() {
  return (
    <>
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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admission" element={<AdmissionForm />} />
        </Routes>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
