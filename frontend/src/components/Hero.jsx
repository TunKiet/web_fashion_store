import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';

function Hero() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-bg-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
        <motion.img 
          initial={{ scale: 1.15, x: 0, y: 0, opacity: 0 }}
          animate={{ 
            scale: [1.15, 1.05, 1.12],
            x: [0, -15, 10],
            y: [0, -5, -10],
            opacity: 0.55
          }}
          transition={{ 
            opacity: { duration: 2.2, ease: "easeOut" },
            scale: { duration: 28, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
            x: { duration: 28, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
            y: { duration: 28, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }
          }}
          src="/images/fashion_hero.png" 
          alt="The K Luxury Editorial Banner" 
          className="hero-bg-img"
        />
      </div>
      
      <div className="hero-overlay"></div>
      <div className="container" style={{ position: 'relative', zIndex: 3 }}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hero-content"
        >
          <div style={{ overflow: 'hidden', paddingBottom: '4px' }}>
            <motion.div variants={itemVariants} className="hero-subtitle">
              <Sparkles size={11} className="inline-icon" style={{ marginRight: '6px', verticalAlign: 'middle', marginTop: '-3px' }} />
              The K Luxury — BST Thu/Đông 2026
            </motion.div>
          </div>
          
          <div style={{ overflow: 'hidden', paddingBottom: '6px' }}>
            <motion.h1 
              variants={itemVariants}
              className="hero-title"
            >
              Sự Sang Trọng <br />Vượt Thời Gian.
            </motion.h1>
          </div>

          <div style={{ overflow: 'hidden', paddingBottom: '6px' }}>
            <motion.p 
              variants={itemVariants}
              className="hero-desc"
            >
              Khám phá bộ sưu tập giới hạn được chế tác thủ công tinh xảo bởi các nghệ nhân từ chất liệu thượng hạng bậc nhất: lụa tơ tằm dâu, cashmere hai mặt tự nhiên và da bê nguyên tấm siêu mềm mịn.
            </motion.p>
          </div>

          <div style={{ overflow: 'hidden', paddingTop: '4px' }}>
            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.03, letterSpacing: '3px' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="gold-btn" 
              onClick={() => {
                const el = document.getElementById('shop-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Xem Lookbook <ArrowDown size={12} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
