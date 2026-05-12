import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const areas = [
  {
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Educational Support",
    description: "Educational Support & Learning Programs, including Child Education & Awareness Programs.",
    color: "var(--primary)"
  },
  {
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Digital Literacy",
    description: "Computer and Digital Literacy Training to bridge the digital divide for students and youth.",
    color: "var(--accent-orange)"
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Skill Development",
    description: "Skill Development & Vocational Courses to help people become self-reliant.",
    color: "var(--accent-teal)"
  },
  {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Women Empowerment",
    description: "Initiatives focused on empowering women through awareness and social support.",
    color: "var(--accent-pink)"
  },
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Youth Guidance",
    description: "Youth Career Guidance & Personality Development for a better future.",
    color: "var(--accent-purple)"
  },
  {
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Health & Social",
    description: "Health, Hygiene & Social Awareness Campaigns for community welfare.",
    color: "var(--accent-teal)"
  }
];

const FocusAreas = () => {
  return (
    <section id="focus" className="focus-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">WHAT WE <span className="text-accent" style={{ textTransform: 'lowercase', color: 'var(--primary-dark)' }}>do</span></span>
          <div className="focus-title-bar">
            <h2>Our Key Activities</h2>
          </div>
          <p className="section-desc">
            At Nabodaya Educational Trust, we work towards education, empowerment, skill development, 
            and social welfare for building a stronger and better society.
          </p>
        </div>

        <div className="focus-grid">
          {areas.map((area, index) => (
            <motion.div 
              key={index}
              className="focus-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <img src={area.image} alt={area.title} className="focus-card-image" />
              <div className="focus-card-body">
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <a href="#more" className="focus-card-link" style={{ color: area.color }}>
                  LEARN MORE <ArrowRight size={16} />
                </a>
              </div>
              <div className="focus-card-border" style={{ backgroundColor: area.color }}></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FocusAreas;
