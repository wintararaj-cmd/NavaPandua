import React from 'react';
import { BookOpen, Users, BarChart, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const areas = [
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "Curriculum development and teacher training programs designed to elevate standards across all institutions."
  },
  {
    icon: Users,
    title: "Educational Equity",
    description: "Ensuring marginalized communities have equal access to advanced infrastructure and career pathways."
  },
  {
    icon: BarChart,
    title: "Policy & Research",
    description: "Data-driven advocacy to influence educational reform at the state and national levels."
  },
  {
    icon: ShieldCheck,
    title: "Institutional Support",
    description: "Financial and administrative guidance for schools and computer centers under the Navadaya umbrella."
  }
];

const FocusAreas = () => {
  return (
    <section id="focus" style={{ backgroundColor: 'var(--bg-soft)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">Common Goals, Unique Paths</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>
            We bridge the gap between potential and opportunity through focused intervention in key educational sectors.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {areas.map((area, index) => (
            <motion.div 
              key={index}
              whileHover={{ translateY: -10 }}
              style={{
                background: 'white',
                padding: '3rem 2rem',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: 'var(--bg-soft)', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.5rem',
                color: 'var(--primary)'
              }}>
                <area.icon size={30} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>{area.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{area.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FocusAreas;
