// src/api/axiosInstance.js
import axios from "axios";
import { BASE_URL } from "../utils";

const instance = axios.create({
  baseURL: `${BASE_URL}`, // Ganti dengan base URL backend-mu
  withCredentials: true, // untuk kirim cookie kalau dibutuhkan
});

export default instance;