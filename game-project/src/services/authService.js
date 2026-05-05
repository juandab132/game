// src/services/authService.js
// Maneja autenticación JWT — guarda token en memoria (no localStorage)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Token guardado en memoria (se pierde al recargar — correcto para seguridad)
let _token = null
let _username = null

export const authService = {

    // ─── Registrar nuevo usuario ──────────────────────────────
    async register(username, password) {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || 'Error al registrarse')

        _token = data.token
        _username = data.username
        return data
    },

    // ─── Login ────────────────────────────────────────────────
    async login(username, password) {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || 'Credenciales inválidas')

        _token = data.token
        _username = data.username
        return data
    },

    // ─── Login sin backend (solo frontend) ────────────────────
    // La guía dice: "sin backend no debe estar atado al esquema seguro"
    loginOffline(username) {
        _token = 'offline_token_' + Date.now()
        _username = username
        return { token: _token, username, offline: true }
    },

    // ─── Obtener token para Authorization header ───────────────
    getToken() {
        return _token
    },

    getUsername() {
        return _username
    },

    isLoggedIn() {
        return !!_token
    },

    logout() {
        _token = null
        _username = null
    },

    // ─── Fetch con token automático ───────────────────────────
    // Usalo en World.js para /api/blocks
    async fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        }

        if (_token) {
            headers['Authorization'] = `Bearer ${_token}`
        }

        return fetch(url, { ...options, headers })
    }
}

export default authService