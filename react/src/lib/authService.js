import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001';

export const register = async (username, password) => {
    return await axios.post(`${API_URL}/register`, { username, password });
};

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        window.location.href = response.data.redirect_url || '/';  
    }
    return response.data;
};
export const getProtectedData = async () => {
    const token = localStorage.getItem('token');
    return await axios.get(`${API_URL}/protected`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};
