import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Key } from 'lucide-react';
import { forgotPassword, resetPassword, loginUser, registerUser } from '../services/api';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 'none': standard login/register, 'email': entering email for OTP, 'otp': entering OTP + new password
  const [forgotState, setForgotState] = useState('none');
  const [otp, setOtp] = useState('');

  // 2FA state
  const [require2FA, setRequire2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (forgotState === 'email') {
      if (!email) {
        setError('Vui lòng điền địa chỉ email.');
        return;
      }
      setIsLoading(true);
      try {
        const response = await forgotPassword(email);
        setIsLoading(false);
        setMessage(response.data.message || 'Mã OTP đã được gửi thành công.');
        setForgotState('otp');
      } catch (err) {
        setIsLoading(false);
        setError(err.response?.data?.error || 'Không thể yêu cầu mã OTP. Vui lòng thử lại.');
      }
      return;
    }

    if (forgotState === 'otp') {
      if (!otp || !password || !confirmPassword) {
        setError('Vui lòng điền đầy đủ các trường thông tin.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không trùng khớp.');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu mới phải chứa ít nhất 6 ký tự.');
        return;
      }
      setIsLoading(true);
      try {
        const response = await resetPassword(email, otp, password);
        setIsLoading(false);
        alert(response.data.message || 'Thay đổi mật khẩu thành công!');
        resetForm();
        setIsLogin(true);
      } catch (err) {
        setIsLoading(false);
        setError(err.response?.data?.error || 'Xác thực OTP thất bại. Vui lòng thử lại.');
      }
      return;
    }

    // Luồng đăng nhập / đăng ký thực tế
    if (require2FA) {
      if (!twoFactorCode) {
        setError('Vui lòng nhập mã xác thực 2FA.');
        return;
      }
      if (twoFactorCode.length !== 6) {
        setError('Mã xác thực 2FA phải gồm 6 chữ số.');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
        return;
      }
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
      setIsLoading(true);
      try {
        const response = await registerUser(name, email, password);
        setIsLoading(false);
        alert(response.data.message || 'Đăng ký tài khoản thành viên thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setIsLoading(false);
        setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } else {
      setIsLoading(true);
      try {
        const response = await loginUser(email, password, require2FA ? twoFactorCode : undefined);
        setIsLoading(false);

        if (response.data.require_2fa) {
          setRequire2FA(true);
          setError('');
          setMessage('Tài khoản của bạn đã được kích hoạt xác thực 2 lớp. Vui lòng nhập mã bảo mật 6 số được gửi đến email đăng ký của bạn.');
          return;
        }

        const userData = {
          email: response.data.email,
          name: response.data.name,
          token: response.data.token,
          is_superuser: response.data.is_superuser,
          is_staff: response.data.is_staff,
        };
        onAuthSuccess(userData);
        onClose();
        resetForm();
      } catch (err) {
        setIsLoading(false);
        setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setError('');
    setMessage('');
    setForgotState('none');
    setRequire2FA(false);
    setTwoFactorCode('');
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
              {require2FA && 'Nhập mã xác thực bảo mật 2FA'}
              {!require2FA && forgotState === 'email' && 'Khôi phục mật khẩu hội viên'}
              {!require2FA && forgotState === 'otp' && 'Nhập mã xác thực OTP'}
              {!require2FA && forgotState === 'none' && (isLogin ? 'Đăng nhập vào đặc quyền hội viên' : 'Trở thành hội viên thượng lưu')}
            </p>
          </div>

          {error && <div className="auth-error-message">{error}</div>}
          {message && (
            <div 
              className="auth-success-message" 
              style={{ 
                color: '#bda380', 
                fontSize: '12px', 
                textAlign: 'center', 
                marginBottom: '15px', 
                fontWeight: '500' 
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {require2FA ? (
              <div className="auth-input-group">
                <label className="auth-input-label">Mã xác thực bảo mật 2FA (6 chữ số)</label>
                <div className="auth-input-wrapper">
                  <Key size={16} className="auth-input-icon" />
                  <input 
                    type="text" 
                    placeholder="000000" 
                    maxLength={6}
                    value={twoFactorCode} 
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="auth-input"
                    style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}
                    required
                    autoFocus
                  />
                </div>
                <div style={{ marginTop: '10px', fontSize: '11px', textAlign: 'left' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Không nhận được mã? </span>
                  <button 
                    type="button" 
                    onClick={async () => {
                      setError('');
                      setMessage('');
                      setIsLoading(true);
                      try {
                        await loginUser(email, password);
                        setIsLoading(false);
                        setMessage('Mã xác thực mới đã được gửi thành công đến email của bạn.');
                      } catch (err) {
                        setIsLoading(false);
                        setError(err.response?.data?.error || 'Không thể gửi lại mã xác thực. Vui lòng thử lại.');
                      }
                    }} 
                    disabled={isLoading}
                    style={{ background: 'none', border: 'none', color: 'var(--color-gold)', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Gửi lại mã
                  </button>
                </div>
              </div>
            ) : (
              <>
                {forgotState === 'email' && (
                  <div className="auth-input-group">
                    <label className="auth-input-label">Địa chỉ Email của bạn</label>
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
                )}

                {forgotState === 'otp' && (
                  <>
                    <div className="auth-input-group">
                      <label className="auth-input-label">Mã xác thực OTP (6 chữ số)</label>
                      <div className="auth-input-wrapper">
                        <Key size={16} className="auth-input-icon" />
                        <input 
                          type="text" 
                          placeholder="123456" 
                          maxLength={6}
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value)}
                          className="auth-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-input-label">Mật khẩu mới</label>
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

                    <div className="auth-input-group">
                      <label className="auth-input-label">Xác nhận mật khẩu mới</label>
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
                    </div>
                  </>
                )}

                {forgotState === 'none' && (
                  <>
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
                        <a href="#forgot" onClick={(e) => { e.preventDefault(); setForgotState('email'); }}>
                          Quên mật khẩu?
                        </a>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Đang Xử Lý...' : (
                require2FA ? 'Xác Nhận & Đăng Nhập' :
                forgotState === 'email' ? 'Gửi Mã OTP' : 
                forgotState === 'otp' ? 'Xác Nhận & Đổi Mật Khẩu' : 
                (isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản')
              )}
            </button>
          </form>

          {require2FA || forgotState !== 'none' ? (
            <div className="auth-switch-mode" style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => { resetForm(); }}
                className="auth-toggle-link"
              >
                Quay lại Đăng nhập
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default AuthModal;
