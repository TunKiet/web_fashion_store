import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Collections() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="aura-collections-section" id="collections-section">
      <div className="container">
        <h2 className="collections-main-title">COLLECTIONS</h2>

        <div className="collections-grid">
          {/* Card 1: Nocturnal Clutch */}
          <div className="collection-card-large clutch-card">
            <div className="card-image-wrapper">
              <img 
                src="/images/aura_nocturnal_clutch.png" 
                alt="The Nocturnal Clutch" 
                className="collection-img"
              />
              
              {/* Slider Arrow Controls */}
              <button className="carousel-arrow arrow-left" aria-label="Previous image">
                <ChevronLeft size={20} />
              </button>
              <button className="carousel-arrow arrow-right" aria-label="Next image">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="card-details">
              <h3 className="card-title">THE NOCTURNAL CLUTCH</h3>
              <p className="card-subtitle">Image-mapped and detailed</p>
            </div>
          </div>

          {/* Card 2: Aurora Pumps */}
          <div className="collection-card-large pumps-card">
            <div className="card-image-wrapper">
              <img 
                src="/images/aura_aurora_pumps.png" 
                alt="The Aurora Pumps" 
                className="collection-img"
              />
            </div>

            <div className="card-details overlay-details">
              <h3 className="card-title">THE AURORA PUMPS</h3>
              <p className="card-description">
                Được chế tác thủ công tinh xảo tại xưởng Haute Couture Paris, đôi giày cao gót độc bản thể hiện sự hòa quyện hoàn hảo giữa phom dáng thanh thoát kiêu kỳ và chất da cá sấu vân nổi sang quý bậc nhất.
              </p>
              <button 
                className="card-explore-btn"
                onClick={() => {
                  const el = document.getElementById('shop-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                EXPLORE
              </button>
            </div>
          </div>
        </div>

        {/* Indicator dots/dashes */}
        <div className="collections-slider-indicator">
          <span className={`indicator-dash ${activeIndex === 0 ? 'active' : ''}`} onClick={() => setActiveIndex(0)}></span>
          <span className={`indicator-dash ${activeIndex === 1 ? 'active' : ''}`} onClick={() => setActiveIndex(1)}></span>
        </div>
      </div>
    </section>
  );
}

export default Collections;
