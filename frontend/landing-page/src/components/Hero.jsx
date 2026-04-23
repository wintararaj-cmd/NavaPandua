import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="container">
        <div className="hero-grid">
          {/* Left - Text Content */}
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>
              Ensuring{' '}
              <span className="script">happy</span>
              <br />
              <span className="highlight">childhoods</span>
              <br />
              for all children.
            </h1>
            <p className="hero-text">
              Navadaya Education Trust works to create a world where every child 
              has the opportunity to learn, grow, and thrive — regardless of 
              their background or geography.
            </p>
            <div className="hero-buttons">
              <a href="#donate" className="btn btn-yellow" style={{ padding: '16px 40px', fontSize: '1rem' }}>
                <Heart size={18} /> Yes! I Want To Help
              </a>
              <a href="#focus" className="btn btn-outline-dark" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Right - Hero Image */}
          <motion.div 
            className="hero-image-wrapper"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            {/* The Curl Frame */}
            <div className="hero-curl-frame">
              <div className="curl-yellow-bg"></div>
              <div className="curl-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Happy children learning together" 
                />
              </div>
            </div>
            
            {/* Floating Logo Badge */}
            <div className="hero-logo-badge animate-float">
              <img src="/logo.png" alt="Navadaya Trust" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* SVG Filter for Rough/Brush Edges */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="brush-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="brush-filter-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="10" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" />
          </filter>
        </defs>
      </svg>
    </section>
  );
};

export default Hero;
