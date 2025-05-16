import { useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const info = searchParams.get("info");

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/users/login', {
        username,
        password
      });
      // Simpan token atau redirect di sini
      console.log(response.data);
      setMsg('Login berhasil!');
    } catch (error) {
      setMsg('Username/Password salah');
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
    <div className="container-fluid d-flex align-items-center" style={{ height: '100vh', fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(#2C93D3, #7FFFD4)' }}>
      <div className="row w-100">
        <div className="col-md-6">
          <div id="carouselExampleSlidesOnly" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
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

        <div className="col-md-6 d-flex justify-content-center">
          <div className="login-box bg-white p-4 rounded shadow" style={{ width: '500px' }}>
            <h2 className="mb-4">Login</h2>
            {renderMessage() && <div className="alert alert-warning">{renderMessage()}</div>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username/Email</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <p>Belum punya akun? <a href="/register">Buat akun</a></p>
              <br /><br /><br />
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
