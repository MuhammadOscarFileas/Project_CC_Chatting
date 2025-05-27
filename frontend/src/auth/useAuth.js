// src/auth/useAuth.js
// import { useContext } from "react";
import { useAuthContext } from "./AuthProvider";

const useAuth = () => {
  const { accessToken, user, login, logout, refreshAccessToken, setAuthState } = useAuthContext();

  return {
    accessToken,
    user,
    login,
    logout,
    refreshAccessToken,
    setAuthState,
    isAuthenticated: !!accessToken,
  };
};

export default useAuth;