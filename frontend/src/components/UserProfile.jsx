import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ShieldCheck, Award, Heart, ShoppingBag, LogOut, ArrowLeft, Settings, Edit3, KeyRound, Loader2, Save, X, Shield, QrCode, Copy, Check, Tag } from 'lucide-react';
import { getOrders, updateProfile, get2FAStatus, request2FACode, enable2FA, disable2FA, getVouchers } from '../services/api';

function UserProfile({ currentUser, favorites = [], onClose, onLogout, onOpenAdmin, onUpdateSuccess }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'orders' | 'settings'
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  // Voucher Wallet State
  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  
  // Edit Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 2FA State
  const [twoFactorStatus, setTwoFactorStatus] = useState({ is_enabled: false });
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Fetch real order history from backend on mount
  useEffect(() => {
    if (!currentUser) return;
    
    getOrders()
      .then(res => {
        setOrders(res.data || []);
      })
      .catch(err => {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [currentUser]);

  // Load 2FA status and reset page when activeTab changes
  useEffect(() => {
    if (activeTab === 'settings') {
      fetch2FAStatus();
    } else if (activeTab === 'vouchers') {
      fetchVouchers();
    }
    setCurrentPage(1);
  }, [activeTab]);

  const fetch2FAStatus = () => {
    get2FAStatus()
      .then(res => {
        setTwoFactorStatus(res.data);
      })
      .catch(err => {
        console.error("Lỗi khi tải trạng thái 2FA:", err);
      });
  };

  const fetchVouchers = () => {
    setLoadingVouchers(true);
    getVouchers()
      .then(res => {
        const now = new Date();
        const activeVouchers = (res.data || []).filter(v => {
          const validTo = v.valid_to ? new Date(v.valid_to) : null;
          return v.is_active && v.is_public && (!validTo || validTo > now);
        });
        setVouchers(activeVouchers);
      })
      .catch(err => {
        console.error("Lỗi khi tải kho voucher:", err);
      })
      .finally(() => {
        setLoadingVouchers(false);
      });
  };

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  if (!currentUser) return null;

  const getMemberTier = () => {
    if (currentUser.is_superuser) return { name: "Thành viên Thượng hoàng (Superuser)", color: "#d1a852" };
    if (currentUser.is_staff) return { name: "Thành viên Hoàng gia (Staff)", color: "#bda380" };
    return { name: "Thành viên Platinum VIP", color: "#d1a852" };
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ xử lý', color: '#888888' };
      case 'PROCESSING':
        return { label: 'Đang xử lý', color: '#0070e0' };
      case 'SHIPPING':
        return { label: 'Đang giao hàng', color: '#e67e22' };
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', color: '#4caf50' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: '#e74c3c' };
      default:
        return { label: status, color: '#888888' };
    }
  };

  const tier = getMemberTier();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name || !formData.email) {
      setErrorMsg("Họ tên và Email không được để trống.");
      return;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        setErrorMsg("Mật khẩu mới phải dài ít nhất 6 ký tự.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg("Mật khẩu mới và mật khẩu xác nhận không khớp.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateProfile(payload);
      
      setSuccessMsg("Cập nhật thông tin cá nhân thành công!");
      
      if (onUpdateSuccess) {
        onUpdateSuccess({
          ...currentUser,
          name: res.data.name,
          email: res.data.email,
          is_superuser: res.data.is_superuser,
          is_staff: res.data.is_staff
        });
      }
      
      setTimeout(() => {
        setIsEditing(false);
        setSuccessMsg('');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // 2FA Handlers
  const handleRequest2FACode = async () => {
    setTwoFactorError('');
    setTwoFactorSuccess('');
    setSubmitting(true);
    try {
      const res = await request2FACode();
      setTwoFactorSuccess(res.data.message || "Mã xác thực OTP đã được gửi tới email của bạn.");
      setCodeSent(true);
    } catch (err) {
      console.error(err);
      setTwoFactorError(err.response?.data?.error || "Không thể yêu cầu gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError("Mã xác thực phải gồm 6 chữ số.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await enable2FA(twoFactorCode);
      setTwoFactorSuccess(res.data.message);
      setTwoFactorCode('');
      setTwoFactorSetupOpen(false);
      setCodeSent(false);
      fetch2FAStatus();
    } catch (err) {
      console.error(err);
      setTwoFactorError(err.response?.data?.error || "Mã xác thực 2FA không hợp lệ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError("Mã xác thực phải gồm 6 chữ số.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await disable2FA(twoFactorCode);
      setTwoFactorSuccess(res.data.message);
      setTwoFactorCode('');
      setTwoFactorSetupOpen(false);
      setCodeSent(false);
      fetch2FAStatus();
    } catch (err) {
      console.error(err);
      setTwoFactorError(err.response?.data?.error || "Mã xác thực 2FA không hợp lệ.");
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination calculation
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="user-profile-overlay">
      <div className="profile-container-wrapper">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="profile-card"
        >
          {/* Header */}
          <div className="profile-card-header">
            <button className="back-to-shop-btn" onClick={onClose}>
              <ArrowLeft size={16} />
              <span>Quay lại Cửa hàng</span>
            </button>
            <div className="profile-logo-container">
              <img src="/images/the_k_luxury_logo_transparent.png" alt="The K Luxury" className="profile-logo" />
            </div>
            <div></div> {/* spacer */}
          </div>

          <div className="profile-card-body">
            {/* Left side: Member Badge & Info Summary */}
            <div className="profile-left-column">
              <div className="avatar-gold-wrapper">
                <div className="profile-avatar">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={40} />}
                </div>
                <div className="avatar-gold-ring"></div>
              </div>
              
              <h2 className="profile-user-name">{currentUser.name}</h2>
              <div className="member-badge" style={{ borderColor: tier.color, color: tier.color }}>
                <Award size={12} style={{ marginRight: '5px' }} />
                <span>{tier.name}</span>
              </div>

              <div className="loyalty-points-box">
                <span className="points-label">Điểm Tích Lũy</span>
                <span className="points-value">
                  {orders.filter(o => o.status === 'COMPLETED').length * 1000 + 500}
                </span>
                <span className="points-subtitle">Mức chi tiêu Platinum Member</span>
              </div>

              <div className="profile-stats-grid">
                <div className="stat-box">
                  <Heart size={16} style={{ color: '#d1a852', marginBottom: '8px' }} />
                  <span className="stat-num">{favorites.length}</span>
                  <span className="stat-label">Yêu thích</span>
                </div>
                <div className="stat-box">
                  <ShoppingBag size={16} style={{ color: '#d1a852', marginBottom: '8px' }} />
                  <span className="stat-num">{orders.length}</span>
                  <span className="stat-label">Đơn hàng</span>
                </div>
              </div>
            </div>

            {/* Right side: Detailed Information & Orders */}
            <div className="profile-right-column">
              
              {/* Tab Navigation Menu */}
              <div className="profile-tabs-nav" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px', marginBottom: '30px' }}>
                <button 
                  className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('info'); setIsEditing(false); }}
                  style={{ background: 'none', border: 'none', color: activeTab === 'info' ? 'var(--color-gold)' : 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', paddingBottom: '10px' }}
                >
                  Hồ Sơ
                  {activeTab === 'info' && <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '2px', backgroundColor: 'var(--color-gold)' }} />}
                </button>
                <button 
                  className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('orders'); setIsEditing(false); }}
                  style={{ background: 'none', border: 'none', color: activeTab === 'orders' ? 'var(--color-gold)' : 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', paddingBottom: '10px' }}
                >
                  Đơn Hàng ({orders.length})
                  {activeTab === 'orders' && <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '2px', backgroundColor: 'var(--color-gold)' }} />}
                </button>
                <button 
                  className={`profile-tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('vouchers'); setIsEditing(false); }}
                  style={{ background: 'none', border: 'none', color: activeTab === 'vouchers' ? 'var(--color-gold)' : 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', paddingBottom: '10px' }}
                >
                  Kho Voucher
                  {activeTab === 'vouchers' && <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '2px', backgroundColor: 'var(--color-gold)' }} />}
                </button>
                <button 
                  className={`profile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('settings'); setIsEditing(false); }}
                  style={{ background: 'none', border: 'none', color: activeTab === 'settings' ? 'var(--color-gold)' : 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', paddingBottom: '10px' }}
                >
                  Cài Đặt
                  {activeTab === 'settings' && <div style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '2px', backgroundColor: 'var(--color-gold)' }} />}
                </button>
              </div>

              {/* TAB 1: PROFILE INFO */}
              {activeTab === 'info' && (
                <div>
                  <div className="profile-section-title">
                    <h3>{isEditing ? "Chỉnh Sửa Hồ Sơ" : "Thông Tin Chi Tiết"}</h3>
                    <div className="title-underline"></div>
                  </div>

                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.form 
                        key="edit-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleSaveProfile}
                        className="edit-profile-form"
                        style={{ textAlign: 'left' }}
                      >
                        {errorMsg && (
                          <div className="profile-error-alert" style={{ color: '#e74c3c', fontSize: '12px', marginBottom: '15px', padding: '10px', background: 'rgba(231,76,60,0.1)', borderRadius: '4px', border: '1px solid rgba(231,76,60,0.2)' }}>
                            {errorMsg}
                          </div>
                        )}
                        {successMsg && (
                          <div className="profile-success-alert" style={{ color: '#4caf50', fontSize: '12px', marginBottom: '15px', padding: '10px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px', border: '1px solid rgba(76,175,80,0.2)' }}>
                            {successMsg}
                          </div>
                        )}

                        <div className="form-fields-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div className="checkout-input-group">
                            <label>Họ và Tên</label>
                            <div className="input-with-icon">
                              <User size={14} className="field-icon" />
                              <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                placeholder="Nhập họ và tên mới"
                                required 
                              />
                            </div>
                          </div>

                          <div className="checkout-input-group">
                            <label>Địa chỉ Email</label>
                            <div className="input-with-icon">
                              <Mail size={14} className="field-icon" />
                              <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                placeholder="Nhập địa chỉ email mới"
                                required 
                              />
                            </div>
                          </div>

                          <div className="checkout-input-group">
                            <label>Mật khẩu mới (Để trống nếu không muốn đổi)</label>
                            <div className="input-with-icon">
                              <KeyRound size={14} className="field-icon" />
                              <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleInputChange} 
                                placeholder="Tối thiểu 6 ký tự" 
                              />
                            </div>
                          </div>

                          <div className="checkout-input-group">
                            <label>Xác nhận mật khẩu mới</label>
                            <div className="input-with-icon">
                              <KeyRound size={14} className="field-icon" />
                              <input 
                                type="password" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleInputChange} 
                                placeholder="Nhập lại mật khẩu mới" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="edit-actions-row" style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
                          <button 
                            type="submit" 
                            className="gold-btn" 
                            disabled={submitting}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '11px', letterSpacing: '1px' }}
                          >
                            {submitting ? (
                              <Loader2 size={14} className="luxury-spinner" style={{ animation: 'spinProfile 1s linear infinite' }} />
                            ) : (
                              <Save size={14} />
                            )}
                            <span>LƯU THAY ĐỔI</span>
                          </button>
                          <button 
                            type="button" 
                            className="cancel-edit-btn"
                            onClick={() => {
                              setIsEditing(false);
                              setErrorMsg('');
                              setFormData({
                                name: currentUser.name,
                                email: currentUser.email,
                                password: '',
                                confirmPassword: ''
                              });
                            }}
                            style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '12px 24px', cursor: 'pointer', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, letterSpacing: '1px' }}
                          >
                            <X size={14} />
                            <span>HỦY</span>
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div 
                        key="details-view"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="info-fields-list"
                      >
                        <div className="info-field-item">
                          <div className="field-icon-wrapper">
                            <User size={16} />
                          </div>
                          <div className="field-content">
                            <span className="field-label">Họ và Tên</span>
                            <span className="field-value">{currentUser.name}</span>
                          </div>
                        </div>

                        <div className="info-field-item">
                          <div className="field-icon-wrapper">
                            <Mail size={16} />
                          </div>
                          <div className="field-content">
                            <span className="field-label">Địa chỉ Email</span>
                            <span className="field-value">{currentUser.email}</span>
                          </div>
                        </div>

                        <div className="info-field-item">
                          <div className="field-icon-wrapper">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="field-content">
                            <span className="field-label">Quyền Hạn Tài Khoản</span>
                            <span className="field-value">
                              {currentUser.is_superuser 
                                ? "Quản trị viên cấp cao (Superuser)" 
                                : currentUser.is_staff 
                                  ? "Nhân viên hệ thống (Staff)" 
                                  : "Khách hàng Thượng lưu"}
                            </span>
                          </div>
                        </div>

                        <button 
                          className="edit-profile-trigger-btn"
                          onClick={() => setIsEditing(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid var(--color-gold)', color: 'var(--color-gold)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginTop: '20px', transition: 'all 0.3s ease' }}
                        >
                          <Edit3 size={14} />
                          <span>CHỈNH SỬA THÔNG TIN</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* TAB 2: ORDERS LIST */}
              {activeTab === 'orders' && (
                <div>
                  <div className="profile-section-title">
                    <h3>Lịch Sử Đơn Hàng Premium</h3>
                    <div className="title-underline"></div>
                  </div>

                  <div className="orders-table-wrapper">
                    {loadingOrders ? (
                      <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--color-text-muted)' }}>
                        <Loader2 className="luxury-spinner" style={{ animation: 'spinProfile 1s linear infinite', margin: '0 auto 10px auto', width: '30px', height: '30px' }} />
                        <p style={{ fontSize: '12px' }}>Đang tải lịch sử đơn hàng...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <p className="no-orders-msg">Chưa có đơn hàng nào được đặt.</p>
                    ) : (
                      <>
                        <table className="orders-table">
                          <thead>
                            <tr>
                              <th>Mã đơn</th>
                              <th>Ngày đặt</th>
                              <th>Sản phẩm</th>
                              <th>Giá trị</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentOrders.map(order => {
                              const statusConfig = getStatusConfig(order.status);
                              const itemsSummary = order.items
                                ? order.items.map(i => `${i.quantity}x ${i.title}`).join(', ')
                                : 'N/A';
                              return (
                                <tr key={order.id}>
                                  <td className="order-id">TK-ORDER-{order.id}</td>
                                  <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                  <td className="order-items" title={itemsSummary}>{itemsSummary}</td>
                                  <td className="order-price">{parseFloat(order.total_price).toLocaleString('vi-VN')} đ</td>
                                  <td>
                                    <span 
                                      className="order-status-badge" 
                                      style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}
                                    >
                                      {statusConfig.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="orders-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px' }}>
                            <button 
                              type="button"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              style={{ 
                                background: 'none', 
                                border: '1px solid var(--color-border)', 
                                color: currentPage === 1 ? 'var(--color-text-muted)' : 'var(--color-text-main)', 
                                padding: '8px 16px', 
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                opacity: currentPage === 1 ? 0.3 : 1,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Trước
                            </button>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                                <button
                                  key={pageNum}
                                  type="button"
                                  onClick={() => setCurrentPage(pageNum)}
                                  style={{
                                    background: currentPage === pageNum ? 'var(--color-gold)' : 'none',
                                    border: '1px solid',
                                    borderColor: currentPage === pageNum ? 'var(--color-gold)' : 'var(--color-border)',
                                    color: currentPage === pageNum ? '#fff' : 'var(--color-text-main)',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  {pageNum}
                                </button>
                              ))}
                            </div>

                            <button 
                              type="button"
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              style={{ 
                                background: 'none', 
                                border: '1px solid var(--color-border)', 
                                color: currentPage === totalPages ? 'var(--color-text-muted)' : 'var(--color-text-main)', 
                                padding: '8px 16px', 
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                opacity: currentPage === totalPages ? 0.3 : 1,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              Sau
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & 2FA */}
              {activeTab === 'settings' && (
                <div>
                  <div className="profile-section-title">
                    <h3>Cài Đặt Bảo Mật Hoàng Gia</h3>
                    <div className="title-underline"></div>
                  </div>

                  <div className="settings-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '25px', textAlign: 'left', marginTop: '20px' }}>
                    
                    {/* 2FA Option item */}
                    <div className="settings-item-box" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '25px', background: 'rgba(255, 255, 255, 0.02)', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                        <div style={{ background: 'rgba(189, 163, 128, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--color-gold)' }}>
                          <Shield size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, letterSpacing: '0.5px' }}>
                              Xác Thực 2 Lớp (2FA)
                            </h4>
                            <span 
                              style={{ 
                                fontSize: '10px', 
                                padding: '3px 10px', 
                                borderRadius: '20px', 
                                fontWeight: 700, 
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                backgroundColor: twoFactorStatus.is_enabled ? 'rgba(76,175,80,0.1)' : 'rgba(136,136,136,0.1)',
                                color: twoFactorStatus.is_enabled ? '#4caf50' : '#888888',
                                border: `1px solid ${twoFactorStatus.is_enabled ? 'rgba(76,175,80,0.2)' : 'rgba(136,136,136,0.2)'}`
                              }}
                            >
                              {twoFactorStatus.is_enabled ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                            </span>
                          </div>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', lineHeight: '1.6', margin: '8px 0 20px 0', fontWeight: 300 }}>
                            Bảo vệ tài khoản của bạn khỏi việc truy cập trái phép bằng cách yêu cầu mã bảo mật 6 số từ Google Authenticator hoặc Microsoft Authenticator mỗi khi đăng nhập.
                          </p>

                          {/* Success or Error alerts for 2FA */}
                          {twoFactorSuccess && (
                            <div style={{ color: '#4caf50', fontSize: '12px', padding: '10px 15px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px', border: '1px solid rgba(76,175,80,0.2)', marginBottom: '15px' }}>
                              {twoFactorSuccess}
                            </div>
                          )}
                          {twoFactorError && (
                            <div style={{ color: '#e74c3c', fontSize: '12px', padding: '10px 15px', background: 'rgba(231,76,60,0.1)', borderRadius: '4px', border: '1px solid rgba(231,76,60,0.2)', marginBottom: '15px' }}>
                              {twoFactorError}
                            </div>
                          )}

                          {/* 2FA Setup Flow Panel */}
                          {twoFactorSetupOpen ? (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '15px' }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '450px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.6', margin: 0 }}>
                                  {twoFactorStatus.is_enabled 
                                    ? `Để tắt tính năng xác thực 2 lớp, hệ thống sẽ gửi một mã OTP gồm 6 chữ số đến địa chỉ email đăng ký của bạn (${currentUser?.email}).`
                                    : `Để kích hoạt tính năng xác thực 2 lớp, hệ thống sẽ gửi một mã OTP gồm 6 chữ số đến địa chỉ email đăng ký của bạn (${currentUser?.email}).`
                                  }
                                </p>

                                {!codeSent ? (
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                      type="button" 
                                      className="gold-btn" 
                                      onClick={handleRequest2FACode}
                                      disabled={submitting}
                                      style={{ padding: '0 20px', fontSize: '10px', height: '41px' }}
                                    >
                                      {submitting ? 'ĐANG GỬI...' : 'GỬI MÃ OTP QUA EMAIL'}
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => { setTwoFactorSetupOpen(false); setTwoFactorError(''); setTwoFactorSuccess(''); }}
                                      style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '0 15px', cursor: 'pointer', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}
                                    >
                                      HỦY
                                    </button>
                                  </div>
                                ) : (
                                  <form onSubmit={twoFactorStatus.is_enabled ? handleDisable2FA : handleEnable2FA}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '10px' }}>
                                      Nhập mã xác thực 6 số được gửi tới email của bạn:
                                    </label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                      <input 
                                        type="text" 
                                        placeholder="000000"
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                        maxLength="6"
                                        style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--color-border)', background: 'var(--color-bg-cream)', borderRadius: '4px', outline: 'none', color: 'var(--color-text-main)', fontSize: '14px', letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center' }}
                                        required
                                      />
                                      <button 
                                        type="submit" 
                                        className="gold-btn" 
                                        disabled={submitting}
                                        style={{ padding: '0 20px', fontSize: '10px', height: '41px' }}
                                      >
                                        {twoFactorStatus.is_enabled ? 'XÁC NHẬN TẮT' : 'KÍCH HOẠT'}
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => { setTwoFactorSetupOpen(false); setTwoFactorCode(''); setTwoFactorError(''); setCodeSent(false); }}
                                        style={{ background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', padding: '0 15px', cursor: 'pointer', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}
                                      >
                                        HỦY
                                      </button>
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '11px' }}>
                                      <span style={{ color: 'var(--color-text-muted)' }}>Không nhận được mã? </span>
                                      <button 
                                        type="button" 
                                        onClick={handleRequest2FACode} 
                                        disabled={submitting}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-gold)', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontWeight: 600 }}
                                      >
                                        Gửi lại mã
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </motion.div>
                          ) : (
                            // Action toggle button
                            <button 
                              onClick={() => {
                                setTwoFactorSetupOpen(true);
                                setTwoFactorError('');
                                setTwoFactorSuccess('');
                                setTwoFactorCode('');
                                setCodeSent(false);
                              }}
                              style={{ 
                                border: '1px solid',
                                borderColor: twoFactorStatus.is_enabled ? '#e74c3c' : 'var(--color-gold)', 
                                color: twoFactorStatus.is_enabled ? '#e74c3c' : 'var(--color-gold)', 
                                background: 'none', 
                                padding: '10px 20px', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <Shield size={14} />
                              <span>{twoFactorStatus.is_enabled ? 'Hủy kích hoạt 2FA' : 'Kích hoạt bảo mật 2FA'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Standard Mock Settings for luxury feeling */}
                    <div className="settings-item-box" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '25px', background: 'rgba(255, 255, 255, 0.02)', opacity: 0.65 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                        <div style={{ background: 'rgba(189, 163, 128, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--color-gold)' }}>
                          <Mail size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'space-between', width: '100%' }}>
                            <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500, letterSpacing: '0.5px' }}>
                              Nhận thông báo đơn hàng qua Email
                            </h4>
                            <span style={{ fontSize: '10px', color: '#4caf50', fontWeight: 'bold' }}>BẬT</span>
                          </div>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', lineHeight: '1.6', margin: '8px 0 0 0', fontWeight: 300 }}>
                            Gửi email xác thực biên lai và cập nhật trạng thái đơn hàng tự động từ hệ thống The K Luxury.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: KHO VOUCHER */}
              {activeTab === 'vouchers' && (
                <div>
                  <div className="profile-section-title">
                    <h3>Kho Voucher Hoàng Gia</h3>
                    <div className="title-underline"></div>
                  </div>

                  {loadingVouchers ? (
                    <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--color-text-muted)' }}>
                      <Loader2 className="luxury-spinner" style={{ animation: 'spinProfile 1s linear infinite', margin: '0 auto 10px auto', width: '30px', height: '30px' }} />
                      <p style={{ fontSize: '12px' }}>Đang đồng bộ kho voucher...</p>
                    </div>
                  ) : vouchers.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 0', fontSize: '13px', fontWeight: 300 }}>Hiện tại chưa có mã giảm giá nào khả dụng.</p>
                  ) : (
                    <div className="voucher-wallet-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                      {vouchers.map(v => {
                        const isPercentage = v.discount_type === 'percentage';
                        const discountDisplay = isPercentage 
                          ? `${parseFloat(v.discount_value)}%` 
                          : `${(parseFloat(v.discount_value) / 1000).toLocaleString('vi-VN')}K`;
                        
                        return (
                          <div 
                            key={v.id} 
                            style={{ 
                              display: 'flex', 
                              border: '1px solid var(--color-border)', 
                              borderRadius: '8px', 
                              overflow: 'hidden', 
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              position: 'relative'
                            }}
                          >
                            {/* Left part: Discount Badge */}
                            <div 
                              style={{ 
                                background: 'linear-gradient(135deg, #111 0%, #1c1c1c 100%)', 
                                color: 'var(--color-gold)', 
                                borderRight: '1px dashed var(--color-border)', 
                                padding: '20px 15px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                width: '110px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                              }}
                            >
                              <span style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>{discountDisplay}</span>
                              <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px', opacity: 0.8 }}>GIẢM GIÁ</span>
                            </div>

                            {/* Right part: Coupon Details */}
                            <div style={{ flex: 1, padding: '15px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--color-gold)', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px' }}>{v.code}</h4>
                                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: 'var(--color-text-main)', fontWeight: 400 }}>
                                  Đơn tối thiểu: <strong>{parseFloat(v.min_order_value).toLocaleString('vi-VN')} đ</strong>
                                </p>
                                {v.usage_limit && (
                                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                    Số lượng còn lại: <strong>{v.usage_limit - v.used_count} lượt</strong>
                                  </p>
                                )}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                  Hạn dùng: {new Date(v.valid_to).toLocaleDateString('vi-VN')}
                                </span>
                                
                                <button
                                  onClick={() => handleCopyVoucher(v.code)}
                                  style={{
                                    background: copiedCode === v.code ? '#27ae60' : 'none',
                                    border: copiedCode === v.code ? '1px solid #27ae60' : '1px solid var(--color-gold)',
                                    color: copiedCode === v.code ? '#fff' : 'var(--color-gold)',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  {copiedCode === v.code ? <Check size={10} /> : <Copy size={10} />}
                                  <span>{copiedCode === v.code ? 'Đã sao chép' : 'Sao chép'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Actions row */}
              <div className="profile-actions-footer" style={{ marginTop: '40px' }}>
                {(currentUser.is_superuser || currentUser.is_staff) && (
                  <button className="profile-action-btn admin-btn-action" onClick={onOpenAdmin}>
                    <Settings size={14} />
                    <span>Trang Quản Trị</span>
                  </button>
                )}
                <button className="profile-action-btn logout-btn-action" onClick={onLogout}>
                  <LogOut size={14} />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default UserProfile;
