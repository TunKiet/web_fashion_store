import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

function ConfirmModal({ isOpen, onClose, onConfirm, onCancel, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-wrapper" style={{ pointerEvents: 'auto' }}>
      <div className="modal-overlay" onClick={onCancel} />
      <div className="modal-holder" style={{ maxWidth: '440px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="auth-modal-content"
          style={{ 
            padding: '40px 30px', 
            textAlign: 'center',
            background: 'var(--color-white)',
            border: '1px solid var(--color-gold)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            position: 'relative'
          }}
        >
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(189, 163, 128, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-gold)'
            }}>
              <HelpCircle size={32} />
            </div>
          </div>

          <h3 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1.4rem', 
            fontWeight: '300', 
            color: 'var(--color-black)', 
            marginBottom: '15px',
            lineHeight: '1.4'
          }}>
            Xác nhận thanh toán
          </h3>

          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--color-text-muted)', 
            lineHeight: '1.6', 
            marginBottom: '30px' 
          }}>
            {message}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="gold-btn" 
              onClick={onConfirm}
              style={{ width: '100%', padding: '14px 0', border: '1px solid var(--color-gold)', cursor: 'pointer' }}
            >
              Thanh Toán Ngay
            </button>
            <button 
              onClick={onCancel}
              style={{ 
                width: '100%', 
                padding: '14px 0', 
                backgroundColor: 'transparent', 
                border: '1px solid var(--color-border)', 
                color: 'var(--color-black)',
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                transition: 'var(--transition-fast)',
                cursor: 'pointer'
              }}
              className="confirm-modal-cancel-btn"
            >
              Đăng xuất & Xóa giỏ hàng
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ConfirmModal;
