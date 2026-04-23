import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const areas = [
  {
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Education",
    description: "Ensuring children stay in school and receive quality education through our learning centers and school support programs.",
    color: "var(--primary)"
  },
  {
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Nutrition & Health",
    description: "Addressing malnutrition and providing basic healthcare to children and mothers in underserved communities.",
    color: "var(--accent-orange)"
  },
  {
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Safety & Protection",
    description: "Protecting children from labor, child marriage, and exploitation while creating safe environments.",
    color: "var(--accent-teal)"
  },
  {
    image: "https://images.unsplash.com/photo-1473649085228-583485e6e4d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    title: "Child Participation",
    description: "Empowering children to know their rights and actively participate in their own development and governance.",
    color: "var(--accent-pink)"
  }
];

const FocusAreas = () => {
  return (
    <section id="focus" className="focus-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">WHAT WE <span className="text-accent" style={{ textTransform: 'lowercase', color: 'var(--primary-dark)' }}>do</span></span>
          <div className="focus-title-bar">
            <h2>Our Focus Areas</h2>
          </div>
          <p className="section-desc">
            We work at all levels—with children, communities, and government—to ensure lasting change 
            in the lives of marginalized children.
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
