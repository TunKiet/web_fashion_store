import { useState } from 'react';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';

function Atelier() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="aura-atelier-section" id="atelier-section">
      <div className="container">
        <div className="atelier-header">
          <h2 className="atelier-title">THE ATELIER</h2>
          <p className="atelier-subtitle">Craftsmanship</p>
        </div>

        <div className="atelier-grid-layout">
          {/* Top Swatches Row: 4 Swatches */}
          <div className="atelier-top-row-swatches">
            <div className="fabric-swatch-card-square">
              <img src="/images/aura_fabric_3.png" alt="Crimson Velvet Swatch" />
              <span className="swatch-label">Crimson Velvet</span>
            </div>
            <div className="fabric-swatch-card-square">
              <img src="/images/aura_fabric_1.png" alt="Guipure Lace Swatch" />
              <span className="swatch-label">Guipure Lace</span>
            </div>
            <div className="fabric-swatch-card-square">
              <img src="/images/aura_fabric_3.png" alt="Haute Lace Swatch" />
              <span className="swatch-label">Haute Lace</span>
            </div>
            <div className="fabric-swatch-card-square">
              <img src="/images/aura_fabric_4.png" alt="Handcrafted Silk Swatch" />
              <span className="swatch-label">Handcrafted Silk</span>
            </div>
          </div>

          {/* Bottom Grid: 2 Swatches on Left, Video Player on Right */}
          <div className="atelier-bottom-grid">
            <div className="atelier-bottom-left-swatches">
              <div className="fabric-swatch-card-square">
                <img src="/images/aura_fabric_4.png" alt="Alençon Lace Swatch" />
                <span className="swatch-label">Alençon Lace</span>
              </div>
              <div className="fabric-swatch-card-square">
                <img src="/images/aura_fabric_2.png" alt="Satin Silk Swirl" />
                <span className="swatch-label">Satin Silk Swirl</span>
              </div>
            </div>

            {/* Video Player */}
            <div className="atelier-video-player-container">
              <div className="video-viewport">
                <img 
                  src="/images/aura_craftsman_working.png" 
                  alt="Craftsman Hand-sewing Leather" 
                  className={`video-thumbnail-img ${isPlaying ? 'video-playing-zoom' : ''}`}
                />
                
                {/* Dark Overlay */}
                <div className="video-player-overlay"></div>

                {/* Play / Pause Toggle Center Button */}
                <button 
                  className={`video-play-center-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <Pause size={24} fill="#0d0d0d" color="#0d0d0d" /> : <Play size={24} fill="#0d0d0d" color="#0d0d0d" style={{ marginLeft: '4px' }} />}
                </button>

                {/* Video Custom Mock Control Bar */}
                <div className="video-controls-bar">
                  <button className="control-btn mini-play-pause" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </button>

                  <span className="time-display">0:06 / 1:04</span>

                  {/* Progress bar timeline */}
                  <div className="timeline-track">
                    <div className="timeline-progress-fill" style={{ width: isPlaying ? '35%' : '10%' }}></div>
                    <div className="timeline-handle" style={{ left: isPlaying ? '35%' : '10%' }}></div>
                  </div>

                  <button className="control-btn" aria-label="Mute / Unmute">
                    <Volume2 size={14} />
                  </button>
                  <button className="control-btn" aria-label="Fullscreen">
                    <Maximize size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Story Button */}
        <div className="atelier-footer-action">
          <button 
            className="our-story-btn"
            onClick={() => {
              alert("Chào mừng quý khách đến với AURA PARIS. Mỗi mẫu thiết kế của chúng tôi đều kể về một hành trình độc bản của sự may đo thủ công tinh xảo, bắt đầu từ những thước vải thượng hạng nhất tại Kinh đô Ánh sáng.");
            }}
          >
            OUR STORY
          </button>
        </div>
      </div>
    </section>
  );
}

export default Atelier;
