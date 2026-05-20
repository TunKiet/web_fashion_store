import { motion } from 'framer-motion';
import { ShoppingBag, Search, User, Heart } from 'lucide-react';

function Header({ activeCategory, setActiveCategory, cartItemCount, setIsCartOpen, isScrolled, currentUser, onLogout, onOpenAuth, favoriteCount }) {
  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo-img-container">
          <img src="/images/the_k_luxury_logo_transparent.png" alt="The K Luxury" className="logo-img" />
        </div>

        <nav className="nav-links">
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

        <div className="header-actions">
          <button className="icon-btn" aria-label="Tìm kiếm">
            <Search size={18} />
          </button>

          <button 
            className="icon-btn wishlist-icon-wrapper" 
            onClick={() => {
              // Click vào icon wishlist sẽ lọc xem các sản phẩm đã yêu thích
              setActiveCategory(activeCategory === 'WISHLIST' ? 'ALL' : 'WISHLIST');
              // Tự động cuộn xuống phần grid sản phẩm
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
      </div>
    </header>
  );
}

export default Header;
