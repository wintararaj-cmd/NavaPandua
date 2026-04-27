import React from 'react';
import { Link } from 'react-scroll';
import { Mail, Phone, Search, Heart } from 'lucide-react';

const Navbar = () => {
  return (
    <header>
      {/* Top Utility Bar - Dark */}
      <div className="topbar">
        <div className="container">
          <div className="topbar-left">
            <span className="topbar-item">
              <Mail /> info@nabodaya.org
            </span>
            <span className="topbar-item">
              <Phone /> +91 98765 43210
            </span>
          </div>
          <div className="topbar-right">
            <span className="topbar-item" style={{ cursor: 'pointer' }}>
              <Search /> Search
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-inner">
          {/* Logo Block - Yellow, overlapping */}
          <div className="logo-wrapper">
            <Link to="hero" smooth={true} duration={500} className="logo-block">
              <img src="/logo.png" alt="Nabodaya Logo" />
            </Link>
            <div className="brand-text">
              <span className="name">Nabodaya</span>
              <span className="tagline">Education Trust</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="nav-links">
            <Link to="hero" smooth={true} duration={500} className="nav-link">Home</Link>
            <Link to="about" smooth={true} duration={500} className="nav-link">Who We Are</Link>
            <Link to="focus" smooth={true} duration={500} className="nav-link">What We Do</Link>
            <Link to="impact" smooth={true} duration={500} className="nav-link">Our Impact</Link>
            <Link to="stories" smooth={true} duration={500} className="nav-link">Stories</Link>
          </div>

          {/* CTA Buttons */}
          <div className="nav-cta">
            <a 
              href="/admission" 
              className="btn btn-outline-dark"
              style={{ padding: '10px 20px', fontSize: '0.8rem' }}
            >
              Admission
            </a>
            <a 
              href={`${import.meta.env.VITE_ADMIN_PORTAL_URL || (import.meta.env.PROD ? 'https://admin.nabodaya.in' : 'http://localhost:5173')}/login`} 
              className="btn btn-outline-dark"
              style={{ padding: '10px 20px', fontSize: '0.8rem' }}
            >
              ERP Login
            </a>
            <a href="#donate" className="btn btn-yellow" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
              <Heart size={16} /> Donate Now
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
