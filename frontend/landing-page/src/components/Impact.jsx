import React from 'react';
import { motion } from 'framer-motion';
import { Users, Home, Shield, BookOpen, ArrowRight } from 'lucide-react';

const stats = [
  { icon: Users, label: "Children Impacted", value: "3M+" },
  { icon: Home, label: "Villages Reached", value: "5000+" },
  { icon: Shield, label: "Child Marriages Stopped", value: "2000+" },
  { icon: BookOpen, label: "Schools Supported", value: "1500+" }
];

const Impact = () => {
  return (
    <>
      {/* IMPACT STATS SECTION */}
      <section id="impact" className="impact-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '3rem' }}>
            <span className="section-label" style={{ color: 'var(--secondary)' }}>
              OUR <span className="text-accent" style={{ color: 'var(--white)', textTransform: 'lowercase' }}>impact</span>
            </span>
            <h2 className="section-title" style={{ fontSize: '3.2rem' }}>
              Creating Positive <br/>Social Change
            </h2>
            <p className="section-desc" style={{ color: 'var(--secondary)', marginTop: '1rem', fontWeight: '500' }}>
              Nabodaya Educational Trust is continuously working to create positive social change 
              through education, skill development, digital literacy, and community support.
            </p>
          </div>

          <div className="impact-grid">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="impact-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="impact-icon">
                  <stat.icon />
                </div>
                <div className="impact-number">{stat.value}</div>
                <div className="impact-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section id="stories" className="story-section">
        <div className="container">
          <div className="story-grid">
            <motion.div 
              className="story-image-curl-wrapper"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="curl-yellow-bg"></div>
              <div className="curl-image-container" style={{ height: '400px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1544333346-64e4fe18204b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Geeta's Story" 
                />
              </div>
            </motion.div>

            <motion.div 
              className="story-content"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="story-label">Our Vision</span>
              <h3>Empowering Communities <br/>Through Knowledge</h3>
              <p>
                Through our initiatives, we aim to empower students, women, youth, and underprivileged communities 
                by providing opportunities for learning, awareness, and self-reliance.
              </p>
              <blockquote>
                "Our impact reflects our commitment to building a more educated, skilled, and empowered society."
              </blockquote>
              <p>
                Every day, we witness the transformation of lives as individuals gain the skills 
                and confidence to build a better future for themselves and their families.
              </p>
              <a href="#focus" className="btn btn-yellow" style={{ marginTop: '1.5rem' }}>
                See Our Work <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Impact;
