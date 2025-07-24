import axios from "axios";

const API = axios.create({
    baseURL: 'http://192.168.3.95:8000/api/'
    // baseURL:process.env.REACT_APP_API_URL
});

export const setAuthToken = (token) => {
    if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete API.defaults.headers.common['Authorization']
    }
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token');

  try {
    const response = await axios.post('http://localhost:8000/api/auth/token/refresh/', { refresh });
    const newAccessToken = response.data.access;
    localStorage.setItem('access_token', newAccessToken);
    setAuthToken(newAccessToken);
    return newAccessToken;
  } catch (err) {
    console.error('Failed to refresh token', err);
    throw err;
  }
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (err) {
        // Refresh token failed, redirect to login or logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthToken(null);
        window.location.href = '/login'; 
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default API;