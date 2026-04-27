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
              Transforming Lives <br/>Since 1979
            </h2>
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
              <span className="story-label">Success Story</span>
              <h3>Giving wings to dreams: <br/>Meet Geeta</h3>
              <p>
                Geeta comes from a remote village where girls rarely study past middle school. 
                When her family faced financial hardships, she was forced to drop out and work 
                in the fields to support them.
              </p>
              <blockquote>
                "I always wanted to study and become a teacher, but my circumstances forced me 
                to put my dreams on hold."
              </blockquote>
              <p>
                Through Nabodaya's intervention and counseling, Geeta was re-enrolled in school. 
                Today, she is not only completing her high school education but also tutoring 
                younger children in her community.
              </p>
              <a href="#all-stories" className="btn btn-yellow" style={{ marginTop: '1.5rem' }}>
                Read More Stories <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Impact;
