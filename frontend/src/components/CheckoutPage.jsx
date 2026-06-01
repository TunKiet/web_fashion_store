import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, CheckCircle, Smartphone, MapPin, Phone, User, Clock, Check, ShieldCheck, Heart } from 'lucide-react';
import { createOrder } from '../services/api';


function CheckoutPage({ cart, cartSubtotal, currentUser, onClearCart, onClose }) {
  const [shippingInfo, setShippingInfo] = useState({
    name: currentUser?.name || '',
    phone: '',
    address: '',
    city: 'Thành phố Hồ Chí Minh',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo' | 'zalopay' | 'vnpay' | 'card' | 'cod'
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvc: '' });
  
  // States for interactive simulated gateway
  const [showQRModal, setShowQRModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

  // Vietnam Provinces API State
  const [provinces, setProvinces] = useState([]);

  // Fetch Vietnam Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
        if (!response.ok) throw new Error('Failed to fetch provinces');
        const data = await response.json();
        // Sort provinces alphabetically by name for better UX
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setProvinces(sortedData);
      } catch (err) {
        console.error("Error fetching provinces:", err);
        // Fallback to static list if API is down
        setProvinces([
          { code: 79, name: 'Thành phố Hồ Chí Minh' },
          { code: 1, name: 'Thành phố Hà Nội' },
          { code: 48, name: 'Thành phố Đà Nẵng' },
          { code: 92, name: 'Thành phố Cần Thơ' },
          { code: 31, name: 'Thành phố Hải Phòng' },
          { code: 30, name: 'Tỉnh Quảng Ninh' },
          { code: 74, name: 'Tỉnh Bình Dương' },
          { code: 75, name: 'Tỉnh Đồng Nai' },
          { code: 91, name: 'Tỉnh Kiên Giang' }
        ]);
      }
    };
    fetchProvinces();
  }, []);

  // Format countdown timer
  useEffect(() => {
    if (!showQRModal || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showQRModal, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({ ...prev, [name]: value }));
  };

  // Submit flow
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng.");
      return;
    }

    if (paymentMethod === 'momo') {
      handleRealMomoPayment();
    } else if (['zalopay', 'vnpay'].includes(paymentMethod)) {
      setTimeLeft(900); // reset 15 mins
      setShowQRModal(true);
    } else {
      // Direct payment (Card/COD)
      simulatePaymentVerification();
    }
  };

  const [createdOrderId, setCreatedOrderId] = useState(null);

  const handleRealMomoPayment = async () => {
    setIsVerifying(true);
    try {
      const itemsPayload = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'M'
      }));

      const res = await createOrder({
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        notes: shippingInfo.notes,
        payment_method: 'momo',
        items: itemsPayload,
        redirect_url: `${window.location.origin}/`,
        ipn_url: 'http://localhost:8000/api/orders/momo-ipn/'
      });

      if (res.data.pay_url) {
        onClearCart();
        window.location.href = res.data.pay_url;
      } else {
        alert("Không thể khởi tạo phiên thanh toán MoMo. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi khi tạo đơn hàng thanh toán MoMo.");
    } finally {
      setIsVerifying(false);
    }
  };

  const simulatePaymentVerification = async () => {
    setIsVerifying(true);
    try {
      const itemsPayload = cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'M'
      }));

      const res = await createOrder({
        name: shippingInfo.name,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        notes: shippingInfo.notes,
        payment_method: paymentMethod,
        items: itemsPayload
      });

      setCreatedOrderId(res.data.id);
      setIsSuccess(true);
      onClearCart();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmQR = () => {
    setShowQRModal(false);
    simulatePaymentVerification();
  };

  // Shipping cost calculation
  const shippingFee = cartSubtotal > 30000000 ? 0 : 35000;
  const grandTotal = cartSubtotal + shippingFee;

  // Render e-wallet visual configuration
  const getWalletConfig = () => {
    switch (paymentMethod) {
      case 'momo':
        return {
          name: 'Ví MoMo',
          color: '#a50064',
          qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MoMoPay_TheKLuxury_' + grandTotal,
          instructions: 'Quét mã bằng ứng dụng MoMo để hoàn thành thanh toán đặc quyền.'
        };
      case 'zalopay':
        return {
          name: 'Ví ZaloPay',
          color: '#0070e0',
          qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ZaloPay_TheKLuxury_' + grandTotal,
          instructions: 'Quét mã bằng ứng dụng Zalo/ZaloPay để thực hiện chuyển tiền.'
        };
      case 'vnpay':
        return {
          name: 'Cổng VNPAY QR',
          color: '#005baa',
          qrPlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VNPAY_TheKLuxury_' + grandTotal,
          instructions: 'Quét mã QR bằng ứng dụng ngân hàng di động của bạn (Mobile Banking).'
        };
      default:
        return { name: '', color: '#bda380', qrPlaceholder: '', instructions: '' };
    }
  };

  const wallet = getWalletConfig();

  if (isSuccess) {
    return (
      <div className="checkout-success-view">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="success-message-card"
        >
          <div className="success-icon-gold">
            <CheckCircle size={64} />
          </div>
          <h2 className="success-title">Đặt Hàng Thành Công</h2>
          <p className="success-subtitle">
            Cảm ơn bạn đã lựa chọn những thiết kế độc bản từ **The K Luxury**. Đơn hàng của bạn đang được chuẩn bị để đóng gói hoàng gia.
          </p>

          <div className="success-order-details">
            <div className="detail-row">
              <span>Mã đơn hàng:</span>
              <strong style={{ color: 'var(--color-gold)' }}>TK-ORDER-{createdOrderId || '0000'}</strong>
            </div>
            <div className="detail-row">
              <span>Khách hàng:</span>
              <strong>{shippingInfo.name}</strong>
            </div>
            <div className="detail-row">
              <span>Số điện thoại:</span>
              <strong>{shippingInfo.phone}</strong>
            </div>
            <div className="detail-row">
              <span>Phương thức:</span>
              <strong style={{ textTransform: 'uppercase' }}>{paymentMethod}</strong>
            </div>
            <div className="detail-row">
              <span>Tổng thanh toán:</span>
              <strong>{grandTotal.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>

          <button className="gold-btn checkout-success-btn" onClick={onClose}>
            Tiếp Tục Mua Sắm
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="checkout-page-overlay">
      <div className="checkout-container">
        
        {/* Checkout Header */}
        <div className="checkout-header-row">
          <button className="checkout-back-link" onClick={onClose}>
            <ArrowLeft size={16} />
            <span>Trở về Giỏ hàng</span>
          </button>
          <div className="checkout-logo-wrapper">
            <img src="/images/the_k_luxury_logo_transparent.png" alt="The K Luxury" className="checkout-logo" />
          </div>
          <div></div>
        </div>

        {/* Main Columns Grid */}
        <div className="checkout-grid">
          
          {/* Left Column: Form Info */}
          <div className="checkout-form-column">
            <form onSubmit={handlePaymentSubmit}>
              
              {/* Shipping Section */}
              <div className="checkout-section-block">
                <div className="checkout-section-title">
                  <MapPin size={18} className="title-icon" />
                  <h3>Địa Chỉ Nhận Hàng Hoàng Gia</h3>
                </div>
                <div className="title-underline"></div>

                <div className="form-fields-grid">
                  <div className="checkout-input-group">
                    <label>Họ và Tên người nhận *</label>
                    <div className="input-with-icon">
                      <User size={14} className="field-icon" />
                      <input 
                        type="text" 
                        name="name" 
                        value={shippingInfo.name} 
                        onChange={handleInputChange} 
                        placeholder="Ví dụ: Nguyễn Văn A"
                        required 
                      />
                    </div>
                  </div>

                  <div className="checkout-input-group">
                    <label>Số điện thoại *</label>
                    <div className="input-with-icon">
                      <Phone size={14} className="field-icon" />
                      <input 
                        type="tel" 
                        name="phone" 
                        value={shippingInfo.phone} 
                        onChange={handleInputChange} 
                        placeholder="Ví dụ: 0901234567"
                        required 
                      />
                    </div>
                  </div>

                  <div className="checkout-input-group full-width">
                    <label>Địa chỉ nhận hàng (Số nhà, Tên đường, Phường/Xã...) *</label>
                    <div className="input-with-icon">
                      <MapPin size={14} className="field-icon" />
                      <input 
                        type="text" 
                        name="address" 
                        value={shippingInfo.address} 
                        onChange={handleInputChange} 
                        placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Thành, Quận 1"
                        required 
                      />
                    </div>
                  </div>

                  <div className="checkout-input-group">
                    <label>Tỉnh/Thành phố *</label>
                    <select name="city" value={shippingInfo.city} onChange={handleInputChange} required>
                      {provinces.length === 0 ? (
                        <option value={shippingInfo.city || ''}>{shippingInfo.city || 'Đang tải danh sách...'}</option>
                      ) : (
                        provinces.map(p => (
                          <option key={p.code} value={p.name}>
                            {p.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="checkout-input-group full-width">
                    <label>Ghi chú đơn hàng (Thời gian giao hàng thích hợp, chỉ dẫn...)</label>
                    <textarea 
                      name="notes" 
                      value={shippingInfo.notes} 
                      onChange={handleInputChange} 
                      placeholder="Ghi chú thêm cho người giao hàng..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="checkout-section-block" style={{ marginTop: '30px' }}>
                <div className="checkout-section-title">
                  <CreditCard size={18} className="title-icon" />
                  <h3>Phương Thức Thanh Toán</h3>
                </div>
                <div className="title-underline"></div>

                <div className="payment-method-selector-grid">
                  <div 
                    className={`payment-method-card ${paymentMethod === 'momo' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                    style={{ borderColor: paymentMethod === 'momo' ? '#a50064' : 'var(--color-border)' }}
                  >
                    <div className="method-logo-badge" style={{ backgroundColor: '#a50064' }}>
                      <Smartphone size={16} color="#ffffff" />
                    </div>
                    <span className="method-name">Ví MoMo</span>
                    <div className="method-check-circle" style={{ backgroundColor: paymentMethod === 'momo' ? '#a50064' : 'transparent' }}>
                      {paymentMethod === 'momo' && <Check size={10} color="#ffffff" />}
                    </div>
                  </div>

                  <div 
                    className={`payment-method-card ${paymentMethod === 'zalopay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('zalopay')}
                    style={{ borderColor: paymentMethod === 'zalopay' ? '#0070e0' : 'var(--color-border)' }}
                  >
                    <div className="method-logo-badge" style={{ backgroundColor: '#0070e0' }}>
                      <Smartphone size={16} color="#ffffff" />
                    </div>
                    <span className="method-name">ZaloPay</span>
                    <div className="method-check-circle" style={{ backgroundColor: paymentMethod === 'zalopay' ? '#0070e0' : 'transparent' }}>
                      {paymentMethod === 'zalopay' && <Check size={10} color="#ffffff" />}
                    </div>
                  </div>

                  <div 
                    className={`payment-method-card ${paymentMethod === 'vnpay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('vnpay')}
                    style={{ borderColor: paymentMethod === 'vnpay' ? '#005baa' : 'var(--color-border)' }}
                  >
                    <div className="method-logo-badge" style={{ backgroundColor: '#005baa' }}>
                      <Smartphone size={16} color="#ffffff" />
                    </div>
                    <span className="method-name">VNPAY QR</span>
                    <div className="method-check-circle" style={{ backgroundColor: paymentMethod === 'vnpay' ? '#005baa' : 'transparent' }}>
                      {paymentMethod === 'vnpay' && <Check size={10} color="#ffffff" />}
                    </div>
                  </div>

                  <div 
                    className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="method-logo-badge" style={{ backgroundColor: 'var(--color-black)' }}>
                      <CreditCard size={16} color="#ffffff" />
                    </div>
                    <span className="method-name">Thẻ Tín Dụng</span>
                    <div className="method-check-circle" style={{ backgroundColor: paymentMethod === 'card' ? 'var(--color-gold)' : 'transparent' }}>
                      {paymentMethod === 'card' && <Check size={10} color="#ffffff" />}
                    </div>
                  </div>

                  <div 
                    className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="method-logo-badge" style={{ backgroundColor: 'var(--color-text-muted)' }}>
                      <MapPin size={16} color="#ffffff" />
                    </div>
                    <span className="method-name">COD (Nhận hàng)</span>
                    <div className="method-check-circle" style={{ backgroundColor: paymentMethod === 'cod' ? 'var(--color-gold)' : 'transparent' }}>
                      {paymentMethod === 'cod' && <Check size={10} color="#ffffff" />}
                    </div>
                  </div>
                </div>

                {/* Card input nested fields */}
                {paymentMethod === 'card' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="card-details-fields"
                  >
                    <div className="checkout-input-group full-width">
                      <label>Số thẻ tín dụng</label>
                      <input 
                        type="text" 
                        name="number" 
                        value={cardInfo.number} 
                        onChange={handleCardChange} 
                        placeholder="0000 0000 0000 0000" 
                        maxLength="19" 
                      />
                    </div>
                    <div className="form-fields-grid" style={{ marginTop: '10px' }}>
                      <div className="checkout-input-group">
                        <label>Hạn sử dụng</label>
                        <input 
                          type="text" 
                          name="expiry" 
                          value={cardInfo.expiry} 
                          onChange={handleCardChange} 
                          placeholder="MM/YY" 
                          maxLength="5" 
                        />
                      </div>
                      <div className="checkout-input-group">
                        <label>CVC / CVV</label>
                        <input 
                          type="password" 
                          name="cvc" 
                          value={cardInfo.cvc} 
                          onChange={handleCardChange} 
                          placeholder="***" 
                          maxLength="3" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Submit trigger button wrapper */}
              <button 
                type="submit" 
                className="gold-btn checkout-submit-btn" 
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span>Đang Xác Thực Đơn Hàng...</span>
                ) : (
                  <span>Xác Nhận & Thanh Toán ({grandTotal.toLocaleString('vi-VN')} đ)</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Cart Item Summaries */}
          <div className="checkout-summary-column">
            <div className="summary-sticky-card">
              <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>
              <div className="title-underline"></div>

              <div className="summary-items-list">
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} className="summary-item-row">
                    <div className="summary-item-img-wrapper">
                      <img src={item.image_url} alt={item.title} className="summary-item-img" />
                      <span className="summary-item-qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item-details">
                      <h4>{item.title}</h4>
                      <span>Size: {item.selectedSize}</span>
                    </div>
                    <span className="summary-item-price">
                      {(parseFloat(item.price) * item.quantity).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-totals-block">
                <div className="totals-row">
                  <span>Tạm tính</span>
                  <span>{cartSubtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="totals-row">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + ' đ'}</span>
                </div>
                {shippingFee === 0 && (
                  <div className="premium-shipping-note">
                    <ShieldCheck size={12} style={{ color: '#d1a852', marginRight: '6px' }} />
                    Bạn được ưu đãi Miễn phí vận chuyển (Trị giá đơn &gt; 30 triệu)
                  </div>
                )}
                
                <div className="divider-totals"></div>
                <div className="totals-row grand-total">
                  <span>Tổng thanh toán</span>
                  <span>{grandTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic QR code payment modal for e-wallets */}
      <AnimatePresence>
        {showQRModal && (
          <div className="qr-modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="qr-modal-card"
            >
              <div className="qr-modal-header" style={{ borderBottomColor: wallet.color }}>
                <span className="wallet-brand-name" style={{ color: wallet.color }}>
                  Thanh Toán Bằng {wallet.name}
                </span>
                <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>&times;</button>
              </div>

              <div className="qr-modal-body">
                <div className="timer-countdown-box">
                  <Clock size={14} style={{ marginRight: '6px' }} />
                  <span>Hết hạn trong: <strong style={{ color: '#c93b3b' }}>{formatTime(timeLeft)}</strong></span>
                </div>

                <p className="qr-instructions-text">{wallet.instructions}</p>

                <div className="qr-frame-wrapper" style={{ borderColor: wallet.color }}>
                  <img src={wallet.qrPlaceholder} alt="Payment QR Code" className="payment-qr-img" />
                </div>

                <div className="qr-amount-display">
                  <span className="amount-label">Số tiền cần thanh toán</span>
                  <span className="amount-val" style={{ color: wallet.color }}>{grandTotal.toLocaleString('vi-VN')} đ</span>
                </div>

                <button 
                  className="gold-btn qr-confirm-btn" 
                  onClick={handleConfirmQR}
                  style={{ backgroundColor: wallet.color, borderColor: wallet.color }}
                >
                  Xác Nhận Đã Chuyển Tiền
                </button>

                <p className="qr-footer-note">
                  Sau khi bạn chuyển tiền thành công, hệ thống kiểm tra AI sẽ tự động xác minh đơn hàng trong vòng 2 giây.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verification overlay */}
      <AnimatePresence>
        {isVerifying && (
          <div className="verifying-payment-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="verifying-card"
            >
              <div className="luxury-spinner"></div>
              <h3>Đang Xác Thực Thanh Toán...</h3>
              <p>Mã hóa bảo mật đang đồng bộ tài khoản với các cổng ví điện tử...</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CheckoutPage;
