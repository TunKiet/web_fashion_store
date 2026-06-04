import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Heart, X, Sparkles } from 'lucide-react';
import { getAiRecommendations } from '../services/api';

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
  onOpenProfile,
  onOpenDetails,
  onAddToCart
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [hasSearchedAi, setHasSearchedAi] = useState(false);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setAiRecommendations([]);
      setHasSearchedAi(false);
      setAiError('');
    }

    const grid = document.getElementById('shop-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setAiRecommendations([]);
    setIsAiLoading(false);
    setAiError('');
    setHasSearchedAi(false);
  };

  const handleAiSuggest = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setAiError('Vui lòng nhập phong cách hoặc mô tả sản phẩm bạn cần tìm.');
      setAiRecommendations([]);
      setHasSearchedAi(true);
      return;
    }
    
    setIsAiLoading(true);
    setAiError('');
    setAiRecommendations([]);
    setHasSearchedAi(true);

    try {
      const response = await getAiRecommendations(query);
      if (response.data && response.data.recommendations) {
        setAiRecommendations(response.data.recommendations);
      } else {
        setAiRecommendations([]);
      }
    } catch (err) {
      console.error("Lỗi khi lấy gợi ý từ AI:", err);
      setAiError('Không thể lấy gợi ý lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc OpenAI API Key.');
    } finally {
      setIsAiLoading(false);
    }
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
              <div className="search-bar-inner" style={{ position: 'relative' }}>
                <Search size={18} className="search-bar-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="header-search-input"
                  placeholder="TÌM KIẾM THIẾT KẾ CAO CẤP, CHẤT LIỆU, DANH MỤC..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button 
                  className="ai-suggest-btn" 
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                  type="button"
                  title="AI gợi ý sản phẩm"
                >
                  <Sparkles size={14} className="sparkle-icon" />
                  <span>Gợi ý AI</span>
                </button>
                <button className="icon-btn search-close-btn" onClick={handleCloseSearch} aria-label="Đóng tìm kiếm">
                  <X size={18} />
                </button>

                {/* AI dropdown results */}
                {hasSearchedAi && (
                  <div className="search-dropdown-results">
                    {isAiLoading ? (
                      <div className="search-ai-loading">
                        <div className="spinner"></div>
                        <p>Trợ lý AI đang tuyển chọn thiết kế cao cấp cho quý khách...</p>
                      </div>
                    ) : aiError ? (
                      <div className="search-ai-error">
                        <p>{aiError}</p>
                      </div>
                    ) : aiRecommendations.length === 0 ? (
                      <div className="search-ai-empty">
                        <p>Không tìm thấy thiết kế nào phù hợp. Quý khách vui lòng thử mô tả khác.</p>
                      </div>
                    ) : (
                      <div className="search-ai-recommendations-list">
                        <h4 className="search-ai-title">Gợi ý từ trợ lý thời trang AI</h4>
                        <div className="ai-items-grid">
                          {aiRecommendations.map((item) => {
                            const imgUrl = item.image_url 
                              ? (item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000${item.image_url}`)
                              : '/images/fashion_dress.png';
                            return (
                              <div key={item.id} className="ai-item-row">
                                <img 
                                  src={imgUrl} 
                                  alt={item.title} 
                                  className="ai-item-img"
                                />
                                <div className="ai-item-details">
                                  <span className="ai-item-cat">{item.category}</span>
                                  <h5 className="ai-item-name">{item.title}</h5>
                                  <span className="ai-item-price">
                                    {parseFloat(item.price).toLocaleString('vi-VN')} đ
                                  </span>
                                  {item.recommendation_reason && (
                                    <p className="ai-item-reason">
                                      <Sparkles size={10} className="reason-sparkle" />
                                      <span>{item.recommendation_reason}</span>
                                    </p>
                                  )}
                                </div>
                                <div className="ai-item-actions">
                                  <button 
                                    className="ai-action-btn view-detail"
                                    onClick={() => {
                                      onOpenDetails(item);
                                      handleCloseSearch();
                                    }}
                                  >
                                    Chi tiết
                                  </button>
                                  <button 
                                    className="ai-action-btn add-to-cart"
                                    onClick={() => {
                                      onAddToCart(item);
                                    }}
                                  >
                                    Thêm vào giỏ
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;
