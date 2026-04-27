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
                <div className="footer-tagline">Education Trust</div>
              </div>
            </div>
            <p className="footer-desc">
              Nabodaya Education Trust is an Indian NGO working to ensure happier 
              childhoods for all children by giving them access to education, 
              proper healthcare, and protection from exploitation.
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
            <h4>What We Do</h4>
            <ul>
              <li><a href="#">Education</a></li>
              <li><a href="#">Health & Nutrition</a></li>
              <li><a href="#">Child Protection</a></li>
              <li><a href="#">Child Participation</a></li>
              <li><a href="#">Our Reach</a></li>
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
