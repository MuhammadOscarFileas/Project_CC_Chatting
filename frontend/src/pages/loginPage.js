import { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils';
import useAuth from '../auth/useAuth';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const info = searchParams.get("info");
  const navigate = useNavigate();
  const { setAuthState } = useAuth(); // <<< Dapatkan fungsi setAuthState

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/users/login`, {
        username,
        password
      });

      const { accessToken, user, refreshToken } = response.data;

      // ✅ Simpan accessToken & user
      // localStorage.setItem('token', accessToken); // token for Authorization header
      // sessionStorage.setItem('userData', JSON.stringify(user)); // user for app logic
      setAuthState(accessToken, user, refreshToken);

      setMsg('Login berhasil!');

      // ✅ Redirect ke ChatPage
      navigate('/chat');
    } catch (error) {
      setMsg(error.response?.data?.message || 'Username/Password salah');
    } finally {
      setIsLoading(false);
    }
  };


  const renderMessage = () => {
    switch (info) {
      case 'gagal':
      case 'salah':
        return 'Username/Password Mu Salah Nih Keknya';
      case 'logout':
        return 'Anda Telah Berhasil Logout';
      case 'belum_login':
        return 'Login dulu bang';
      default:
        return msg;
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #48cae4 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          {/* Left Side - Carousel */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="h-100 d-flex align-items-center">
              <div id="carouselExampleSlidesOnly" className="carousel slide w-100" data-bs-ride="carousel">
                <div className="carousel-inner rounded-4 overflow-hidden shadow-lg">
                  <div className="carousel-item active">
                    <img src="/cover1.jpg" className="d-block w-100" style={{ height: '500px', objectFit: 'cover' }} alt="Image 1" />
                  </div>
                  <div className="carousel-item">
                    <img src="/cover2.jpg" className="d-block w-100" style={{ height: '500px', objectFit: 'cover' }} alt="Image 2" />
                  </div>
                  <div className="carousel-item">
                    <img src="/cover3.jpg" className="d-block w-100" style={{ height: '500px', objectFit: 'cover' }} alt="Image 3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div className="d-flex justify-content-center align-items-center min-vh-100 py-4">
              <div className="login-card w-100" style={{ maxWidth: '450px' }}>
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden"
                  style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                  <div className="card-body p-5">
                    {/* Logo and Title */}
                    <div className="text-center mb-4">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3">
                        <img src="/logoo.png" alt="Logo" height={80}/>
                      </div>
                      <h2 className="fw-bold mb-2" style={{ color: '#03045e' }}>Welcome Back</h2>
                      <p className="text-muted">Sign in to continue to your chat</p>
                    </div>

                    {/* Alert Messages */}
                    {renderMessage() && (
                      <div className="alert alert-warning border-0 rounded-3 mb-4"
                        style={{ backgroundColor: '#ade8f4', color: '#023e8a' }}>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {renderMessage()}
                      </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin}>
                      <div className="mt-5 mb-4">
                        <label htmlFor="username" className="form-label fw-medium" style={{ color: '#03045e' }}>
                          Username/Email
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-0 rounded-start-3"
                            style={{ backgroundColor: '#caf0f8', color: '#023e8a' }}>
                            <i className="fas fa-user"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 rounded-end-3 py-3"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username or email"
                            style={{ backgroundColor: '#f8f9fa', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="password" className="form-label fw-medium" style={{ color: '#03045e' }}>
                          Password
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-0 rounded-start-3"
                            style={{ backgroundColor: '#caf0f8', color: '#023e8a' }}>
                            <i className="fas fa-lock"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control border-0 rounded-end-3 py-3"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            style={{ backgroundColor: '#f8f9fa', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn w-100 py-3 rounded-3 fw-medium mb-4"
                        style={{
                          background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
                          border: 'none',
                          color: 'white',
                          fontSize: '1.1rem',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(0, 119, 182, 0.3)'
                        }}
                        disabled={isLoading}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Signing in...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-in-alt me-2"></i>
                            Sign In
                          </>
                        )}
                      </button>
                    </form>

                    {/* Register Link */}
                    <div className="text-center">
                      <p className="mb-0" style={{ color: '#6c757d' }}>
                        Don't have an account?
                        <a href="/register" className="text-decoration-none fw-medium ms-2"
                          style={{ color: '#0077b6' }}>
                          Create Account
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;