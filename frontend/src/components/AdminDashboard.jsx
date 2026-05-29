import { useState, useEffect, useRef } from 'react';
import {
  getItems, createItem, updateItem, deleteItem, uploadImage,
  getDeletedItems, restoreItem, forceDeleteItem,
  getCategories, createCategory, updateCategory, deleteCategory,
  getDeletedCategories, restoreCategory, forceDeleteCategory,
  getUsers, createUser, updateUser, deleteUser,
  getRoles, createRole, updateRole, deleteRole, getPermissions,
  getOrders, updateOrderStatus, deleteOrder
} from '../services/api';
import {
  LayoutDashboard, ShoppingBag, Tag, ArrowLeft,
  Plus, Search, Edit2, Trash2, X, AlertCircle, Sparkles, RotateCcw, Trash,
  Users, Shield, Key, Package, ClipboardList, CreditCard, Clock, Eye, FileSpreadsheet
} from 'lucide-react';
import './AdminDashboard.css';
import * as XLSX from 'xlsx';

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
    is_featured: false,
    stock: 10
  });

  // Inventory Management states
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState(0);

  // Category Form fields
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    parent: ''
  });

  // User Management states
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    first_name: '',
    email: '',
    password: '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    groups: [] // list of Group IDs assigned
  });

  // Role and Permission states
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    permissions: [] // array of permission IDs
  });

  // Order Management states
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [exportYear, setExportYear] = useState(String(new Date().getFullYear()));

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prodRes, catRes, delCatRes, delProdRes, userRes, roleRes, permRes, orderRes] = await Promise.all([
        getItems(),
        getCategories(),
        getDeletedCategories(),
        getDeletedItems(),
        getUsers().catch(err => {
          console.error("Lỗi tải danh sách người dùng:", err);
          return { data: [] };
        }),
        getRoles().catch(err => {
          console.error("Lỗi tải danh sách vai trò:", err);
          return { data: [] };
        }),
        getPermissions().catch(err => {
          console.error("Lỗi tải danh sách quyền hạn:", err);
          return { data: [] };
        }),
        getOrders().catch(err => {
          console.error("Lỗi tải danh sách đơn hàng:", err);
          return { data: [] };
        })
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
      setUsers(userRes.data || []);
      setRoles(roleRes.data || []);
      setPermissions(permRes.data || []);
      setOrders(orderRes.data || []);
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
      is_featured: false,
      stock: 10
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
      is_featured: product.is_featured,
      stock: product.stock !== undefined ? product.stock : 10
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

  // --- INVENTORY STOCK MANAGEMENT ---
  const handleStartEditStock = (id, currentStock) => {
    setEditingStockId(id);
    setTempStockValue(currentStock);
  };

  const handleSaveStock = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;
      const dataToSend = { ...product, stock: tempStockValue };
      if (dataToSend.image_url && dataToSend.image_url.startsWith('http://localhost:8000/media/')) {
        dataToSend.image_url = dataToSend.image_url.replace('http://localhost:8000', '');
      }
      const res = await updateItem(id, dataToSend);
      let updatedProd = res.data;
      if (updatedProd.image_url && updatedProd.image_url.startsWith('/media/')) {
        updatedProd.image_url = `http://localhost:8000${updatedProd.image_url}`;
      }
      setProducts(prev => prev.map(p => p.id === id ? updatedProd : p));
      setEditingStockId(null);
      showSuccessMessage(`Cập nhật tồn kho cho sản phẩm "${product.title}" thành công!`);
    } catch (err) {
      console.error(err);
      showErrorMessage('Lỗi khi cập nhật số lượng tồn kho.');
    }
  };

  // --- CATEGORY CRUD ---

  const handleOpenCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      parent: ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryEdit = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent || ''
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

    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug,
      description: categoryForm.description,
      parent: categoryForm.parent ? parseInt(categoryForm.parent) : null
    };

    try {
      if (editingCategory) {
        // Update
        const res = await updateCategory(editingCategory.id, payload);
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? res.data : c));
        showSuccessMessage(`Cập nhật danh mục "${categoryForm.name}" thành công!`);
      } else {
        // Create
        const res = await createCategory(payload);
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

  // --- USER CRUD ---

  const handleOpenUserAdd = () => {
    setEditingUser(null);
    setUserForm({
      first_name: '',
      email: '',
      password: '',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      groups: []
    });
    setIsUserModalOpen(true);
  };

  const handleOpenUserEdit = (user) => {
    setEditingUser(user);
    setUserForm({
      first_name: user.first_name || '',
      email: user.email,
      password: '',
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      groups: user.groups || []
    });
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userForm.email) {
      showErrorMessage('Vui lòng điền đầy đủ Email.');
      return;
    }

    if (!editingUser && !userForm.password) {
      showErrorMessage('Vui lòng nhập mật khẩu cho tài khoản mới.');
      return;
    }

    const payload = {
      first_name: userForm.first_name,
      email: userForm.email,
      is_active: userForm.is_active,
      is_staff: userForm.is_staff,
      is_superuser: userForm.is_superuser,
      groups: userForm.groups || []
    };

    if (userForm.password) {
      payload.password = userForm.password;
    }

    try {
      if (editingUser) {
        if (editingUser.email === currentUser?.email) {
          if (!userForm.is_active) {
            showErrorMessage('Bạn không thể tự khóa tài khoản của chính mình.');
            return;
          }
          if (editingUser.is_superuser && !userForm.is_superuser) {
            showErrorMessage('Bạn không thể tự hạ quyền Super Admin của chính mình.');
            return;
          }
          if (editingUser.is_staff && !userForm.is_staff) {
            showErrorMessage('Bạn không thể tự hạ quyền Admin của chính mình.');
            return;
          }
        }

        const res = await updateUser(editingUser.id, payload);
        setUsers(prev => prev.map(u => u.id === editingUser.id ? res.data : u));
        showSuccessMessage(`Cập nhật tài khoản "${userForm.email}" thành công!`);
      } else {
        const res = await createUser(payload);
        setUsers(prev => [res.data, ...prev]);
        showSuccessMessage(`Tạo tài khoản "${userForm.email}" thành công!`);
      }
      setIsUserModalOpen(false);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.email?.[0] || err.response?.data?.username?.[0] || 'Lỗi khi lưu tài khoản. Đảm bảo Email này chưa tồn tại.';
      showErrorMessage(errMsg);
    }
  };

  const handleUserDelete = async (id, email) => {
    if (email === currentUser?.email) {
      showErrorMessage('Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${email}" không?`)) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showSuccessMessage(`Đã xóa tài khoản "${email}" thành công.`);
    } catch (err) {
      console.error(err);
      showErrorMessage(err.response?.data?.error || 'Không thể xóa tài khoản này.');
    }
  };

  // --- ROLE CRUD ---

  const handleOpenRoleAdd = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      permissions: []
    });
    setIsRoleModalOpen(true);
  };

  const handleOpenRoleEdit = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      permissions: role.permissions || []
    });
    setIsRoleModalOpen(true);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roleForm.name) {
      showErrorMessage('Vui lòng nhập tên vai trò.');
      return;
    }

    try {
      if (editingRole) {
        const res = await updateRole(editingRole.id, roleForm);
        setRoles(prev => prev.map(r => r.id === editingRole.id ? res.data : r));
        showSuccessMessage(`Cập nhật vai trò "${roleForm.name}" thành công!`);
      } else {
        const res = await createRole(roleForm);
        setRoles(prev => [...prev, res.data]);
        showSuccessMessage(`Tạo vai trò "${roleForm.name}" thành công!`);
      }
      setIsRoleModalOpen(false);
      const userRes = await getUsers();
      setUsers(userRes.data || []);
    } catch (err) {
      console.error(err);
      showErrorMessage(err.response?.data?.error || err.response?.data?.name?.[0] || 'Lỗi khi lưu vai trò.');
    }
  };

  const handleRoleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${name}"?`)) return;
    try {
      await deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
      showSuccessMessage(`Đã xóa vai trò "${name}" thành công.`);
      const userRes = await getUsers();
      setUsers(userRes.data || []);
    } catch (err) {
      console.error(err);
      showErrorMessage(err.response?.data?.error || 'Không thể xóa vai trò này.');
    }
  };

  // --- ORDER CRUD ---
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      showSuccessMessage(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(res.data);
      }
    } catch (err) {
      console.error(err);
      showErrorMessage(err.response?.data?.error || "Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  const handleOrderDelete = async (orderId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId}? Thao tác này không thể hoàn tác!`)) return;
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      showSuccessMessage(`Đã xóa đơn hàng #${orderId} thành công.`);
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setIsOrderModalOpen(false);
        setSelectedOrderDetails(null);
      }
    } catch (err) {
      console.error(err);
      showErrorMessage(err.response?.data?.error || "Không thể xóa đơn hàng này.");
    }
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrderDetails(order);
    setIsOrderModalOpen(true);
  };

  const handleExportRevenueToExcel = (month, year) => {
    const selectedMonth = parseInt(month, 10);
    const selectedYear = parseInt(year, 10);

    // Filter orders matching the selected month and year
    const filtered = orders.filter(o => {
      const orderDate = new Date(o.created_at);
      return (orderDate.getMonth() + 1) === selectedMonth && orderDate.getFullYear() === selectedYear;
    });

    if (filtered.length === 0) {
      showErrorMessage(`Không tìm thấy đơn hàng nào trong Tháng ${month}/${year} để xuất báo cáo.`);
      return;
    }

    // Format data with Vietnamese column headers
    const rows = filtered.map(o => {
      let statusLabel = "Chờ xử lý";
      if (o.status === "PROCESSING") statusLabel = "Đang xử lý";
      else if (o.status === "SHIPPING") statusLabel = "Đang giao";
      else if (o.status === "COMPLETED") statusLabel = "Đã hoàn thành";
      else if (o.status === "CANCELLED") statusLabel = "Đã hủy";

      return {
        "Mã Đơn Hàng": `#TK-ORDER-${o.id}`,
        "Khách Hàng": o.name,
        "Số Điện Thoại": o.phone,
        "Ngày Đặt": new Date(o.created_at).toLocaleString('vi-VN'),
        "Phương Thức": o.payment_method.toUpperCase(),
        "Tổng Tiền (VNĐ)": parseFloat(o.total_price),
        "Trạng Thái": statusLabel
      };
    });

    // Calculate total revenue (excluding cancelled orders)
    const totalRevenue = filtered
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

    // Add empty row for spacing
    rows.push({
      "Mã Đơn Hàng": "",
      "Khách Hàng": "",
      "Số Điện Thoại": "",
      "Ngày Đặt": "",
      "Phương Thức": "",
      "Tổng Tiền (VNĐ)": "",
      "Trạng Thái": ""
    });

    // Add summary row at the end
    rows.push({
      "Mã Đơn Hàng": "TỔNG CỘNG DOANH THU",
      "Khách Hàng": "(Không tính các đơn hàng đã hủy)",
      "Số Điện Thoại": "",
      "Ngày Đặt": "",
      "Phương Thức": "",
      "Tổng Tiền (VNĐ)": totalRevenue,
      "Trạng Thái": ""
    });

    try {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Doanh Thu T${month}-${year}`);

      // Set column widths for better visual layout
      const wscols = [
        { wch: 25 }, // Mã Đơn Hàng / TỔNG CỘNG DOANH THU
        { wch: 30 }, // Khách Hàng
        { wch: 15 }, // Số Điện Thoại
        { wch: 22 }, // Ngày Đặt
        { wch: 15 }, // Phương Thức
        { wch: 20 }, // Tổng Tiền (VNĐ)
        { wch: 15 }  // Trạng Thái
      ];
      worksheet['!cols'] = wscols;

      // Save file
      XLSX.writeFile(workbook, `Bao_cao_doanh_thu_thang_${month}_nam_${year}.xlsx`);
      showSuccessMessage(`Xuất báo cáo doanh thu tháng ${month}/${year} thành công!`);
    } catch (err) {
      console.error("Lỗi xuất Excel:", err);
      showErrorMessage("Có lỗi xảy ra khi xuất file Excel báo cáo doanh thu.");
    }
  };

  // Filtering
  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.first_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredDeletedProducts = deletedProducts.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      String(o.id).includes(orderSearch) ||
      o.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      (o.user_email || '').toLowerCase().includes(orderSearch.toLowerCase());
      
    const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

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

          <button
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Quản lý Tài khoản</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <Shield size={18} />
            <span>Quản lý Vai trò</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={18} />
            <span>Quản lý Kho</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={18} />
            <span>Quản lý Đơn hàng</span>
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
              {activeTab === 'users' && 'Quản lý tài khoản hội viên'}
              {activeTab === 'roles' && 'Quản lý vai trò & quyền hạn'}
              {activeTab === 'inventory' && 'Quản lý tồn kho sản phẩm'}
              {activeTab === 'orders' && 'Quản lý đơn hàng mua sắm'}
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
                <div className="admin-stat-card" onClick={() => setActiveTab('products')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon-wrapper">
                    <ShoppingBag size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{products.length}</h3>
                    <p className="stat-label">Tổng sản phẩm</p>
                  </div>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('categories')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon-wrapper">
                    <Tag size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{categories.length}</h3>
                    <p className="stat-label">Tổng danh mục</p>
                  </div>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon-wrapper">
                    <Users size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{users.length}</h3>
                    <p className="stat-label">Tổng hội viên</p>
                  </div>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon-wrapper">
                    <ClipboardList size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{orders.length}</h3>
                    <p className="stat-label">Tổng đơn hàng</p>
                  </div>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon-wrapper">
                    <CreditCard size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{totalRevenue.toLocaleString('vi-VN')} đ</h3>
                    <p className="stat-label">Doanh thu bán hàng</p>
                  </div>
                </div>

                <div className="admin-stat-card" onClick={() => setActiveTab('orders')} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon-wrapper">
                    <Clock size={24} color="#d1a852" />
                  </div>
                  <div>
                    <h3 className="stat-value">{pendingOrdersCount}</h3>
                    <p className="stat-label">Đơn chờ xử lý</p>
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

                <div className="admin-shortcut-card" onClick={() => setActiveTab('users')}>
                  <h4>Quản lý tài khoản</h4>
                  <p>Xem danh sách tài khoản, khóa hoặc mở khóa người dùng</p>
                  <span className="shortcut-action">Đi tới quản lý &rarr;</span>
                </div>

                <div className="admin-shortcut-card" onClick={() => setActiveTab('roles')}>
                  <h4>Quản lý vai trò & quyền</h4>
                  <p>Tạo nhóm vai trò mới và định nghĩa chi tiết quyền hạn CRUD</p>
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

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="admin-table-section">
                {/* Horizontal row for Tab label & Add button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(189, 163, 128, 0.2)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#bda380',
                        borderBottom: '2px solid #bda380',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Users size={16} />
                      Tất cả tài khoản ({users.length})
                    </button>
                  </div>
                  
                  <button className="admin-btn admin-btn-primary" onClick={handleOpenUserAdd}>
                    <Plus size={16} />
                    <span>Thêm tài khoản</span>
                  </button>
                </div>

                {/* Search control row */}
                <div className="table-controls" style={{ marginBottom: '15px' }}>
                  <div className="search-box-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo email, họ tên..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Họ và tên</th>
                        <th>Email / Tên đăng nhập</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Ngày tham gia</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-table-cell">Không tìm thấy tài khoản nào.</td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => {
                          const isSelf = u.email === currentUser?.email;
                          let roleBadge = <span className="featured-badge false">Khách hàng</span>;
                          if (u.is_superuser) {
                            roleBadge = <span className="featured-badge true" style={{ backgroundColor: 'rgba(209, 168, 82, 0.2)', color: '#d1a852', border: '1px solid #d1a852' }}>Super Admin</span>;
                          } else if (u.groups_details && u.groups_details.length > 0) {
                            roleBadge = (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {u.groups_details.map(g => (
                                  <span key={g.id} className="featured-badge true" style={{ backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.4)' }}>
                                    {g.name}
                                  </span>
                                ))}
                              </div>
                            );
                          } else if (u.is_staff) {
                            roleBadge = <span className="featured-badge true" style={{ backgroundColor: 'rgba(52, 152, 219, 0.2)', color: '#3498db', border: '1px solid #3498db' }}>Admin</span>;
                          }
                          
                          return (
                            <tr key={u.id}>
                              <td className="table-bold-text">
                                {u.first_name || '—'} {isSelf && <span style={{ fontSize: '0.75rem', color: '#bda380', fontStyle: 'italic' }}>(Bạn)</span>}
                              </td>
                              <td>{u.email}</td>
                              <td>{roleBadge}</td>
                              <td>
                                {u.is_active ? (
                                  <span className="featured-badge true" style={{ backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', border: '1px solid #2ecc71' }}>Hoạt động</span>
                                ) : (
                                  <span className="featured-badge false" style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid #e74c3c' }}>Bị khóa</span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                {new Date(u.date_joined).toLocaleDateString('vi-VN')}
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button className="table-action-btn edit" onClick={() => handleOpenUserEdit(u)} title="Sửa quyền/tài khoản">
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    className="table-action-btn delete" 
                                    onClick={() => handleUserDelete(u.id, u.email)} 
                                    title="Xóa tài khoản"
                                    disabled={isSelf}
                                    style={isSelf ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ROLES TAB */}
            {activeTab === 'roles' && (
              <div className="admin-table-section">
                {/* Horizontal row for Tab label & Add button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(189, 163, 128, 0.2)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#bda380',
                        borderBottom: '2px solid #bda380',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Shield size={16} />
                      Tất cả vai trò ({roles.length})
                    </button>
                  </div>
                  
                  <button className="admin-btn admin-btn-primary" onClick={handleOpenRoleAdd}>
                    <Plus size={16} />
                    <span>Thêm vai trò</span>
                  </button>
                </div>

                {/* Search control row */}
                <div className="table-controls" style={{ marginBottom: '15px' }}>
                  <div className="search-box-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm vai trò..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tên vai trò</th>
                        <th>Số lượng thành viên</th>
                        <th>Quyền hạn được cấp</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoles.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-table-cell">Không tìm thấy vai trò nào.</td>
                        </tr>
                      ) : (
                        filteredRoles.map(r => (
                          <tr key={r.id}>
                            <td className="table-bold-text">{r.name}</td>
                            <td>
                              <span className="category-badge" style={{ backgroundColor: 'rgba(189, 163, 128, 0.1)', color: '#bda380' }}>
                                {r.user_count} thành viên
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '500px' }}>
                                {r.permissions_details && r.permissions_details.length > 0 ? (
                                  r.permissions_details.map(p => (
                                    <span key={p.id} className="featured-badge true" style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', color: '#ddd', border: '1px solid rgba(255,255,255,0.1)' }}>
                                      {p.name} ({p.codename})
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>Chưa cấp quyền nào</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="table-action-btn edit" onClick={() => handleOpenRoleEdit(r)} title="Sửa vai trò">
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  className="table-action-btn delete" 
                                  onClick={() => handleRoleDelete(r.id, r.name)} 
                                  title="Xóa vai trò"
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
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="admin-table-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(189, 163, 128, 0.2)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#bda380',
                        borderBottom: '2px solid #bda380',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Package size={16} />
                      Quản lý Tồn Kho ({products.length} mặt hàng)
                    </button>
                  </div>
                </div>

                {/* Search control row */}
                <div className="table-controls" style={{ marginBottom: '15px' }}>
                  <div className="search-box-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm trong kho..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Mã SP</th>
                        <th>Danh mục</th>
                        <th>Số lượng kho</th>
                        <th>Trạng thái tồn kho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-table-cell">Không tìm thấy sản phẩm nào.</td>
                        </tr>
                      ) : (
                        filteredProducts.map(p => {
                          const isEditingStock = editingStockId === p.id;
                          const currentStock = p.stock !== undefined ? p.stock : 10;
                          
                          // Trạng thái kho badge
                          let stockBadge = <span className="featured-badge true" style={{ backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71', border: '1px solid #2ecc71' }}>Còn hàng</span>;
                          if (currentStock === 0) {
                            stockBadge = <span className="featured-badge false" style={{ backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '1px solid #e74c3c' }}>Hết hàng</span>;
                          } else if (currentStock <= 5) {
                            stockBadge = <span className="featured-badge true" style={{ backgroundColor: 'rgba(230, 126, 34, 0.2)', color: '#e67e22', border: '1px solid #e67e22' }}>Sắp hết hàng</span>;
                          }

                          return (
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
                              <td className="table-code-text">#{p.id}</td>
                              <td><span className="category-badge">{p.category}</span></td>
                              <td>
                                {isEditingStock ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                      type="number"
                                      value={tempStockValue}
                                      onChange={(e) => setTempStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                                      style={{
                                        width: '70px',
                                        padding: '6px 8px',
                                        border: '1px solid var(--color-gold)',
                                        borderRadius: '4px',
                                        backgroundColor: '#1c1c1c',
                                        color: '#fff',
                                        outline: 'none',
                                        fontSize: '0.85rem'
                                      }}
                                      min="0"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveStock(p.id)}
                                      style={{
                                        color: '#2ecc71',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        border: '1px solid rgba(46, 204, 113, 0.4)',
                                        borderRadius: '4px',
                                        background: 'rgba(46, 204, 113, 0.1)',
                                        display: 'inline-flex',
                                        fontWeight: 'bold'
                                      }}
                                      title="Lưu"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingStockId(null)}
                                      style={{
                                        color: '#e74c3c',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        border: '1px solid rgba(231, 76, 60, 0.4)',
                                        borderRadius: '4px',
                                        background: 'rgba(231, 76, 60, 0.1)',
                                        display: 'inline-flex',
                                        fontWeight: 'bold'
                                      }}
                                      title="Hủy"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{currentStock}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditStock(p.id, currentStock)}
                                      style={{
                                        color: '#bda380',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        border: '1px solid rgba(189, 163, 128, 0.3)',
                                        borderRadius: '4px',
                                        background: 'rgba(189, 163, 128, 0.05)',
                                        display: 'inline-flex'
                                      }}
                                      title="Chỉnh sửa số lượng"
                                    >
                                      <Edit2 size={10} />
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td>{stockBadge}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="admin-table-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(189, 163, 128, 0.2)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                      type="button"
                      onClick={() => setOrderStatusFilter('ALL')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: orderStatusFilter === 'ALL' ? '#bda380' : '#888',
                        borderBottom: orderStatusFilter === 'ALL' ? '2px solid #bda380' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Tất cả đơn ({orders.length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOrderStatusFilter('PENDING')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: orderStatusFilter === 'PENDING' ? '#bda380' : '#888',
                        borderBottom: orderStatusFilter === 'PENDING' ? '2px solid #bda380' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Chờ xử lý ({orders.filter(o => o.status === 'PENDING').length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOrderStatusFilter('PROCESSING')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: orderStatusFilter === 'PROCESSING' ? '#bda380' : '#888',
                        borderBottom: orderStatusFilter === 'PROCESSING' ? '2px solid #bda380' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Đang xử lý ({orders.filter(o => o.status === 'PROCESSING').length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOrderStatusFilter('SHIPPING')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: orderStatusFilter === 'SHIPPING' ? '#bda380' : '#888',
                        borderBottom: orderStatusFilter === 'SHIPPING' ? '2px solid #bda380' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Đang giao ({orders.filter(o => o.status === 'SHIPPING').length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOrderStatusFilter('COMPLETED')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: orderStatusFilter === 'COMPLETED' ? '#2ecc71' : '#888',
                        borderBottom: orderStatusFilter === 'COMPLETED' ? '2px solid #2ecc71' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Hoàn thành ({orders.filter(o => o.status === 'COMPLETED').length})
                    </button>
                    <button 
                      type="button"
                      onClick={() => setOrderStatusFilter('CANCELLED')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: orderStatusFilter === 'CANCELLED' ? '#e74c3c' : '#888',
                        borderBottom: orderStatusFilter === 'CANCELLED' ? '2px solid #e74c3c' : '2px solid transparent',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Đã hủy ({orders.filter(o => o.status === 'CANCELLED').length})
                    </button>
                  </div>

                  <button 
                    type="button"
                    className="admin-btn admin-btn-primary" 
                    onClick={() => setIsExportModalOpen(true)}
                    style={{
                      backgroundColor: '#27ae60',
                      borderColor: '#27ae60',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#219653'; e.currentTarget.style.borderColor = '#219653'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#27ae60'; e.currentTarget.style.borderColor = '#27ae60'; }}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Xuất báo cáo Excel</span>
                  </button>
                </div>

                {/* Search box */}
                <div className="table-controls" style={{ marginBottom: '15px' }}>
                  <div className="search-box-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm đơn hàng (mã đơn, tên, sđt...)..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Table wrapper */}
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Số điện thoại</th>
                        <th>Tổng tiền (VNĐ)</th>
                        <th>Phương thức</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="empty-table-cell">Không tìm thấy đơn hàng nào.</td>
                        </tr>
                      ) : (
                        filteredOrders.map(o => {
                          let statusClass = "order-status-badge pending";
                          let statusLabel = "Chờ xử lý";
                          if (o.status === "PROCESSING") {
                            statusClass = "order-status-badge processing";
                            statusLabel = "Đang xử lý";
                          } else if (o.status === "SHIPPING") {
                            statusClass = "order-status-badge shipping";
                            statusLabel = "Đang giao";
                          } else if (o.status === "COMPLETED") {
                            statusClass = "order-status-badge completed";
                            statusLabel = "Đã hoàn thành";
                          } else if (o.status === "CANCELLED") {
                            statusClass = "order-status-badge cancelled";
                            statusLabel = "Đã hủy";
                          }

                          return (
                            <tr key={o.id}>
                              <td className="table-code-text" style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>
                                #TK-ORDER-{o.id}
                              </td>
                              <td className="table-bold-text">{o.name}</td>
                              <td>{o.phone}</td>
                              <td style={{ fontWeight: 'bold' }}>{parseFloat(o.total_price).toLocaleString('vi-VN')} đ</td>
                              <td style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>{o.payment_method}</td>
                              <td>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                              <td>
                                <span className={statusClass}>{statusLabel}</span>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button 
                                    className="table-action-btn edit" 
                                    onClick={() => handleOpenOrderDetails(o)}
                                    title="Xem chi tiết đơn hàng"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button 
                                    className="table-action-btn delete" 
                                    onClick={() => handleOrderDelete(o.id)}
                                    title="Xóa đơn hàng"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ORDER DETAILS MODAL */}
      {isOrderModalOpen && selectedOrderDetails && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Chi tiết Đơn hàng #TK-ORDER-{selectedOrderDetails.id}</h3>
              <button className="modal-close-btn" onClick={() => setIsOrderModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body-scrollable" style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto', textAlign: 'left' }}>
              
              {/* Customer info block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '6px', border: '1px solid rgba(189,163,128,0.1)' }}>
                <div>
                  <h4 style={{ color: 'var(--color-gold)', borderBottom: '1px solid rgba(189,163,128,0.2)', paddingBottom: '6px', marginBottom: '10px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Thông tin giao hàng
                  </h4>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Khách hàng:</strong> {selectedOrderDetails.name}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Số điện thoại:</strong> {selectedOrderDetails.phone}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Địa chỉ:</strong> {selectedOrderDetails.address}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Thành phố:</strong> {selectedOrderDetails.city}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem', wordBreak: 'break-all' }}><strong>Ghi chú:</strong> {selectedOrderDetails.notes || 'Không có ghi chú'}</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--color-gold)', borderBottom: '1px solid rgba(189,163,128,0.2)', paddingBottom: '6px', marginBottom: '10px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Chi tiết thanh toán
                  </h4>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Phương thức:</strong> <span style={{ textTransform: 'uppercase' }}>{selectedOrderDetails.payment_method}</span></p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Ngày tạo đơn:</strong> {new Date(selectedOrderDetails.created_at).toLocaleString('vi-VN')}</p>
                  <p style={{ margin: '6px 0', fontSize: '0.9rem' }}><strong>Hội viên:</strong> {selectedOrderDetails.user_email || 'Khách vãng lai'}</p>
                  
                  {/* Status update box */}
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.85rem', color: '#ccc' }}>
                      Cập nhật trạng thái đơn:
                    </label>
                    <select
                      value={selectedOrderDetails.status}
                      onChange={(e) => handleOrderStatusUpdate(selectedOrderDetails.id, e.target.value)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#111',
                        color: '#fff',
                        border: '1px solid var(--color-gold)',
                        borderRadius: '4px',
                        width: '100%',
                        fontSize: '0.9rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="PENDING">Chờ xử lý (Pending)</option>
                      <option value="PROCESSING">Đang xử lý (Processing)</option>
                      <option value="SHIPPING">Đang giao hàng (Shipping)</option>
                      <option value="COMPLETED">Đã hoàn thành (Completed)</option>
                      <option value="CANCELLED">Đã hủy (Cancelled)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ color: 'var(--color-gold)', marginBottom: '12px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Danh sách sản phẩm mua</h4>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Kích cỡ</th>
                      <th>Giá tiền</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderDetails.items && selectedOrderDetails.items.map(itm => (
                      <tr key={itm.id}>
                        <td className="table-bold-text">{itm.title}</td>
                        <td><span className="category-badge">{itm.selected_size}</span></td>
                        <td>{parseFloat(itm.price).toLocaleString('vi-VN')} đ</td>
                        <td>{itm.quantity}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>
                          {(parseFloat(itm.price) * itm.quantity).toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Final totals block */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <div style={{ minWidth: '250px', textAlign: 'right' }}>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                    Tạm tính: {selectedOrderDetails.items?.reduce((s, i) => s + parseFloat(i.price)*i.quantity, 0).toLocaleString('vi-VN')} đ
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                    Phí vận chuyển: {parseFloat(selectedOrderDetails.total_price) > 30000000 ? 'Miễn phí' : '35.000 đ'}
                  </p>
                  <h3 style={{ margin: '8px 0 0 0', color: 'var(--color-gold)', fontSize: '1.4rem' }}>
                    Tổng cộng: {parseFloat(selectedOrderDetails.total_price).toLocaleString('vi-VN')} đ
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '15px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setIsOrderModalOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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

              <div className="form-group">
                <label>Số lượng tồn kho *</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                  placeholder="Ví dụ: 10"
                  min="0"
                  required
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
                <label>Danh mục cha (Không chọn nếu là danh mục gốc)</label>
                <select
                  value={categoryForm.parent || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, parent: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#1c1c1c',
                    color: '#ffffff',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Danh mục gốc (Không có cha) --</option>
                  {categories
                    .filter(c => !c.parent && (!editingCategory || c.id !== editingCategory.id))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
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

      {/* USER MODAL */}
      {isUserModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Cập Nhật Tài Khoản' : 'Thêm Tài Khoản Mới'}</h3>
              <button className="modal-close-btn" onClick={() => setIsUserModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="modal-form">
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={userForm.first_name}
                  onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ Email / Tên đăng nhập *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Ví dụ: partner@thekluxury.com"
                  required
                  disabled={!!editingUser}
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu {editingUser ? '(Để trống nếu không muốn đổi)' : '*'}</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder={editingUser ? 'Nhập mật khẩu mới nếu muốn đổi' : 'Nhập mật khẩu tài khoản'}
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label>Gán vai trò (Roles)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', backgroundColor: '#1c1c1c' }}>
                  {roles.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>Chưa có vai trò nào được tạo</span>
                  ) : (
                    roles.map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          id={`user-role-${r.id}`}
                          checked={userForm.groups?.includes(r.id)}
                          onChange={(e) => {
                            const updatedGroups = e.target.checked
                              ? [...(userForm.groups || []), r.id]
                              : (userForm.groups || []).filter(gId => gId !== r.id);
                            setUserForm({ ...userForm, groups: updatedGroups });
                          }}
                        />
                        <label htmlFor={`user-role-${r.id}`} style={{ fontSize: '0.85rem', color: '#eee', cursor: 'pointer' }}>
                          {r.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '15px 0' }}>
                <div className="form-checkbox-group">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={userForm.is_active}
                    onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active">Tài khoản hoạt động (Active)</label>
                </div>

                <div className="form-checkbox-group">
                  <input
                    type="checkbox"
                    id="is_staff"
                    checked={userForm.is_staff}
                    onChange={(e) => setUserForm({ ...userForm, is_staff: e.target.checked })}
                  />
                  <label htmlFor="is_staff">Quyền Admin (Có quyền truy cập Admin Dashboard)</label>
                </div>

                <div className="form-checkbox-group">
                  <input
                    type="checkbox"
                    id="is_superuser"
                    checked={userForm.is_superuser}
                    onChange={(e) => setUserForm({ ...userForm, is_superuser: e.target.checked })}
                  />
                  <label htmlFor="is_superuser">Quyền Super Admin (Toàn quyền hệ thống)</label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsUserModalOpen(false)}>
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

      {/* ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingRole ? 'Cập Nhật Vai Trò' : 'Thêm Vai Trò Mới'}</h3>
              <button className="modal-close-btn" onClick={() => setIsRoleModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRoleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên vai trò *</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="Ví dụ: Quản lý Sản phẩm"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phân quyền chi tiết (Permissions)</label>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  padding: '12px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '6px', 
                  maxHeight: '300px', 
                  overflowY: 'auto', 
                  backgroundColor: '#1c1c1c' 
                }}>
                  {permissions.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>Không tải được danh sách quyền từ hệ thống</span>
                  ) : (
                    ['item', 'category', 'user', 'group'].map(modelName => {
                      const modelPerms = permissions.filter(p => p.codename.includes(modelName));
                      if (modelPerms.length === 0) return null;
                      
                      let groupTitle = '';
                      if (modelName === 'item') groupTitle = 'Quản lý Sản phẩm';
                      else if (modelName === 'category') groupTitle = 'Quản lý Danh mục';
                      else if (modelName === 'user') groupTitle = 'Quản lý Tài khoản';
                      else if (modelName === 'group') groupTitle = 'Quản lý Vai trò';

                      return (
                        <div key={modelName} style={{ marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '0.9rem', color: '#d1a852', borderBottom: '1px solid rgba(189,163,128,0.2)', paddingBottom: '4px', marginBottom: '6px' }}>
                            {groupTitle}
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {modelPerms.map(p => (
                              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="checkbox"
                                  id={`perm-${p.id}`}
                                  checked={roleForm.permissions?.includes(p.id)}
                                  onChange={(e) => {
                                    const updatedPerms = e.target.checked
                                      ? [...(roleForm.permissions || []), p.id]
                                      : (roleForm.permissions || []).filter(pId => pId !== p.id);
                                    setRoleForm({ ...roleForm, permissions: updatedPerms });
                                  }}
                                />
                                <label htmlFor={`perm-${p.id}`} style={{ fontSize: '0.8rem', color: '#ddd', cursor: 'pointer' }}>
                                  {p.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsRoleModalOpen(false)}>
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

      {/* EXPORT EXCEL MODAL */}
      {isExportModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Xuất Báo Cáo Doanh Thu</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setIsExportModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleExportRevenueToExcel(exportMonth, exportYear);
                setIsExportModalOpen(false);
              }} 
              className="modal-form"
            >
              <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                Chọn tháng và năm để tải file báo cáo doanh thu dưới dạng Excel (.xlsx).
              </p>
              
              <div className="form-group-row">
                <div className="form-group">
                  <label>Tháng</label>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(e.target.value)}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i + 1).padStart(2, '0');
                      return <option key={m} value={m}>Tháng {m}</option>;
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>Năm</label>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const y = String(new Date().getFullYear() - i);
                      return <option key={y} value={y}>Năm {y}</option>;
                    })}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setIsExportModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-btn-primary"
                  style={{
                    backgroundColor: '#27ae60',
                    borderColor: '#27ae60',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#219653'; e.currentTarget.style.borderColor = '#219653'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#27ae60'; e.currentTarget.style.borderColor = '#27ae60'; }}
                >
                  Tải xuống Excel
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
