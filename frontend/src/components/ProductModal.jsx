import { motion } from 'framer-motion';

function ProductModal({ product, onClose, onAddToCart, selectedSize, setSelectedSize }) {
  if (!product) return null;

  return (
    <div className="modal-overlay-wrapper">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay" 
        onClick={onClose} 
      />
      <div className="modal-holder">
        <motion.div 
          initial={{ opacity: 0, scale: 0.92, rotateX: 2 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.92, rotateX: -2 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="modal-content-wrapper"
        >
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
          
          <div className="modal-image-side">
            <img src={product.image_url} alt={product.title} />
          </div>
          
          <div className="modal-info-side">
            <span className="modal-category">{product.category}</span>
            <h2 className="modal-title">{product.title}</h2>
            <p className="modal-price">{parseFloat(product.price).toLocaleString('vi-VN')} đ</p>
            
            <div className="modal-divider"></div>
            
            <h3 className="section-mini-title">Mô Tả Sản Phẩm</h3>
            <p className="modal-desc">{product.description}</p>
            
            <div className="modal-divider"></div>
            
            <div className="size-selector-section">
              <h3 className="section-mini-title">Chọn Kích Cỡ</h3>
              <div className="size-options">
                {['S', 'M', 'L'].map(size => (
                  <button
                    key={size}
                    className={`size-option-btn ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="modal-add-to-cart-btn"
              onClick={() => {
                onAddToCart(product, selectedSize);
              }}
            >
              Thêm Vào Giỏ Hàng
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ProductModal;
