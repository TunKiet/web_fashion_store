import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';

function Hero() {
  return (
    <section className="hero-section">
      <motion.img 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.65 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src="/images/fashion_hero.png" 
        alt="The K Luxury Editorial Banner" 
        className="hero-bg-img"
      />
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hero-subtitle"
          >
            <Sparkles size={12} className="inline-icon" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            The K Luxury — BST Thu/Đông 2026
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hero-title"
          >
            Sự Sang Trọng <br />Vượt Thời Gian.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="hero-desc"
          >
            Khám phá bộ sưu tập giới hạn được chế tác thủ công tinh xảo bởi các nghệ nhân từ chất liệu thượng hạng bậc nhất: lụa tơ tằm dâu, cashmere hai mặt tự nhiên và da bê nguyên tấm siêu mềm mịn.
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="gold-btn" 
            onClick={() => {
              const el = document.getElementById('shop-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Xem Lookbook <ArrowDown size={12} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
