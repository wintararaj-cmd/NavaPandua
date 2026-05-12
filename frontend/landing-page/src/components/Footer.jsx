import React from 'react';
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & About */}
          <div className="footer-brand-section">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/logo.png" alt="Logo" />
              </div>
              <div className="footer-brand-text">
                <div className="footer-name">NABODAYA</div>
                <div className="footer-tagline">Educational Trust</div>
              </div>
            </div>
            <p className="footer-desc">
              Nabodaya Educational Trust is a dedicated educational and social welfare organization 
              working for education, skill development, women empowerment, digital literacy, and community welfare.
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-icon"><Facebook /></a>
              <a href="#" className="footer-social-icon"><Twitter /></a>
              <a href="#" className="footer-social-icon"><Instagram /></a>
              <a href="#" className="footer-social-icon"><Linkedin /></a>
              <a href="#" className="footer-social-icon"><Youtube /></a>
            </div>
          </div>

          {/* Our Work */}
          <div className="footer-col">
            <h4>Our Activities</h4>
            <ul>
              <li><a href="#focus">Educational Support</a></li>
              <li><a href="#focus">Digital Literacy</a></li>
              <li><a href="#focus">Skill Development</a></li>
              <li><a href="#focus">Women Empowerment</a></li>
              <li><a href="#focus">Community Welfare</a></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div className="footer-col">
            <h4>Get Involved</h4>
            <ul>
              <li><a href="#">Donate Now</a></li>
              <li><a href="#">Volunteer</a></li>
              <li><a href="#">Corporate Partnerships</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col footer-newsletter">
            <h4>Join The Movement</h4>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1rem', lineHeight: '1.6' }}>
              Sign up for our newsletter to receive updates on how you can help 
              us change children's lives.
            </p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email Address" required />
              <button type="submit" className="btn btn-yellow">
                SUBSCRIBE <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright">
            © 2026 Nabodaya Education Trust. All Rights Reserved. | Registered under IT Act 12A & 80G.
          </div>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
