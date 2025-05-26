import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL } from "../utils";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        email,
        username,
        nickname,
        password,
      });
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        const msg = err.response.data.msg.toLowerCase();
        if (msg.includes("email")) setInfo("Email telah terdaftar");
        else if (msg.includes("username")) setInfo("Username telah dipakai / menggunakan spasi");
        else setInfo("Terjadi kesalahan, coba lagi");
      } else {
        setInfo("Terjadi kesalahan, coba lagi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ 
      background: 'linear-gradient(135deg, #03045e 0%, #0077b6 50%, #48cae4 100%)',
      fontFamily: "'Poppins', sans-serif" 
    }}>
      <div className="container">
        <div className="row justify-content-center">
          {/* Left Side - Carousel */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="h-100 d-flex align-items-center">
              <div id="carouselExampleSlidesOnly" className="carousel slide w-100" data-bs-ride="carousel">
                <div className="carousel-inner rounded-4 overflow-hidden shadow-lg">
                  <div className="carousel-item active">
                    <img src="/cover1.jpg" className="d-block w-100" alt="Image 1" style={{ height: "600px", objectFit: "cover" }} />
                  </div>
                  <div className="carousel-item">
                    <img src="/cover2.jpg" className="d-block w-100" alt="Image 2" style={{ height: "600px", objectFit: "cover" }} />
                  </div>
                  <div className="carousel-item">
                    <img src="/cover3.jpg" className="d-block w-100" alt="Image 3" style={{ height: "600px", objectFit: "cover" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div className="d-flex justify-content-center align-items-center min-vh-100 py-4">
              <div className="register-card w-100" style={{ maxWidth: '500px' }}>
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden"
                     style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                  <div className="card-body p-5">
                    {/* Logo and Title */}
                    <div className="text-center mb-4">
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3">
                        <img src="/logoo.png" alt="Logo" height={80}/>
                      </div>
                      <h2 className="fw-bold mb-2" style={{ color: '#03045e' }}>Create Account</h2>
                      <p className="text-muted">Join us and start chatting today</p>
                    </div>

                    {/* Alert Messages */}
                    {info && (
                      <div className="alert alert-warning border-0 rounded-3 mb-4 d-flex align-items-center" 
                           style={{ backgroundColor: '#ade8f4', color: '#023e8a' }}>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <div className="flex-grow-1">{info}</div>
                        <button type="button" className="btn-close ms-2" onClick={() => setInfo(null)}
                                style={{ fontSize: '0.8rem' }}></button>
                      </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-medium" style={{ color: '#03045e' }}>
                          Email Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-0 rounded-start-3" 
                                style={{ backgroundColor: '#caf0f8', color: '#023e8a' }}>
                            <i className="fas fa-envelope"></i>
                          </span>
                          <input 
                            type="email" 
                            className="form-control border-0 rounded-end-3 py-3" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Enter your email address"
                            style={{ backgroundColor: '#f8f9fa', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                            required 
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="username" className="form-label fw-medium" style={{ color: '#03045e' }}>
                          Username
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
                            placeholder="Choose a username"
                            style={{ backgroundColor: '#f8f9fa', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                            required 
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="nickname" className="form-label fw-medium" style={{ color: '#03045e' }}>
                          Nickname <span className="text-muted">(Optional)</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text border-0 rounded-start-3" 
                                style={{ backgroundColor: '#caf0f8', color: '#023e8a' }}>
                            <i className="fas fa-id-badge"></i>
                          </span>
                          <input 
                            type="text" 
                            className="form-control border-0 rounded-end-3 py-3" 
                            id="nickname" 
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)} 
                            placeholder="Enter display name"
                            style={{ backgroundColor: '#f8f9fa', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
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
                            placeholder="Create a strong password"
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
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-user-plus me-2"></i>
                            Create Account
                          </>
                        )}
                      </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center">
                      <p className="mb-0" style={{ color: '#6c757d' }}>
                        Already have an account? 
                        <Link to="/" className="text-decoration-none fw-medium ms-2" 
                              style={{ color: '#0077b6' }}>
                          Sign In Here
                        </Link>
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

export default Register;