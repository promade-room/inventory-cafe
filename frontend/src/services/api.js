import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Kategori
export const getKategoris = () => api.get('/kategori');
export const createKategori = (data) => api.post('/kategori', data);
export const updateKategori = (id, data) => api.put(`/kategori/${id}`, data);
export const deleteKategori = (id) => api.delete(`/kategori/${id}`);

// Barang
export const getBarangs = (params) => api.get('/barang', { params });
export const getBarang = (id) => api.get(`/barang/${id}`);
export const createBarang = (data) => api.post('/barang', data);
export const updateBarang = (id, data) => api.put(`/barang/${id}`, data);
export const deleteBarang = (id) => api.delete(`/barang/${id}`);

// Supplier
export const getSuppliers = () => api.get('/supplier');
export const createSupplier = (data) => api.post('/supplier', data);
export const updateSupplier = (id, data) => api.put(`/supplier/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/supplier/${id}`);

// Transaksi
export const getMasuk = (params) => api.get('/masuk', { params });
export const createMasuk = (data) => api.post('/masuk', data);
export const deleteMasuk = (id) => api.delete(`/masuk/${id}`);

export const getKeluar = (params) => api.get('/keluar', { params });
export const createKeluar = (data) => api.post('/keluar', data);
export const deleteKeluar = (id) => api.delete(`/keluar/${id}`);

// Laporan
export const getLaporanStok = (params) => api.get('/laporan/stok', { params });
export const getLaporanExpired = () => api.get('/laporan/expired');
export const getLaporanMovement = (params) => api.get('/laporan/movement', { params });

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;