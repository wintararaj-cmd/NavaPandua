import { Mail, Phone, MapPin, Globe, Share2, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '5rem 0 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <img src="/logo.jpeg" alt="Logo" style={{ height: '40px', filter: 'brightness(1.5)' }} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>Navadaya Education Trust</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '300px' }}>
              Ensuring educational equity and excellence for every student, regardless of their background or geography.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Globe size={20} style={{ cursor: 'pointer', opacity: 0.8 }} />
              <Share2 size={20} style={{ cursor: 'pointer', opacity: 0.8 }} />
              <Info size={20} style={{ cursor: 'pointer', opacity: 0.8 }} />
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Our Work</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Reports</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Careers</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Terms of Use</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Accessibility</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Stay Updated</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Receive updates on educational equity and policy right in your inbox.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="email" 
                placeholder="Email address" 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: 'white',
                  flex: 1
                }} 
              />
              <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}>Join</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          <p>© 2026 Navadaya Education Trust. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span>Contact: (123) 456-7890</span>
            <span>Email: info@navadaya.org</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
