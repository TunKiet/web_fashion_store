import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyMomoPayment } from '../services/api';

function PaymentResult({ momoParams, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!momoParams) {
      setError("Không tìm thấy thông tin giao dịch thanh toán.");
      setLoading(false);
      return;
    }

    verifyMomoPayment(momoParams)
      .then(res => {
        setOrderData(res.data);
        const resultCode = parseInt(momoParams.resultCode);
        if (resultCode !== 0) {
          setError(momoParams.message || "Giao dịch không thành công hoặc đã bị hủy.");
        }
      })
      .catch(err => {
        console.error("Verification error:", err);
        setError(err.response?.data?.error || "Không thể xác thực giao dịch này với máy chủ.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [momoParams]);

  if (loading) {
    return (
      <div className="checkout-success-view" style={{ background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <Loader2 className="luxury-spinner" style={{ animation: 'spinProfile 1s linear infinite', margin: '0 auto 20px auto', width: '50px', height: '50px', color: '#d1a852' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, letterSpacing: '2px' }}>ĐANG XÁC THỰC GIAO DỊCH MOMO</h2>
          <p style={{ color: '#888', marginTop: '10px', fontSize: '14px' }}>Hệ thống bảo mật đang đồng bộ chữ ký số với cổng thanh toán...</p>
        </div>
      </div>
    );
  }

  const isSuccess = !error && momoParams && parseInt(momoParams.resultCode) === 0;

  return (
    <div className="checkout-success-view" style={{ background: '#0a0a0a', padding: '80px 20px' }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="success-message-card"
        style={{ background: '#111', borderColor: 'rgba(189, 163, 128, 0.25)', maxWidth: '550px', color: '#fff' }}
      >
        {isSuccess ? (
          <>
            <div className="success-icon-gold" style={{ color: '#d1a852', marginBottom: '20px' }}>
              <CheckCircle size={64} />
            </div>
            <h2 className="success-title" style={{ color: '#fff', fontSize: '24px', letterSpacing: '1px' }}>Thanh Toán Thành Công</h2>
            <p className="success-subtitle" style={{ color: '#aaa', margin: '15px 0 25px 0', lineHeight: 1.6 }}>
              Cảm ơn bạn! Đơn hàng của bạn đã được thanh toán trực tuyến qua **Ví MoMo** thành công.
            </p>

            <div className="success-order-details" style={{ background: '#181818', borderColor: 'rgba(189, 163, 128, 0.15)', color: '#eee' }}>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Mã đơn hàng:</span>
                <strong style={{ color: '#d1a852' }}>TK-ORDER-{orderData?.id || 'N/A'}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Mã giao dịch MoMo:</span>
                <strong>{momoParams.transId || 'N/A'}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Khách hàng nhận:</span>
                <strong>{orderData?.name || 'N/A'}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Số điện thoại:</span>
                <strong>{orderData?.phone || 'N/A'}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Số tiền thanh toán:</span>
                <strong>{parseInt(momoParams.amount).toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="error-icon" style={{ color: '#e74c3c', marginBottom: '20px' }}>
              <XCircle size={64} />
            </div>
            <h2 className="success-title" style={{ color: '#fff', fontSize: '24px', letterSpacing: '1px' }}>Thanh Toán Thất Bại</h2>
            <p className="success-subtitle" style={{ color: '#aaa', margin: '15px 0 25px 0', lineHeight: 1.6 }}>
              Giao dịch thanh toán qua MoMo không hoàn thành. Đơn hàng của bạn đã tự động chuyển sang trạng thái bị hủy để bảo toàn giỏ hàng.
            </p>

            <div className="success-order-details" style={{ background: '#181818', borderColor: 'rgba(231, 76, 60, 0.2)', color: '#eee' }}>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Mã đơn hàng:</span>
                <strong style={{ color: '#e74c3c' }}>TK-ORDER-{orderData?.id || momoParams.orderId?.split('_')?.[2] || 'N/A'}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Chi tiết lỗi:</span>
                <strong style={{ color: '#e74c3c' }}>{error || 'Giao dịch bị từ chối hoặc người dùng hủy.'}</strong>
              </div>
              <div className="detail-row" style={{ padding: '8px 0' }}>
                <span style={{ color: '#888' }}>Số tiền hoàn trả kho:</span>
                <strong>{parseInt(momoParams.amount || 0).toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          </>
        )}

        <button className="gold-btn checkout-success-btn" onClick={onClose} style={{ marginTop: '30px' }}>
          {isSuccess ? 'Tiếp Tục Mua Sắm' : 'Trở Về Trang Chủ'}
        </button>
      </motion.div>
    </div>
  );
}

export default PaymentResult;
