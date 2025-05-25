// src/auth/AuthProvider.jsx
import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import axios from "../api/axiosinstance.js";
import PropTypes from 'prop-types';
import { BASE_URL } from "../utils.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { username, password });
      const token = res.data.accessToken;

      setAccessToken(token);
      localStorage.setItem("token", token);

      // Simpan refresh token di cookie (default 1 hari)
      Cookies.set("refreshToken", res.data.refreshToken, {
        secure: true,
        sameSite: "Strict",
        expires: 5,
      });

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("token");
    Cookies.remove("refreshToken");
  };

  const refreshAccessToken = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/token`, { withCredentials: true });
      const newToken = res.data.accessToken;

      setAccessToken(newToken);
      localStorage.setItem("token", newToken);

      return newToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthContext = () => useContext(AuthContext);
