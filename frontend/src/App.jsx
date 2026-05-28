import { useState, useEffect } from 'react';
import { getItems, getCategories } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import './App.css';

// Import layouts
import Header from './layouts/Header';
import Footer from './layouts/Footer';

// Import components
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';

// Fallback sản phẩm cao cấp tiếng Việt khi không kết nối được Django API
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: "Đầm Dạ Hội Lụa Draping Cao Cấp",
    description: "Chiếc đầm dạ hội sang trọng được cắt may từ lụa tơ tằm dâu cao cấp, nổi bật với phần cổ xếp nếp rủ (draping) quyến rũ và dáng váy thướt tha, uyển chuyển theo từng bước chuyển động.",
    price: "31500000.00",
    image_url: "/images/fashion_dress.png",
    category: "Đầm dạ hội",
    is_featured: true
  },
  {
    id: 2,
    title: "Áo Măng Tô Cashmere Khuy Đúp",
    description: "Được chế tác từ sợi len hỗn hợp cashmere hai mặt thượng hạng, chiếc áo măng tô phom dáng khuy đúp (double-breasted) cổ điển này mang lại sự ấm áp tối đa cùng cấu trúc đứng phom thời thượng.",
    price: "47250000.00",
    image_url: "/images/fashion_coat.png",
    category: "Áo khoác",
    is_featured: true
  },
  {
    id: 3,
    title: "Túi Da Đeo Vai Tối Giản",
    description: "Túi đeo vai tối giản làm từ chất liệu da bò nguyên tấm (full-grain calf leather) tuyển chọn. Thiết kế tinh tế với đường nét gọn gàng, khóa mạ vàng gold sang trọng và dây đeo tùy chỉnh.",
    price: "23750000.00",
    image_url: "/images/fashion_bag.png",
    category: "Phụ kiện",
    is_featured: true
  },
  {
    id: 4,
    title: "Áo Blazer Linen May Đo Cổ Điển",
    description: "Chiếc áo blazer một khuy đa năng dệt từ sợi linen cao cấp của Ý. Thiết kế phom dáng thoải mái nhưng vẫn lịch lãm và chỉn chu, hoàn hảo cho những ngày hè sang trọng.",
    price: "18000000.00",
    image_url: "/images/fashion_dress.png",
    category: "Áo khoác",
    is_featured: false
  },
  {
    id: 5,
    title: "Giày Chelsea Da Bò Cổ Điển",
    description: "Đôi giày Chelsea được hoàn thiện thủ công tỉ mỉ bằng chất liệu da bò mềm mại và dẻo dai. Đi kèm phần bo chun hai bên hông linh hoạt và đế da nhiều lớp bền bỉ.",
    price: "21250000.00",
    image_url: "/images/fashion_coat.png",
    category: "Phụ kiện",
    is_featured: false
  },
  {
    id: 6,
    title: "Áo Khoác Trench Wool Cách Điệu",
    description: "Một phiên bản hiện đại từ phom áo khoác dáng dài truyền thống, được may đo trên chất liệu len virgin wool mềm mịn trung tính. Điểm nhấn là thắt lưng bản to và ve áo cứng cáp.",
    price: "36250000.00",
    image_url: "/images/fashion_coat.png",
    category: "Áo khoác",
    is_featured: false
  },
];

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Đầm Dạ Hội", slug: "dam-da-hoi" },
  { id: 2, name: "Áo Khoác", slug: "ao-khoac" },
  { id: 3, name: "Phụ Kiện", slug: "phu-kien" }
];

