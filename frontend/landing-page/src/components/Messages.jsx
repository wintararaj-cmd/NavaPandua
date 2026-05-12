import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const messages = [
  {
    role: "Chairman's Message",
    name: "Asit Chattopadhyay",
    message: "Welcome to Nabodaya Educational Trust. Our mission is to work for education, empowerment, and social development with honesty and dedication. We believe that education and skill development can bring positive change to society and create a brighter future for the next generation. We are committed to supporting students, women, youth, and underprivileged communities through meaningful initiatives and social service activities.",
    quote: "Together, we can build an educated and empowered society.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    role: "Secretary's Message",
    name: "Sib Sankar Saha",
    message: "At Nabodaya Educational Trust, we continuously work to create opportunities for learning, skill development, and social awareness. Our goal is to encourage confidence, self-reliance, and community participation through education and social initiatives. We sincerely thank all supporters, members, and well-wishers for their trust and cooperation.",
    quote: "Education and empowerment are the keys to social progress.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    role: "Treasurer's Message",
    name: "Supriti Chattopadhyay",
    message: "Transparency, responsibility, and dedication are the core values of Nabodaya Educational Trust. We remain committed to managing our resources effectively for educational, social, and welfare activities that benefit the community. Our aim is to ensure that every initiative creates meaningful and lasting impact.",
    quote: "Serving society with responsibility and commitment.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  }
];

const Messages = () => {
  return (
    <section id="messages" className="messages-section" style={{ backgroundColor: 'var(--bg-light)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">OUR <span className="text-accent" style={{ textTransform: 'lowercase' }}>leadership</span></span>
          <h2 className="section-title">Messages from our Board</h2>
          <p className="section-desc">
            The guiding voices behind Nabodaya Educational Trust, committed to social progress and community welfare.
          </p>
        </div>

        <div className="messages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
          {messages.map((item, index) => (
            <motion.div 
              key={index}
              className="message-card"
              style={{
                background: 'var(--white)',
                padding: '2.5rem',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-card)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="quote-icon" style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--primary)', opacity: 0.3 }}>
                <Quote size={40} />
              </div>
              
              <div className="message-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="leader-image" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--secondary)' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: '700', textTransform: 'uppercase' }}>{item.role}</span>
                </div>
              </div>

              <div className="message-body" style={{ flex: 1 }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: '1.7', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  "{item.message}"
                </p>
              </div>

              <div className="message-footer" style={{ borderTop: '2px solid var(--bg-light)', paddingTop: '1.5rem' }}>
                <p style={{ margin: 0, fontWeight: '700', color: 'var(--secondary)', fontSize: '1rem', textAlign: 'center' }}>
                  "{item.quote}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Messages;
