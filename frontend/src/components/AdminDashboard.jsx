import { useState, useEffect } from 'react';
import { 
  getItems, createItem, updateItem, deleteItem,
  getCategories, createCategory, updateCategory, deleteCategory 
} from '../services/api';
import { 
  LayoutDashboard, ShoppingBag, Tag, ArrowLeft, 
  Plus, Search, Edit2, Trash2, X, AlertCircle, Sparkles
} from 'lucide-react';
import './AdminDashboard.css';

function AdminDashboard({ onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search filter
  const [productSearch, setProductSearch] = useState('');

  // Modals visibility
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Edit states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Product Form fields
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    is_featured: false
  });

  // Category Form fields
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, catRes] = await Promise.all([
        getItems(),
        getCategories()
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu từ server. Vui lòng kiểm tra Docker.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showErrorMessage = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  // Auto generate slug from category name
  const handleCategoryNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove tone marks
      .replace(/[đĐ]/g, 'd')
      .replace(/([^a-z0-9\s-]|_)+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    setCategoryForm(prev => ({
      ...prev,
      name,
      slug
    }));
  };

  // --- PRODUCT CRUD ---

  const handleOpenProductAdd = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      price: '',
      image_url: '',
      category: categories.length > 0 ? categories[0].name : 'Uncategorized',
      is_featured: false
    });
    setIsProductModalOpen(true);
  };

  const handleOpenProductEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      is_featured: product.is_featured
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!productForm.title || !productForm.price) {
      showErrorMessage('Vui lòng điền đầy đủ tiêu đề và giá sản phẩm.');
      return;
    }

    try {
      if (editingProduct) {
        // Update
        const res = await updateItem(editingProduct.id, productForm);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.data : p));
        showSuccessMessage(`Cập nhật sản phẩm "${productForm.title}" thành công!`);
      } else {
        // Create
        const res = await createItem(productForm);
        setProducts(prev => [res.data, ...prev]);
        showSuccessMessage(`Thêm sản phẩm "${productForm.title}" thành công!`);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể lưu sản phẩm. Vui lòng kiểm tra dữ liệu đầu vào.');
    }
  };

  const handleProductDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${title}" không?`)) return;
    try {
      await deleteItem(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showSuccessMessage(`Đã xóa sản phẩm "${title}"`);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể xóa sản phẩm này.');
    }
  };

  // --- CATEGORY CRUD ---

  const handleOpenCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryForm.name || !categoryForm.slug) {
      showErrorMessage('Vui lòng điền đầy đủ tên và slug danh mục.');
      return;
    }

    try {
      if (editingCategory) {
        // Update
        const res = await updateCategory(editingCategory.id, categoryForm);
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? res.data : c));
        showSuccessMessage(`Cập nhật danh mục "${categoryForm.name}" thành công!`);
      } else {
        // Create
        const res = await createCategory(categoryForm);
        setCategories(prev => [res.data, ...prev]);
        showSuccessMessage(`Thêm danh mục "${categoryForm.name}" thành công!`);
      }
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể lưu danh mục. Vui lòng đảm bảo slug là duy nhất.');
    }
  };

  const handleCategoryDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showSuccessMessage(`Đã xóa danh mục "${name}"`);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể xóa danh mục này.');
    }
  };

  // Filtering
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo-section">
          <div className="admin-logo-circle">
            <Sparkles size={20} color="#d1a852" />
          </div>
          <div>
            <h1 className="admin-brand-title">The K Luxury</h1>
            <p className="admin-brand-subtitle">Admin Workspace</p>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </button>
          
          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} />
            <span>Quản lý Sản phẩm</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Tag size={18} />
            <span>Quản lý Danh mục</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <p className="admin-username">{currentUser?.name || 'Administrator'}</p>
            <p className="admin-useremail">{currentUser?.email || 'admin@thekluxury.com'}</p>
          </div>
          <button className="admin-back-btn" onClick={onClose}>
            <ArrowLeft size={16} />
            <span>Quay lại Shop</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-content">
        <header className="admin-top-header">
          <div>
            <h2 className="admin-page-title">
              {activeTab === 'overview' && 'Bảng Tổng quan'}
              {activeTab === 'products' && 'Quản lý danh sách sản phẩm'}
              {activeTab === 'categories' && 'Quản lý danh mục sản phẩm'}
            </h2>
            <p className="admin-page-subtitle">Hệ thống quản trị bán hàng thời trang cao cấp</p>
          </div>
          <div className="admin-system-status">
            <span className="status-dot online"></span>
            <span>Hệ thống Docker online</span>
          </div>
        </header>

        {/* NOTIFICATIONS */}
        {error && (
          <div className="admin-alert admin-alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="admin-alert admin-alert-success">
            <span className="status-dot online"></span>
            <span>{success}</span>
          </div>
        )}

        {/* TAB CONTENTS */}
        {loading ? (
          <div className="admin-loader-container">
            <div className="admin-spinner"></div>
            <p>Đang đồng bộ dữ liệu với PostgreSQL...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="admin-overview-grid">
                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper">
                    <ShoppingBag size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{products.length}</h3>
                    <p className="stat-label">Tổng sản phẩm</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper">
                    <Tag size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{categories.length}</h3>
                    <p className="stat-label">Tổng danh mục</p>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper">
                    <Sparkles size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{products.filter(p => p.is_featured).length}</h3>
                    <p className="stat-label">Sản phẩm nổi bật</p>
                  </div>
                </div>

                <div className="admin-shortcut-card" onClick={() => setActiveTab('products')}>
                  <h4>Thêm sản phẩm mới</h4>
                  <p>Cập nhật thiết kế thời trang độc quyền lên cửa hàng</p>
                  <span className="shortcut-action">Đi tới quản lý &rarr;</span>
                </div>

                <div className="admin-shortcut-card" onClick={() => setActiveTab('categories')}>
                  <h4>Quản lý bộ sưu tập</h4>
                  <p>Tạo các danh mục, bộ sưu tập váy đầm, áo măng tô mới</p>
                  <span className="shortcut-action">Đi tới quản lý &rarr;</span>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="admin-table-section">
                <div className="table-controls">
                  <div className="search-box-wrapper">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm sản phẩm..." 
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  <button className="admin-btn admin-btn-primary" onClick={handleOpenProductAdd}>
                    <Plus size={16} />
                    <span>Thêm Sản phẩm</span>
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá tiền (VNĐ)</th>
                        <th>Danh mục</th>
                        <th>Nổi bật</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-table-cell">Không tìm thấy sản phẩm nào.</td>
                        </tr>
                      ) : (
                        filteredProducts.map(p => (
                          <tr key={p.id}>
                            <td>
                              <img 
                                src={p.image_url || "/images/fashion_dress.png"} 
                                alt={p.title} 
                                className="table-thumbnail"
                                onError={(e) => { e.target.src = "/images/fashion_dress.png"; }}
                              />
                            </td>
                            <td className="table-bold-text">{p.title}</td>
                            <td>{parseFloat(p.price).toLocaleString('vi-VN')} đ</td>
                            <td><span className="category-badge">{p.category}</span></td>
                            <td>
                              {p.is_featured ? (
                                <span className="featured-badge true">Yes</span>
                              ) : (
                                <span className="featured-badge false">No</span>
                              )}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="table-action-btn edit" onClick={() => handleOpenProductEdit(p)}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="table-action-btn delete" onClick={() => handleProductDelete(p.id, p.title)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="admin-table-section">
                <div className="table-controls align-right">
                  <button className="admin-btn admin-btn-primary" onClick={handleOpenCategoryAdd}>
                    <Plus size={16} />
                    <span>Thêm Danh mục</span>
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên danh mục</th>
                        <th>Slug</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-table-cell">Không có danh mục nào.</td>
                        </tr>
                      ) : (
                        categories.map(c => (
                          <tr key={c.id}>
                            <td className="table-bold-text">{c.name}</td>
                            <td className="table-code-text">{c.slug}</td>
                            <td className="table-desc-text">{c.description || 'Không có mô tả'}</td>
                            <td>
                              <div className="table-actions">
                                <button className="table-action-btn edit" onClick={() => handleOpenCategoryEdit(c)}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="table-action-btn delete" onClick={() => handleCategoryDelete(c.id, c.name)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
              <button className="modal-close-btn" onClick={() => setIsProductModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="modal-form">
              <div className="form-group">
                <label>Tiêu đề sản phẩm *</label>
                <input 
                  type="text" 
                  value={productForm.title}
                  onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                  placeholder="Ví dụ: Đầm Dạ Hội Lụa Draping"
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Giá tiền (VNĐ) *</label>
                  <input 
                    type="number" 
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    placeholder="Ví dụ: 31500000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  >
                    {categories.length > 0 ? (
                      categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))
                    ) : (
                      <option value="Uncategorized">Uncategorized</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Đường dẫn hình ảnh (URL)</label>
                <input 
                  type="text" 
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                  placeholder="Ví dụ: /images/fashion_dress.png"
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  placeholder="Nhập mô tả chất liệu, thiết kế..."
                  rows="4"
                />
              </div>

              <div className="form-checkbox-group">
                <input 
                  type="checkbox" 
                  id="is_featured"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm({...productForm, is_featured: e.target.checked})}
                />
                <label htmlFor="is_featured">Sản phẩm nổi bật (Hiển thị nổi bật trên trang chủ)</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsProductModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{editingCategory ? 'Cập Nhật Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
              <button className="modal-close-btn" onClick={() => setIsCategoryModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="modal-form">
              <div className="form-group">
                <label>Tên danh mục *</label>
                <input 
                  type="text" 
                  value={categoryForm.name}
                  onChange={handleCategoryNameChange}
                  placeholder="Ví dụ: Đầm Dạ Hội"
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug (Đường dẫn thân thiện) *</label>
                <input 
                  type="text" 
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                  placeholder="Ví dụ: dam-da-hoi"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả danh mục</label>
                <textarea 
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  placeholder="Nhập mô tả bộ sưu tập..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
