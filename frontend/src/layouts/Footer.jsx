function Footer({ categories = [], setActiveCategory }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img src="/images/the_k_luxury_logo_transparent.png" alt="The K Luxury" className="footer-logo-img" />
            </div>
            <p>Thương hiệu thời trang cao cấp độc bản đem lại trải nghiệm sang trọng và bền vững. Mỗi sản phẩm được sinh ra như một tác phẩm nghệ thuật, tôn vinh phong thái lịch lãm của bạn.</p>
          </div>
          <div className="footer-col">
            <h4>Cửa Hàng</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <a
                  href="#shop-grid"
                  onClick={(e) => {
                    e.preventDefault();
                    if (setActiveCategory) setActiveCategory('ALL');
                    const el = document.getElementById('shop-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Tất Cả Sản Phẩm
                </a>
              </li>
              {categories.map(c => (
                <li key={c.id} className="footer-link-item">
                  <a
                    href="#shop-grid"
                    onClick={(e) => {
                      e.preventDefault();
                      if (setActiveCategory) setActiveCategory(c.name);
                      const el = document.getElementById('shop-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Thương Hiệu</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item"><a href="#our-story">Hành Trình</a></li>
              <li className="footer-link-item"><a href="#craftsmanship">Nghệ Thuật Thủ Công</a></li>
              <li className="footer-link-item"><a href="#sustainability">Thời Trang Bền Vững</a></li>
              <li className="footer-link-item"><a href="#careers">Tuyển Dụng</a></li>
            </ul>
          </div>
          <div className="footer-col footer-newsletter">
            <h4>Bản Tin</h4>
            <p>Đăng ký nhận quyền tiếp cận sớm các bộ sưu tập mới và sự kiện thời trang đặc quyền.</p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã đăng ký nhận bản tin đặc quyền của chúng tôi."); }}>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">Đăng Ký</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} The K Luxury. Bảo lưu mọi quyền.</p>
          <div className="footer-socials">
            <a href="#instagram" className="social-link">Make By TUAN KIET</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
