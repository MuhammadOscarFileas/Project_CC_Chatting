import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/users/register", {
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
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center" style={{ height: "100vh", background: "linear-gradient(#2C93D3, #7FFFD4)", fontFamily: "'Poppins', sans-serif" }}>
      <div className="row w-100">
        <div className="col-md-6">
          <div id="carouselExampleSlidesOnly" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src="/cover1.jpg" className="d-block w-100" alt="Image 1" style={{ height: "500px", objectFit: "cover" }} />
              </div>
              <div className="carousel-item">
                <img src="/cover2.jpg" className="d-block w-100" alt="Image 2" style={{ height: "500px", objectFit: "cover" }} />
              </div>
              <div className="carousel-item">
                <img src="/cover3.jpg" className="d-block w-100" alt="Image 3" style={{ height: "500px", objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 d-flex justify-content-center">
          <div className="login-box" style={{ backgroundColor: "#fff", borderRadius: "10px", padding: "30px", boxShadow: "0 0 20px rgba(0, 0, 0, 0.1)", width: "500px" }}>
            <h2 className="mb-4">Registrasi</h2>

            {info && (
              <div className="alert alert-info alert-dismissible d-flex align-items-center" role="alert">
                <div>{info}</div>
                <button type="button" className="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close" onClick={() => setInfo(null)}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input type="text" className="form-control" id="username" value={username}
                  onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="nickname" className="form-label">Nickname</label>
                <input type="text" className="form-control" id="nickname" value={nickname}
                  onChange={(e) => setNickname(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="d-grid gap-2 mt-4">
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
              <p className="mt-3">Sudah punya akun? <Link to="/">Login di sini</Link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
