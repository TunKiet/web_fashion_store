import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';

function ProductCard({ product, onOpenDetails, onAddToCart, isFavorite, onToggleFavorite }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="product-card"
      onClick={() => onOpenDetails(product)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-image-sec">
        <img src={product.image_url} alt={product.title} className="product-img" />
        
        <button 
          className="fav-btn-badge"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          aria-label="Yêu thích"
        >
          <Heart size={16} fill={isFavorite ? "#d1a852" : "none"} color={isFavorite ? "#d1a852" : "#ffffff"} />
        </button>

        <button 
          className="quick-add-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <ShoppingBag size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Thêm Nhanh
        </button>
      </div>
      <div className="product-info-sec">
        <span className="product-cat">{product.category}</span>
        <h3 className="product-name">{product.title}</h3>
        <span className="product-price">{parseFloat(product.price).toLocaleString('vi-VN')} đ</span>
      </div>
    </motion.div>
  );
}

export default ProductCard;
