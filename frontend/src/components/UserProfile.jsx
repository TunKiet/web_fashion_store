import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Award, Heart, ShoppingBag, LogOut, ArrowLeft, Settings } from 'lucide-react';

function UserProfile({ currentUser, favorites = [], onClose, onLogout, onOpenAdmin }) {
  if (!currentUser) return null;

  // Giả lập lịch sử đơn hàng cao cấp để làm giao diện sinh động và đẳng cấp hơn
  const mockOrders = [
    {
      id: "TK-9824",
      date: "12/05/2026",
      items: "Đầm Dạ Hội Lụa Draping Cao Cấp",
      price: "31.500.000 đ",
      status: "Đã giao hàng",
      statusColor: "#4caf50"
    },
    {
      id: "TK-9511",
      date: "28/04/2026",
      items: "Túi Da Đeo Vai Tối Giản",
      price: "23.750.000 đ",
      status: "Đã giao hàng",
      statusColor: "#4caf50"
    }
  ];

  const getMemberTier = () => {
    if (currentUser.is_superuser) return { name: "Thành viên Thượng hoàng (Superuser)", color: "#d1a852" };
    if (currentUser.is_staff) return { name: "Thành viên Hoàng gia (Staff)", color: "#bda380" };
    return { name: "Thành viên Platinum VIP", color: "#d1a852" };
  };

  const tier = getMemberTier();

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
                <span className="points-value">12,500</span>
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
                  <span className="stat-num">{mockOrders.length}</span>
                  <span className="stat-label">Đơn hàng</span>
                </div>
              </div>
            </div>

            {/* Right side: Detailed Information & Orders */}
            <div className="profile-right-column">
              <div className="profile-section-title">
                <h3>Thông Tin Chi Tiết</h3>
                <div className="title-underline"></div>
              </div>

              <div className="info-fields-list">
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
              </div>

              {/* Lịch sử đơn hàng */}
              <div className="profile-section-title" style={{ marginTop: '40px' }}>
                <h3>Lịch Sử Đơn Hàng Premium</h3>
                <div className="title-underline"></div>
              </div>

              <div className="orders-table-wrapper">
                {mockOrders.length === 0 ? (
                  <p className="no-orders-msg">Chưa có đơn hàng nào được đặt.</p>
                ) : (
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
                      {mockOrders.map(order => (
                        <tr key={order.id}>
                          <td className="order-id">{order.id}</td>
                          <td>{order.date}</td>
                          <td className="order-items">{order.items}</td>
                          <td className="order-price">{order.price}</td>
                          <td>
                            <span className="order-status-badge" style={{ backgroundColor: `${order.statusColor}15`, color: order.statusColor }}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Actions row */}
              <div className="profile-actions-footer">
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
