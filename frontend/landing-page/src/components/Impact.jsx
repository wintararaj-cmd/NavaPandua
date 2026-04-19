import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: "Students Empowered", value: "50,000+" },
  { label: "Partner Schools", value: "120+" },
  { label: "Community Centers", value: "45+" },
  { label: "Annual Research Projects", value: "15+" }
];

const Impact = () => {
  return (
    <section id="impact">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <h2 className="section-title">A Decade of Driving <span style={{ color: 'var(--primary)' }}>Real Change</span>.</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We don't just talk about change; we measure it. Our data shows a consistent increase in college enrollment and vocational proficiency among the students in our network.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {stats.map((stat, index) => (
                <div key={index}>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.2rem' }}>{stat.value}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <img 
              src="https://images.unsplash.com/photo-1544333346-64e4fe18204b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
              alt="Impact" 
              style={{ width: '100%', borderRadius: '24px' }} 
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              cursor: 'pointer'
            }}>
              <div style={{ 
                width: '0', 
                height: '0', 
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '18px solid var(--primary)',
                marginLeft: '5px'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
