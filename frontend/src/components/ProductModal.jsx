import { motion } from 'framer-motion';

function ProductModal({ product, onClose, onAddToCart, selectedSize, setSelectedSize, onNext, onPrev }) {
  if (!product) return null;

  return (
    <div className="modal-overlay-wrapper">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="modal-overlay" 
        onClick={onClose} 
      />
      <div className="modal-holder">
        {/* Nút Trước (Previous Product) */}
        <button 
          className="modal-nav-btn prev-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }} 
          aria-label="Sản phẩm trước"
        >
          &#10094;
        </button>

        <motion.div 
          key={product.id}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="modal-content-wrapper"
        >
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
          
          <div className="modal-image-side">
            <img src={product.image_url} alt={product.title} className="modal-product-img" />
          </div>
          
          <div className="modal-info-side">
            <span className="modal-cat">{product.category}</span>
            <h2 className="modal-title">{product.title}</h2>
            <p className="modal-price-display">{parseFloat(product.price).toLocaleString('vi-VN')} đ</p>
            
            <div className="modal-divider"></div>
            
            <h3 className="size-header">Mô Tả Sản Phẩm</h3>
            <p className="modal-desc">{product.description || "Dòng sản phẩm thiết kế độc bản thuộc bộ sưu tập The K Luxury."}</p>
            
            <div className="modal-divider"></div>
            
            <div className="modal-size-selector">
              <h3 className="size-header">Chọn Kích Cỡ</h3>
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

        {/* Nút Sau (Next Product) */}
        <button 
          className="modal-nav-btn next-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }} 
          aria-label="Sản phẩm tiếp theo"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
}

export default ProductModal;
