import axios from 'axios'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8082/api' })
export function setCredentials(email, password) {
  api.defaults.auth = { username: email, password }
}
export function clearCredentials() { delete api.defaults.auth }
export default api
