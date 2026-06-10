const FacebookIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 12 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9"/>
  </svg>
);

function Footer({ categories = [], setActiveCategory }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid-aura">
          {/* Column 1: Brand details */}
          <div className="footer-brand-col">
            <div className="logo-text-container" style={{ alignItems: 'flex-start', marginBottom: '20px' }}>
              <span className="brand-aura" style={{ fontSize: '22px', letterSpacing: '6px' }}>AURA</span>
              <span className="brand-paris" style={{ fontSize: '8px', letterSpacing: '4px' }}>PARIS</span>
            </div>
            <p className="brand-desc-para">
              Fine-tailored silhouettes and access-screened volume of haute couture. Mỗi thiết kế tôn vinh phong thái tối thượng và sự lịch lãm vượt thời gian của bạn.
            </p>
            
            <div className="footer-social-circle-row">
              <a href="#facebook" className="social-circle-btn" aria-label="Facebook">
                <FacebookIcon size={12} />
              </a>
              <a href="#twitter" className="social-circle-btn" aria-label="Twitter">
                <TwitterIcon size={12} />
              </a>
              <a href="#instagram" className="social-circle-btn" aria-label="Instagram">
                <InstagramIcon size={12} />
              </a>
              <a href="#youtube" className="social-circle-btn" aria-label="Youtube">
                <YoutubeIcon size={12} />
              </a>
            </div>
          </div>

          {/* Column 2: Shop links */}
          <div className="footer-menu-col">
            <h4 className="footer-col-title">Shop</h4>
            <ul className="footer-menu-links">
              <li>
                <a href="#shop-grid" onClick={(e) => {
                  e.preventDefault();
                  if (setActiveCategory) setActiveCategory('ALL');
                  const el = document.getElementById('shop-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  About
                </a>
              </li>
              <li>
                <a href="#shop-grid" onClick={(e) => {
                  e.preventDefault();
                  if (setActiveCategory) setActiveCategory('ALL');
                  const el = document.getElementById('shop-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#shop-grid" onClick={(e) => {
                  e.preventDefault();
                  if (setActiveCategory) setActiveCategory('ALL');
                  const el = document.getElementById('shop-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: About links */}
          <div className="footer-menu-col">
            <h4 className="footer-col-title">About</h4>
            <ul className="footer-menu-links">
              <li><a href="#about">Lewis</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#fainess">Fainess</a></li>
            </ul>
          </div>

          {/* Column 4: Email Locator & Store Locator */}
          <div className="footer-locator-col">
            <h4 className="footer-col-title">EMAIL LOCATOR</h4>
            <p className="locator-subtext">Sign up to track and access preview volume of haute couture.</p>
            
            <form className="email-locator-form" onSubmit={(e) => { e.preventDefault(); alert("Email đăng ký thành công! Quý khách sẽ sớm nhận được thư mời preview đặc quyền."); }}>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="email-locator-input" 
                required 
              />
              <button type="submit" className="email-locator-submit-btn">SIGN UP</button>
            </form>

            <button 
              className="store-locator-btn" 
              onClick={() => alert("Hệ thống Flagship Boutique của AURA PARIS hiện khả dụng tại: Quận 1, Tp. Hồ Chí Minh & Hoàn Kiếm, Hà Nội.")}
            >
              STORE LOCATOR
            </button>
          </div>
        </div>

        {/* Bottom copyright & guidelines */}
        <div className="footer-bottom-aura">
          <div className="guidelines-links-row">
            <a href="#vogue">Vogue series directories</a>
            <span className="separator">|</span>
            <a href="#service">Service information</a>
            <span className="separator">|</span>
            <a href="#privacy">Privacy Guidelines</a>
          </div>
          <p className="copyright-aura-text">The runway archives. &copy; {new Date().getFullYear()}. AURA PARIS.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
