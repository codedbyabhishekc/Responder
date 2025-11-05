import axios from 'axios';
const baseURL = typeof __API__ !== 'undefined' ? __API__ : 'http://localhost:4000';
const api = axios.create({ baseURL });

export function setToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}
export default api;
