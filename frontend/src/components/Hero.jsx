import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

function Hero() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const textVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="aura-hero-section">
      {/* Background Sparkles / Particles */}
      <div className="hero-sparkles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="hero-sparkle-dot"
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${Math.random() * 0.8 + 0.2})`
            }}
          />
        ))}
      </div>

      <div className="container hero-inner-grid">
        {/* Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hero-left-col"
        >
          <motion.div variants={textVariants} className="hero-collection-tag">
            <Sparkles size={10} className="gold-sparkle" />
            <span>EXQUISITE EDITORIAL</span>
          </motion.div>
          <motion.h1 variants={textVariants} className="hero-main-title">
            THE NOCTURNAL<br />COLLECTION
          </motion.h1>
          <motion.p variants={textVariants} className="hero-main-desc">
            Explore the allure of Parisian night
          </motion.p>
          <motion.button
            variants={textVariants}
            className="hero-explore-btn"
            onClick={() => {
              const el = document.getElementById('shop-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>DISCOVER NOW</span>
            <ArrowRight size={12} />
          </motion.button>
        </motion.div>

        {/* Center: Model on Glowing Platform */}
        <div className="hero-center-col">
          <div className="platform-container">
            {/* Glowing square platform */}
            <div className="glowing-platform-base"></div>
            <div className="glowing-platform-light"></div>
            
            {/* Model image */}
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              src="/images/aura_hero_model.png"
              alt="Nocturnal Collection Model"
              className="hero-model-img"
            />
          </div>

          {/* Bottom Previews Row */}
          <div className="hero-bottom-previews">
            {[
              "/images/aura_sac_noir.png",
              "/images/aura_hero_model.png",
              "/images/aura_nocturnal_clutch.png",
              "/images/aura_aurora_pumps.png"
            ].map((img, idx) => (
              <div key={idx} className="preview-mini-card">
                <img src={img} alt={`Preview ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Content: Overlapping Cards */}
        <div className="hero-right-col">
          {/* Card 1: Le Sac Noir */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="hero-overlay-card card-sac-noir"
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
          >
            <img src="/images/aura_sac_noir.png" alt="Le Sac Noir" className="card-item-img" />
            <div className="card-item-info">
              <span className="card-item-title">LE SAC NOIR</span>
            </div>
          </motion.div>

          {/* Curved Draw Arrow SVG */}
          <svg className="curved-arrow-svg" width="60" height="60" viewBox="0 0 60 60" fill="none">
            <path
              d="M10,10 Q35,5 45,35 M45,35 L40,28 M45,35 L38,36"
              stroke="#bda380"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Card 2: Luna Earrings */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="hero-overlay-card card-luna-earrings"
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
          >
            <img src="/images/aura_luna_earrings.png" alt="Luna Earrings" className="card-item-img" />
            <div className="card-item-info">
              <span className="card-item-title">LUNA EARRINGS</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
