const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let _token    = null
let _username = null

// ✅ Restaurar token si venimos de un reload post-gameOver
const savedToken = sessionStorage.getItem('_gt')
const savedUser  = sessionStorage.getItem('_gu')
if (savedToken && savedUser) {
    _token    = savedToken
    _username = savedUser
    sessionStorage.removeItem('_gt')
    sessionStorage.removeItem('_gu')
}

export const authService = {
    async register(username, password) {
        const res  = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Error al registrarse')
        _token = data.token; _username = data.username
        return data
    },

    async login(username, password) {
        const res  = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Credenciales inválidas')
        _token = data.token; _username = data.username
        return data
    },

    loginOffline(username) {
        _token    = 'offline_' + Date.now()
        _username = username
        return { token: _token, username, offline: true }
    },

    getToken()    { return _token },
    getUsername() { return _username },
    isLoggedIn()  { return !!_token },
    logout()      { _token = null; _username = null },

    async fetchWithAuth(url, options = {}) {
        const headers = { 'Content-Type': 'application/json', ...options.headers }
        if (_token) headers['Authorization'] = `Bearer ${_token}`
        return fetch(url, { ...options, headers })
    }
}

// ✅ Exponer globalmente para GameOverScreen
window.__authService = authService

export default authService