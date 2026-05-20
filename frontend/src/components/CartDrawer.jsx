import { motion } from 'framer-motion';
import { ShoppingBag, Trash } from 'lucide-react';

function CartDrawer({ isCartOpen, onClose, cart, cartItemCount, cartSubtotal, onUpdateQuantity, onRemoveFromCart }) {
  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay-wrapper">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="cart-overlay" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="cart-drawer"
      >
        <div className="cart-header">
          <h2>Giỏ Hàng ({cartItemCount})</h2>
          <button className="close-cart-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <ShoppingBag size={48} color="#e0d7c3" style={{ marginBottom: '20px' }} />
              <p>Giỏ hàng của bạn đang trống.</p>
              <button className="gold-btn btn-small" onClick={onClose}>Tiếp Tục Mua Sắm</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} className="cart-item">
                <img src={item.image_url} alt={item.title} className="cart-item-img" />
                <div className="cart-item-details">
                  <div className="cart-item-header">
                    <h4>{item.title}</h4>
                    <span className="cart-item-size">Size: {item.selectedSize}</span>
                  </div>
                  <p className="cart-item-price">{parseFloat(item.price).toLocaleString('vi-VN')} đ</p>
                  <div className="cart-item-actions">
                    <div className="quantity-selector">
                      <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}>-</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-item-btn" onClick={() => onRemoveFromCart(item.id, item.selectedSize)}>
                      <Trash size={12} className="inline-icon" style={{ marginRight: '4px' }} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Tổng cộng:</span>
              <span>{cartSubtotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <button className="checkout-btn" onClick={() => alert("Chức năng thanh toán đang được tích hợp.")}>Tiến Hành Thanh Toán</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default CartDrawer;