function App() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('store'); // 'store' or 'admin'

  // Tự động reset về trang 1 và cuộn lên đầu khi lọc danh mục khác hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory, searchQuery]);

  // Khôi phục thông tin đăng nhập từ localStorage khi khởi động
  useEffect(() => {
    const savedUser = localStorage.getItem('the_k_luxury_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Redirect non-admins out of admin view
  useEffect(() => {
    if (view === 'admin' && (!currentUser || (!currentUser.is_superuser && !currentUser.is_staff))) {
      setView('store');
    }
  }, [currentUser, view]);

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('the_k_luxury_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('the_k_luxury_user');
    setView('store');
  };

  const fetchProducts = () => {
    getItems()
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Gắn ảnh cục bộ để đảm bảo giao diện đẹp mắt
          const mappedData = res.data.map((item, index) => {
            let img = item.image_url;
            if (!img) {
              if (index % 3 === 0) img = "/images/fashion_dress.png";
              else if (index % 3 === 1) img = "/images/fashion_coat.png";
              else img = "/images/fashion_bag.png";
            } else if (img.startsWith('/media/')) {
              img = `http://localhost:8000${img}`;
            }
            return { ...item, image_url: img };
          });
          setProducts(mappedData);
        }
      })
      .catch(err => {
        console.warn("Lỗi kết nối Backend API. Sử dụng dữ liệu dự phòng thiết kế cao cấp:", err);
      });
  };

  const fetchCategories = () => {
    getCategories()
      .then(res => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(err => {
        console.warn("Lỗi kết nối Backend API khi tải danh mục. Sử dụng danh mục mặc định:", err);
      });
  };

  // Lấy danh sách sản phẩm và danh mục từ Django Backend API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Xử lý sự kiện scroll để làm hiệu ứng Header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Thêm vào giỏ hàng
  const addToCart = (product, size = 'M') => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      setIsAuthOpen(true);
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id && item.selectedSize === size
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        return [...prevCart, { ...product, selectedSize: size, quantity: 1 }];
      }
    });
    // Kích hoạt trượt mở giỏ hàng ngay lập tức
    setIsCartOpen(true);
  };

  // Cập nhật số lượng sản phẩm trong giỏ
  const updateQuantity = (productId, size, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        (item.id === productId && item.selectedSize === size)
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId, size) => {
    setCart(prevCart =>
      prevCart.filter(item => !(item.id === productId && item.selectedSize === size))
    );
  };

  // Đánh dấu sản phẩm yêu thích (Toggle Favorite)
  const toggleFavorite = (productId) => {
    // ==========================================
    // CHÚ THÍCH KẾT NỐI BACKEND (AUTHENTICATION GATEWAY):
    // Thay thế logic này bằng một POST request gửi tới Backend Django API để lưu sản phẩm yêu thích.
    // Ví dụ: axios.post('/api/wishlist/toggle/', { item_id: productId }, { headers: { Authorization: `Bearer ${token}` } })
    // ==========================================
    if (!currentUser) {
      alert('Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
      setIsAuthOpen(true);
      return;
    }
    // ==========================================

    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Mở modal chi tiết sản phẩm
  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setSelectedSize('M');
  };

  // Điều hướng sản phẩm Trước / Sau trong Modal chi tiết
  const handleNextProduct = () => {
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredProducts.length;
    setSelectedProduct(filteredProducts[nextIndex]);
    setSelectedSize('M'); // reset size khi đổi sản phẩm
  };

  const handlePrevProduct = () => {
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredProducts.length) % filteredProducts.length;
    setSelectedProduct(filteredProducts[prevIndex]);
    setSelectedSize('M'); // reset size khi đổi sản phẩm
  };

  // Các số liệu tính toán giỏ hàng
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );

  // Bộ lọc danh mục sản phẩm kết hợp tìm kiếm (Viết hoa để so khớp)
  const filteredProducts = products.filter(p => {
    // 1. Lọc theo danh mục
    let matchCat = activeCategory === 'ALL';
    if (activeCategory === 'WISHLIST') {
      matchCat = favorites.includes(p.id);
    } else if (activeCategory !== 'ALL') {
      matchCat = p.category.toLowerCase() === activeCategory.toLowerCase();
    }

    // 2. Lọc theo từ khóa tìm kiếm (Tên hoặc danh mục sản phẩm)
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSearch;
  });

  // Logic phân trang
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  if (view === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onClose={() => {
          setView('store');
          fetchProducts();
          fetchCategories();
        }}
      />
    );
  }

  return (
    <div className="App">
      {/* HEADER / NAVIGATION */}
      <Header
        categories={categories}
        onOpenAdmin={() => setView('admin')}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        cartItemCount={cartItemCount}
        setIsCartOpen={setIsCartOpen}
        isScrolled={isScrolled}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        favoriteCount={favorites.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* HERO BANNER OR CATEGORY BANNER SECTION */}
      {activeCategory === 'ALL' ? (
        <Hero />
      ) : (
        (() => {
          const currentCategoryObj = categories.find(c => c.name.toLowerCase() === activeCategory.toLowerCase());
          if (activeCategory === 'WISHLIST') {
            return (
              <div className="category-banner-section" style={{
                padding: '160px 0 80px 0',
                background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                textAlign: 'center',
                borderBottom: '1px solid rgba(189, 163, 128, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(189, 163, 128, 0.03) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ 
                    color: '#bda380', 
                    fontSize: '0.9rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '3px', 
                    display: 'block',
                    marginBottom: '10px'
                  }}>
                    Yêu Thích
                  </span>
                  <h1 style={{ 
                    fontSize: '3rem', 
                    color: '#ffffff', 
                    fontFamily: 'var(--font-serif, serif)', 
                    fontWeight: '300',
                    margin: '0 0 15px 0',
                    letterSpacing: '1px'
                  }}>
                    Danh Sách Ưa Thích
                  </h1>
                  <p style={{ 
                    color: '#999999', 
                    maxWidth: '600px', 
                    margin: '0 auto', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    fontWeight: '300'
                  }}>
                    Nơi lưu trữ những thiết kế cao cấp và phụ kiện sang trọng bạn đã đặc biệt quan tâm.
                  </p>
                </div>
              </div>
            );
          } else if (currentCategoryObj) {
            return (
              <div className="category-banner-section" style={{
                padding: '160px 0 80px 0',
                background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
                textAlign: 'center',
                borderBottom: '1px solid rgba(189, 163, 128, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(189, 163, 128, 0.03) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ 
                    color: '#bda380', 
                    fontSize: '0.9rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '3px', 
                    display: 'block',
                    marginBottom: '10px'
                  }}>
                    Bộ Sưu Tập
                  </span>
                  <h1 style={{ 
                    fontSize: '3rem', 
                    color: '#ffffff', 
                    fontFamily: 'var(--font-serif, serif)', 
                    fontWeight: '300',
                    margin: '0 0 15px 0',
                    letterSpacing: '1px'
                  }}>
                    {currentCategoryObj.name}
                  </h1>
                  <p style={{ 
                    color: '#999999', 
                    maxWidth: '600px', 
                    margin: '0 auto', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    fontWeight: '300'
                  }}>
                    {currentCategoryObj.description || `Những thiết kế độc bản thuộc dòng sản phẩm ${currentCategoryObj.name} của The K Luxury.`}
                  </p>
                </div>
              </div>
            );
          }
          return <Hero />;
        })()
      )}

      {/* SHOP SECTION */}
      <section className="shop-section" id="shop-grid">
        <div className="container">
          {activeCategory === 'ALL' && (
            <div className="section-header">
              <h2 className="section-title">
                Bộ Sưu Tập Độc Bản
              </h2>
              <p className="section-subtitle">
                Thiết kế hoàn mỹ, may đo tinh xảo cho tủ đồ cao cấp của bạn
              </p>
            </div>
          )}

          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveCategory('ALL')}
            >
              Tất Cả
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                className={`filter-tab ${activeCategory.toLowerCase() === c.name.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="shop-filters-info">
            <div className="results-count">
              Hiển thị {filteredProducts.length} sản phẩm
            </div>
            <div className="sustainability-badge">
              <Info size={12} className="inline-icon" style={{ marginRight: '6px' }} />
              Chất liệu bền vững 100% tự nhiên
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-products-state">
              <p>Hiện không có sản phẩm nào thuộc danh mục này.</p>
            </div>
          ) : (
            <>
              <div className="products-grid">
                <AnimatePresence mode="popLayout">
                  {currentItems.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenDetails={openProductDetails}
                      onAddToCart={addToCart}
                      isFavorite={favorites.includes(product.id)}
                      onToggleFavorite={toggleFavorite}
                      onSelectCategory={setActiveCategory}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* THANH PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        const grid = document.getElementById('shop-grid');
                        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <Footer 
        categories={categories}
        setActiveCategory={setActiveCategory}
      />

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isCartOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            cartItemCount={cartItemCount}
            cartSubtotal={cartSubtotal}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
          />
        )}
      </AnimatePresence>

      {/* PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(prod, size) => {
              addToCart(prod, size);
              setSelectedProduct(null);
            }}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            onNext={handleNextProduct}
            onPrev={handlePrevProduct}
            onSelectCategory={setActiveCategory}
          />
        )}
      </AnimatePresence>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
