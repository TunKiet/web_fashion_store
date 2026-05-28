import { useState, useEffect, useRef } from 'react';
import {
  getItems, createItem, updateItem, deleteItem, uploadImage,
  getDeletedItems, restoreItem, forceDeleteItem,
  getCategories, createCategory, updateCategory, deleteCategory,
  getDeletedCategories, restoreCategory, forceDeleteCategory
} from '../services/api';
import {
  LayoutDashboard, ShoppingBag, Tag, ArrowLeft,
  Plus, Search, Edit2, Trash2, X, AlertCircle, Sparkles, RotateCcw, Trash
} from 'lucide-react';
import './AdminDashboard.css';

function AdminDashboard({ onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesTab, setCategoriesTab] = useState('list'); // 'list' or 'trash'
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [productsTab, setProductsTab] = useState('list'); // 'list' or 'trash'
  const [deletedProducts, setDeletedProducts] = useState([]);
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
      const [prodRes, catRes, delCatRes, delProdRes] = await Promise.all([
        getItems(),
        getCategories(),
        getDeletedCategories(),
        getDeletedItems()
      ]);
      const mappedProducts = (prodRes.data || []).map(p => {
        if (p.image_url && p.image_url.startsWith('/media/')) {
          return { ...p, image_url: `http://localhost:8000${p.image_url}` };
        }
        return p;
      });
      const mappedDeletedProducts = (delProdRes.data || []).map(p => {
        if (p.image_url && p.image_url.startsWith('/media/')) {
          return { ...p, image_url: `http://localhost:8000${p.image_url}` };
        }
        return p;
      });
      setProducts(mappedProducts);
      setCategories(catRes.data || []);
      setDeletedCategories(delCatRes.data || []);
      setDeletedProducts(mappedDeletedProducts);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải dữ liệu từ server. Vui lòng kiểm tra Docker.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedCategories = async () => {
    try {
      const res = await getDeletedCategories();
      setDeletedCategories(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách danh mục đã xóa.');
    }
  };

  const fetchDeletedProducts = async () => {
    try {
      const res = await getDeletedItems();
      const mappedDeletedProducts = (res.data || []).map(p => {
        if (p.image_url && p.image_url.startsWith('/media/')) {
          return { ...p, image_url: `http://localhost:8000${p.image_url}` };
        }
        return p;
      });
      setDeletedProducts(mappedDeletedProducts);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách sản phẩm đã xóa.');
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
      .replace(/[\u0300-\u036f]/g, '')
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

    const dataToSend = { ...productForm };
    if (dataToSend.image_url && dataToSend.image_url.startsWith('http://localhost:8000/media/')) {
      dataToSend.image_url = dataToSend.image_url.replace('http://localhost:8000', '');
    }

    try {
      if (editingProduct) {
        // Update
        const res = await updateItem(editingProduct.id, dataToSend);
        let updatedProd = res.data;
        if (updatedProd.image_url && updatedProd.image_url.startsWith('/media/')) {
          updatedProd.image_url = `http://localhost:8000${updatedProd.image_url}`;
        }
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProd : p));
        showSuccessMessage(`Cập nhật sản phẩm "${productForm.title}" thành công!`);
      } else {
        // Create
        const res = await createItem(dataToSend);
        let newProd = res.data;
        if (newProd.image_url && newProd.image_url.startsWith('/media/')) {
          newProd.image_url = `http://localhost:8000${newProd.image_url}`;
        }
        setProducts(prev => [newProd, ...prev]);
        showSuccessMessage(`Thêm sản phẩm "${productForm.title}" thành công!`);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể lưu sản phẩm. Vui lòng kiểm tra dữ liệu đầu vào.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    setError('');
    try {
      const response = await uploadImage(formData);
      setProductForm(prev => ({
        ...prev,
        image_url: `http://localhost:8000${response.data.image_url}`
      }));
      showSuccessMessage('Tải ảnh lên thành công!');
    } catch (err) {
      console.error(err);
      showErrorMessage(err.response?.data?.error || 'Lỗi khi tải ảnh lên. Hãy thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${title}" không?`)) return;
    try {
      await deleteItem(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showSuccessMessage(`Đã chuyển sản phẩm "${title}" vào thùng rác.`);
      // Reload deleted products list
      const delProdRes = await getDeletedItems();
      const mappedDeletedProducts = (delProdRes.data || []).map(p => {
        if (p.image_url && p.image_url.startsWith('/media/')) {
          return { ...p, image_url: `http://localhost:8000${p.image_url}` };
        }
        return p;
      });
      setDeletedProducts(mappedDeletedProducts);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể xóa sản phẩm này.');
    }
  };

  const handleProductRestore = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn khôi phục sản phẩm "${title}" không?`)) return;
    try {
      setLoading(true);
      await restoreItem(id);
      showSuccessMessage(`Khôi phục sản phẩm "${title}" thành công!`);
      // Reload both lists
      const [prodRes, delProdRes] = await Promise.all([
        getItems(),
        getDeletedItems()
      ]);
      const mappedProducts = (prodRes.data || []).map(p => {
        if (p.image_url && p.image_url.startsWith('/media/')) {
          return { ...p, image_url: `http://localhost:8000${p.image_url}` };
        }
        return p;
      });
      const mappedDeletedProducts = (delProdRes.data || []).map(p => {
        if (p.image_url && p.image_url.startsWith('/media/')) {
          return { ...p, image_url: `http://localhost:8000${p.image_url}` };
        }
        return p;
      });
      setProducts(mappedProducts);
      setDeletedProducts(mappedDeletedProducts);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể khôi phục sản phẩm này.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductForceDelete = async (id, title) => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN sản phẩm "${title}"? Thao tác này không thể hoàn tác!`)) return;
    try {
      setLoading(true);
      await forceDeleteItem(id);
      showSuccessMessage(`Đã xóa vĩnh viễn sản phẩm "${title}".`);
      // Reload the deleted list
      const delProdRes = await getDeletedItems();
      const mappedDeletedProducts = (delProdRes.data || []).map(p => {
        if (p.image_url && p.image_url.startsWith('/media/')) {
          return { ...p, image_url: `http://localhost:8000${p.image_url}` };
        }
        return p;
      });
      setDeletedProducts(mappedDeletedProducts);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể xóa vĩnh viễn sản phẩm này.');
    } finally {
      setLoading(false);
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
      showSuccessMessage(`Đã chuyển danh mục "${name}" vào thùng rác.`);
      // Reload deleted categories list
      const delCatRes = await getDeletedCategories();
      setDeletedCategories(delCatRes.data || []);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể xóa danh mục này.');
    }
  };

  const handleCategoryRestore = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn khôi phục danh mục "${name}" không?`)) return;
    try {
      setLoading(true);
      await restoreCategory(id);
      showSuccessMessage(`Khôi phục danh mục "${name}" thành công!`);
      // Reload both lists
      const [catRes, delCatRes] = await Promise.all([
        getCategories(),
        getDeletedCategories()
      ]);
      setCategories(catRes.data || []);
      setDeletedCategories(delCatRes.data || []);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể khôi phục danh mục này.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryForceDelete = async (id, name) => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN danh mục "${name}"? Thao tác này không thể hoàn tác!`)) return;
    try {
      setLoading(true);
      await forceDeleteCategory(id);
      showSuccessMessage(`Đã xóa vĩnh viễn danh mục "${name}".`);
      // Reload the deleted list
      const delCatRes = await getDeletedCategories();
      setDeletedCategories(delCatRes.data || []);
    } catch (err) {
      console.error(err);
      showErrorMessage('Không thể xóa vĩnh viễn danh mục này.');
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredDeletedProducts = deletedProducts.filter(p =>
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
                {/* Horizontal row for Sub-tabs & Add button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(189, 163, 128, 0.2)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      type="button"
                      onClick={() => setProductsTab('list')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: productsTab === 'list' ? '#bda380' : '#888',
                        borderBottom: productsTab === 'list' ? '2px solid #bda380' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <ShoppingBag size={16} />
                      Sản phẩm hoạt động ({products.length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setProductsTab('trash')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: productsTab === 'trash' ? '#e06666' : '#888',
                        borderBottom: productsTab === 'trash' ? '2px solid #e06666' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Trash size={16} />
                      Thùng rác ({deletedProducts.length})
                    </button>
                  </div>
                  
                  {productsTab === 'list' && (
                    <button className="admin-btn admin-btn-primary" onClick={handleOpenProductAdd}>
                      <Plus size={16} />
                      <span>Thêm Sản phẩm</span>
                    </button>
                  )}
                </div>

                {/* Search control row */}
                <div className="table-controls" style={{ marginBottom: '15px' }}>
                  <div className="search-box-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                </div>

                {productsTab === 'list' ? (
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
                ) : (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Hình ảnh</th>
                          <th>Tên sản phẩm</th>
                          <th>Giá tiền (VNĐ)</th>
                          <th>Danh mục</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeletedProducts.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="empty-table-cell">Thùng rác trống.</td>
                          </tr>
                        ) : (
                          filteredDeletedProducts.map(p => (
                            <tr key={p.id}>
                              <td>
                                <img
                                  src={p.image_url || "/images/fashion_dress.png"}
                                  alt={p.title}
                                  className="table-thumbnail"
                                  style={{ filter: 'grayscale(100%)', opacity: '0.6' }}
                                  onError={(e) => { e.target.src = "/images/fashion_dress.png"; }}
                                />
                              </td>
                              <td className="table-bold-text" style={{ color: '#888', textDecoration: 'line-through' }}>{p.title}</td>
                              <td style={{ color: '#888' }}>{parseFloat(p.price).toLocaleString('vi-VN')} đ</td>
                              <td><span className="category-badge" style={{ opacity: 0.6 }}>{p.category}</span></td>
                              <td>
                                <div className="table-actions">
                                  <button 
                                    type="button"
                                    className="table-action-btn edit" 
                                    onClick={() => handleProductRestore(p.id, p.title)}
                                    title="Khôi phục"
                                    style={{ color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.4)' }}
                                  >
                                    <RotateCcw size={14} />
                                  </button>
                                  <button 
                                    type="button"
                                    className="table-action-btn delete" 
                                    onClick={() => handleProductForceDelete(p.id, p.title)}
                                    title="Xóa vĩnh viễn"
                                    style={{ color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.4)' }}
                                  >
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
                )}
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="admin-table-section">
                {/* Sub tabs */}
                {/* Horizontal row for Sub-tabs & Add button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(189, 163, 128, 0.2)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      type="button"
                      onClick={() => setCategoriesTab('list')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: categoriesTab === 'list' ? '#bda380' : '#888',
                        borderBottom: categoriesTab === 'list' ? '2px solid #bda380' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Tag size={16} />
                      Danh mục hoạt động ({categories.length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCategoriesTab('trash')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: categoriesTab === 'trash' ? '#e06666' : '#888',
                        borderBottom: categoriesTab === 'trash' ? '2px solid #e06666' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Trash size={16} />
                      Thùng rác ({deletedCategories.length})
                    </button>
                  </div>
                  
                  {categoriesTab === 'list' && (
                    <button className="admin-btn admin-btn-primary" onClick={handleOpenCategoryAdd}>
                      <Plus size={16} />
                      <span>Thêm Danh mục</span>
                    </button>
                  )}
                </div>

                {categoriesTab === 'list' ? (
                  <>

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
                  </>
                ) : (
                  <>
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
                          {deletedCategories.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="empty-table-cell">Thùng rác trống.</td>
                            </tr>
                          ) : (
                            deletedCategories.map(c => (
                              <tr key={c.id}>
                                <td className="table-bold-text" style={{ color: '#888', textDecoration: 'line-through' }}>{c.name}</td>
                                <td className="table-code-text" style={{ color: '#888' }}>{c.slug}</td>
                                <td className="table-desc-text" style={{ color: '#888' }}>{c.description || 'Không có mô tả'}</td>
                                <td>
                                  <div className="table-actions">
                                    <button 
                                      type="button"
                                      className="table-action-btn edit" 
                                      onClick={() => handleCategoryRestore(c.id, c.name)}
                                      title="Khôi phục"
                                      style={{ color: '#2ecc71', borderColor: 'rgba(46, 204, 113, 0.4)' }}
                                    >
                                      <RotateCcw size={14} />
                                    </button>
                                    <button 
                                      type="button"
                                      className="table-action-btn delete" 
                                      onClick={() => handleCategoryForceDelete(c.id, c.name)}
                                      title="Xóa vĩnh viễn"
                                      style={{ color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.4)' }}
                                    >
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
                  </>
                )}
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
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
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
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Ví dụ: 31500000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="Ví dụ: /images/fashion_dress.png hoặc chọn từ PC"
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload}
                  />
                  <button 
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{ 
                      whiteSpace: 'nowrap',
                      cursor: 'pointer', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(189, 163, 128, 0.4)',
                      background: 'rgba(189, 163, 128, 0.05)',
                      color: '#bda380',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(189, 163, 128, 0.15)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(189, 163, 128, 0.05)'; }}
                  >
                    <Plus size={14} />
                    Chọn ảnh
                  </button>
                </div>
                {productForm.image_url && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '4px' }}>Xem trước ảnh:</label>
                    <img 
                      src={productForm.image_url} 
                      alt="Xem trước" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '6px', 
                        border: '1px solid rgba(189, 163, 128, 0.4)' 
                      }}
                      onError={(e) => { e.target.src = "/images/fashion_dress.png"; }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Nhập mô tả chất liệu, thiết kế..."
                  rows="4"
                />
              </div>

              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
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
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="Ví dụ: dam-da-hoi"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả danh mục</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
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
