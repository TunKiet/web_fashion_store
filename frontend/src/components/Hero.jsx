import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import * as THREE from 'three';

function Hero() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 30;

    // 2. WebGL Renderer with Alpha transparent background
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Create a circular particle texture programmatically
    const createCircleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(8, 8, 8, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    };

    // 4. Geometry and Particles creation
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Rải đều hạt trong không gian 3D
      positions[i] = (Math.random() - 0.5) * 80;     // X
      positions[i + 1] = (Math.random() - 0.5) * 40; // Y
      positions[i + 2] = (Math.random() - 0.5) * 50; // Z

      // Vận tốc chuyển động ngẫu nhiên siêu nhỏ để tạo cảm giác bay lơ lửng
      velocities[i] = (Math.random() - 0.5) * 0.015;
      velocities[i + 1] = (Math.random() - 0.5) * 0.015;
      velocities[i + 2] = (Math.random() - 0.5) * 0.015;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 5. Gold Points Material
    const material = new THREE.PointsMaterial({
      color: 0xd1a852, // Màu vàng kim đặc trưng của The K Luxury
      size: 0.38,
      transparent: true,
      opacity: 0.8,
      map: createCircleTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // 6. Mesh Points
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 7. Event Listeners
    const handleMouseMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      // Chuẩn hóa vị trí chuột từ -1 đến 1
      mouseRef.current.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.targetY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Nội suy mượt chuyển động chuột để giảm sốc
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Xoay nhẹ khối hạt theo thời gian
      points.rotation.y += 0.0006;
      points.rotation.x += 0.0003;

      // Hiệu ứng dịch chuyển camera nhẹ theo vị trí chuột (Parallax)
      points.position.x = mouseRef.current.x * 3.5;
      points.position.y = mouseRef.current.y * 2.0;

      // Cập nhật vị trí hạt bay lơ lửng
      const posAttr = geometry.attributes.position;
      const posArray = posAttr.array;

      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] += velocities[i];
        posArray[i + 1] += velocities[i + 1];
        posArray[i + 2] += velocities[i + 2];

        // Đảo chiều vận tốc nếu hạt bay ra xa vùng giới hạn
        if (Math.abs(posArray[i]) > 40) velocities[i] *= -1;
        if (Math.abs(posArray[i + 1]) > 20) velocities[i + 1] *= -1;
        if (Math.abs(posArray[i + 2]) > 25) velocities[i + 2] *= -1;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup Memory on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, []);

  return (
    <section className="hero-section">
      <motion.img 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.55 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        src="/images/fashion_hero.png" 
        alt="The K Luxury Editorial Banner" 
        className="hero-bg-img"
      />
      
      {/* Three.js 3D WebGL Canvas Background */}
      <canvas ref={canvasRef} className="hero-3d-canvas" />

      <div className="hero-overlay"></div>
      <div className="container" style={{ position: 'relative', zIndex: 3 }}>
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
