import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Bắt đầu validate dữ liệu đầu vào
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    if (!isLogin) {
      if (!name) {
        setError('Vui lòng nhập Họ và Tên của bạn.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp.');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
        return;
      }
    }

    setIsLoading(true);

    // Mô phỏng kết nối mạng để xác thực khách hàng (Authentication Mock)
    setTimeout(() => {
      setIsLoading(false);
      if (isLogin) {
        // Mock đăng nhập thành công
        const mockUserData = {
          email,
          name: email.split('@')[0].toUpperCase(),
          token: 'mock-jwt-token-the-k-luxury',
        };
        onAuthSuccess(mockUserData);
        onClose();
        // Reset form
        resetForm();
      } else {
        // Mock đăng ký thành công và tự động chuyển sang trang Đăng nhập
        alert('Đăng ký tài khoản thành viên thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    }, 1200);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

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
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -15 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="auth-modal-content"
        >
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
          
          <div className="auth-header">
            <h2 className="auth-brand">The K Luxury</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Đăng nhập vào đặc quyền hội viên' : 'Trở thành hội viên thượng lưu'}
            </p>
          </div>

          {error && <div className="auth-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="auth-input-group"
                >
                  <label className="auth-input-label">Họ và Tên</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn A" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="auth-input-group">
              <label className="auth-input-label">Địa chỉ Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="auth-input-group"
                >
                  <label className="auth-input-label">Xác nhận Mật khẩu</label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="auth-input"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="auth-forgot-password">
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Chức năng khôi phục mật khẩu sẽ sớm được kích hoạt qua Email của bạn.'); }}>
                  Quên mật khẩu?
                </a>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang Xử Lý...' : (isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản')}
            </button>
          </form>

          <div className="auth-divider">
            <span>hoặc</span>
          </div>

          <div className="auth-switch-mode">
            {isLogin ? (
              <p>Chưa có tài khoản hội viên? <button type="button" onClick={toggleAuthMode} className="auth-toggle-link">Đăng ký ngay</button></p>
            ) : (
              <p>Đã có tài khoản thành viên? <button type="button" onClick={toggleAuthMode} className="auth-toggle-link">Đăng nhập</button></p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AuthModal;
