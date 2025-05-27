// src/auth/AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react"; // TAMBAHKAN: useEffect
// HAPUS: import Cookies from "js-cookie"; // <-- Hapus impor ini
import axios from "../api/axiosinstance.js"; // Pastikan ini instance yang sama dengan interceptor
import PropTypes from 'prop-types';
import { BASE_URL } from "../utils.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem("token") || null);
    const [user, setUser] = useState(() => {
        const userData = sessionStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    });

    // MODIFIKASI: Hapus parameter newRefreshToken
    const setAuthState = (newAccessToken, newUser) => {
        setAccessToken(newAccessToken);
        setUser(newUser);
        localStorage.setItem("token", newAccessToken);
        sessionStorage.setItem('userData', JSON.stringify(newUser));
        // HAPUS: if (newRefreshToken) { Cookies.set(...) } // <-- Hapus bagian ini
    };

    // MODIFIKASI: Fungsi login ini sekarang bergantung pada backend
    // untuk mengatur refreshToken sebagai HttpOnly cookie.
    // Jika LoginPage Anda yang melakukan request, Anda mungkin tidak perlu fungsi ini,
    // cukup panggil setAuthState dari LoginPage.
    const login = async (username, password) => {
        try {
            // Pastikan axiosInstance Anda sudah memiliki withCredentials: true
            const res = await axios.post(`${BASE_URL}/users/login`, { username, password });
            const { accessToken, user } = res.data; // Backend tidak mengirim refreshToken di body lagi

            // Panggil setAuthState tanpa refreshToken
            setAuthState(accessToken, user);
            return true;
        } catch (err) {
            console.error("Login failed:", err);
            return false;
        }
    };

    const logout = async () => { // Jadikan async jika ada operasi async di dalamnya
        try {
            // (Opsional) Panggil endpoint logout di backend untuk menghapus cookie HttpOnly di server
            // await axios.post(`${BASE_URL}/users/logout`, {}, { withCredentials: true });
        } catch (err) {
            console.error("Backend logout failed (optional):", err);
        } finally {
            setAccessToken(null);
            setUser(null);
            localStorage.removeItem("token");
            sessionStorage.removeItem("userData");
            // HAPUS: Cookies.remove("refreshToken"); // <-- Hapus baris ini
        }
    };

    // MODIFIKASI: refreshAccessToken agar melempar error jika gagal
    const refreshAccessToken = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/token`, { withCredentials: true });
            const newToken = res.data.accessToken;
            setAccessToken(newToken);
            localStorage.setItem("token", newToken);
            console.log("Access token refreshed successfully");
            return newToken;
        } catch (err) {
            console.error("Token refresh failed in refreshAccessToken:", err);
            await logout(); // Penting: Logout jika refresh token gagal total
            throw err;      // Lemparkan error agar interceptor bisa menanganinya
        }
    };

    // --- TAMBAHKAN: SETUP AXIOS INTERCEPTOR ---
    useEffect(() => {
        // Interceptor untuk Request
        const requestIntercept = axios.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token'); // Ambil token terbaru dari localStorage
                if (currentToken && !config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor untuk Response
        const responseIntercept = axios.interceptors.response.use(
            (response) => response, // Jika sukses, langsung kembalikan
            async (error) => {
                const originalRequest = error.config;

                // Cek apakah error 401 dan BUKAN request refresh token itu sendiri
                // dan request belum pernah dicoba ulang
                if (error.response?.status === 401 && originalRequest.url !== `${BASE_URL}/token` && !originalRequest._retry) {
                    originalRequest._retry = true; // Tandai agar tidak retry terus-menerus
                    console.log("Caught 401, attempting to refresh token...");

                    try {
                        const newAccessToken = await refreshAccessToken(); // Panggil fungsi refresh
                        if (newAccessToken) {
                            console.log("Retrying original request with new token");
                            // Update header di request asli dan coba lagi
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return axios(originalRequest); // Coba lagi request asli
                        }
                    } catch (refreshError) {
                        // Jika refreshAccessToken() melempar error (sudah di-logout di sana)
                        console.error("Refresh token failed, user logged out.", refreshError);
                        // Tidak perlu melakukan apa-apa lagi karena logout sudah dipanggil
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error); // Kembalikan error lain atau jika refresh gagal
            }
        );

        // Cleanup: Hapus interceptor saat komponen unmount
        return () => {
            axios.interceptors.request.eject(requestIntercept);
            axios.interceptors.response.eject(responseIntercept);
        };
    }, []); // Dependensi kosong agar hanya dijalankan sekali saat mount dan dibersihkan saat unmount

    // --- AKHIR SETUP INTERCEPTOR ---

    return (
        <AuthContext.Provider
            value={{ accessToken, user, login, logout, refreshAccessToken, setAuthState }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuthContext = () => useContext(AuthContext);