import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="hero" style={{ 
      paddingTop: 'calc(var(--header-height) + 4rem)', 
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blur Circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        background: 'rgba(177, 75, 59, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{ 
              color: 'var(--primary)', 
              fontWeight: 700, 
              fontSize: '0.9rem', 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              marginBottom: '1rem',
              display: 'block'
            }}>Building a Brighter Future</span>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--secondary)' }}>
              Empowering <span style={{ color: 'var(--primary)' }}>Education</span> Through Equity.
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px' }}>
              Navadaya Education Trust is dedicated to closing the opportunity gap and ensuring every child has access to high-quality learning environments.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#focus" className="btn btn-primary">Our Mission</a>
              <a href="#impact" className="btn btn-outline">Explore Impact</a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative' }}
          >
            <img 
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Education" 
              style={{ 
                width: '100%', 
                borderRadius: '40px', 
                boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
                zIndex: 2
              }} 
            />
            {/* Logo Overlay - Floating */}
            <div 
              className="animate-float"
              style={{
                position: 'absolute',
                bottom: '-40px',
                left: '-40px',
                width: '200px',
                height: '200px',
                background: 'white',
                borderRadius: '32px',
                boxShadow: 'var(--shadow-premium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 3
              }}
            >
              <img src="/logo.jpeg" alt="Navadaya Trust Logo" style={{ width: '100%', borderRadius: '16px' }} />
            </div>
            {/* Decorative Dot Circle */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              backgroundImage: 'radial-gradient(circle, #B14B3B 2px, transparent 2px)',
              backgroundSize: '20px 20px',
              opacity: 0.3,
              zIndex: 1
            }}></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
