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
  setSearchQuery,
  onOpenAdmin,
  categories = [],
  onOpenProfile
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

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

        <div 
          className="logo-img-container" 
          style={{ visibility: isSearchOpen ? 'hidden' : 'visible', cursor: 'pointer' }}
          onClick={() => setActiveCategory('ALL')}
        >
          <img src="/images/the_k_luxury_logo_transparent.png" alt="The K Luxury" className="logo-img" />
        </div>

        <nav className="nav-links" style={{ visibility: isSearchOpen ? 'hidden' : 'visible' }}>
          <button
            className={`nav-link ${activeCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ALL')}
            style={{ position: 'relative' }}
          >
            Bộ Sưu Tập
            {activeCategory === 'ALL' && (
              <motion.div
                layoutId="activeNavLine"
                className="active-nav-line"
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              />
            )}
          </button>

          <button
            className={`nav-link ${activeCategory === 'NEWS' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory('NEWS');
              const grid = document.getElementById('shop-grid');
              if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ position: 'relative' }}
          >
            Tin Tức Thời Trang
            {activeCategory === 'NEWS' && (
              <motion.div
                layoutId="activeNavLine"
                className="active-nav-line"
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
              />
            )}
          </button>

          {categories.filter(c => !c.parent).map(parent => {
            const children = categories.filter(c => c.parent === parent.id);
            const isParentActive = activeCategory.toLowerCase() === parent.name.toLowerCase() || 
              children.some(child => activeCategory.toLowerCase() === child.name.toLowerCase());
            
            if (children.length > 0) {
              return (
                <div key={parent.id} className="nav-item-dropdown-container">
                  <button
                    className={`nav-link ${isParentActive ? 'active' : ''}`}
                    onClick={() => setActiveCategory(parent.name)}
                    style={{ position: 'relative' }}
                  >
                    {parent.name}
                    {isParentActive && (
                      <motion.div
                        layoutId="activeNavLine"
                        className="active-nav-line"
                        transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                      />
                    )}
                  </button>
                  <div className="nav-dropdown-menu">
                    {children.map(child => (
                      <button
                        key={child.id}
                        className={`dropdown-item-btn ${activeCategory.toLowerCase() === child.name.toLowerCase() ? 'active' : ''}`}
                        onClick={() => setActiveCategory(child.name)}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={parent.id}
                className={`nav-link ${activeCategory.toLowerCase() === parent.name.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveCategory(parent.name)}
                style={{ position: 'relative' }}
              >
                {parent.name}
                {activeCategory.toLowerCase() === parent.name.toLowerCase() && (
                  <motion.div
                    layoutId="activeNavLine"
                    className="active-nav-line"
                    transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

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
            <div className="auth-user-welcome" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={onOpenProfile}
                className="user-profile-toggle-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-black)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  fontSize: '12px',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#d1a852';
                  e.currentTarget.style.backgroundColor = 'rgba(209, 168, 82, 0.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--color-black)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <User size={14} style={{ color: '#d1a852' }} />
                <span>{currentUser.name}</span>
              </button>
              {(currentUser.is_superuser || currentUser.is_staff) && (
                <button 
                  className="auth-admin-btn" 
                  onClick={onOpenAdmin}
                  style={{
                    color: '#d1a852',
                    background: 'none',
                    border: '1px solid #d1a852',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(209, 168, 82, 0.1)'; }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                >
                  Admin
                </button>
              )}
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
