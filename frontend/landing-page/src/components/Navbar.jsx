import React from 'react';
import { Link } from 'react-scroll';

const Navbar = () => {
  return (
    <nav className="glass-nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.jpeg" alt="Navadaya Logo" style={{ height: '50px', borderRadius: '5px' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--secondary)', letterSpacing: '-0.5px' }}>
            Navadaya <span style={{ color: 'var(--primary)' }}>Education Trust</span>
          </span>
        </div>
        
        <div className="links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="hero" smooth={true} duration={500} className="nav-link">Home</Link>
          <Link to="focus" smooth={true} duration={500} className="nav-link">Focus Areas</Link>
          <Link to="impact" smooth={true} duration={500} className="nav-link">Our Impact</Link>
          <a href="/donate" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Donate</a>
          <a 
            href="http://localhost:5173/login" 
            className="btn btn-outline" 
            style={{ 
              padding: '0.6rem 1.5rem', 
              fontSize: '0.85rem',
              borderColor: 'var(--secondary)',
              color: 'var(--secondary)'
            }}
          >
            ERP Login
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
