import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Heart, X } from 'lucide-react';

function Header({ 
  activeCategory, 
  setActiveCategory, 
  cartItemCount, 
  setIsCartOpen, 
  isScrolled, 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  favoriteCount,
  searchQuery,
  setSearchQuery
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Tự động focus vào ô tìm kiếm khi mở
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Cuộn nhẹ xuống grid sản phẩm để thấy kết quả thời gian thực
    const grid = document.getElementById('shop-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container" style={{ position: 'relative' }}>
        
        {/* LOGO THƯƠNG HIỆU */}
        <div className="logo-img-container" style={{ visibility: isSearchOpen ? 'hidden' : 'visible' }}>
          <img src="/images/the_k_luxury_logo_transparent.png" alt="The K Luxury" className="logo-img" />
        </div>

        {/* CÁC ĐƯỜNG LINK DANH MỤC */}
        <nav className="nav-links" style={{ visibility: isSearchOpen ? 'hidden' : 'visible' }}>
          <button 
            className={`nav-link ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ALL')}
          >
            Bộ Sưu Tập
          </button>
          <button 
            className={`nav-link ${activeCategory === 'DRESSES' ? 'active' : ''}`}
            onClick={() => setActiveCategory('DRESSES')}
          >
            Đầm Dạ Hội
          </button>
          <button 
            className={`nav-link ${activeCategory === 'OUTERWEAR' ? 'active' : ''}`}
            onClick={() => setActiveCategory('OUTERWEAR')}
          >
            Áo Khoác
          </button>
          <button 
            className={`nav-link ${activeCategory === 'ACCESSORIES' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ACCESSORIES')}
          >
            Phụ Kiện
          </button>
        </nav>

        {/* HÀNH ĐỘNG ICON TRÊN HEADER */}
        <div className="header-actions" style={{ visibility: isSearchOpen ? 'hidden' : 'visible' }}>
          <button className="icon-btn" onClick={() => setIsSearchOpen(true)} aria-label="Tìm kiếm">
            <Search size={18} />
          </button>

          <button 
            className="icon-btn wishlist-icon-wrapper" 
            onClick={() => {
              setActiveCategory(activeCategory === 'WISHLIST' ? 'ALL' : 'WISHLIST');
              const grid = document.getElementById('shop-grid');
              if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Danh sách yêu thích"
          >
            <Heart size={18} fill={favoriteCount > 0 ? "#d1a852" : "none"} color={favoriteCount > 0 ? "#d1a852" : "currentColor"} />
            {favoriteCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="wishlist-badge"
              >
                {favoriteCount}
              </motion.span>
            )}
          </button>
          
          {currentUser ? (
            <div className="auth-user-welcome">
              <span>{currentUser.name}</span>
              <button className="auth-logout-btn" onClick={onLogout}>Thoát</button>
            </div>
          ) : (
            <button className="icon-btn" onClick={onOpenAuth} aria-label="Tài khoản">
              <User size={18} />
            </button>
          )}

          <button 
            className="icon-btn cart-icon-wrapper" 
            onClick={() => setIsCartOpen(true)}
            aria-label="Giỏ hàng"
          >
            <ShoppingBag size={18} />
            {cartItemCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="cart-badge"
              >
                {cartItemCount}
              </motion.span>
            )}
          </button>
        </div>

        {/* THANH TÌM KIẾM TRƯỢT XUỐNG CAO CẤP */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="header-search-overlay"
            >
              <div className="search-bar-inner">
                <Search size={18} className="search-bar-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="header-search-input"
                  placeholder="TÌM KIẾM THIẾT KẾ CAO CẤP, CHẤT LIỆU, DANH MỤC..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button className="icon-btn search-close-btn" onClick={handleCloseSearch} aria-label="Đóng tìm kiếm">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;
