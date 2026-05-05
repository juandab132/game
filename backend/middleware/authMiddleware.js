const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'videojuego_secret_key_2026'

module.exports = function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({ message: 'Token requerido para acceder' })
    }

    // Formato esperado: "Bearer <token>"
    const token = authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido' })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded   // { userId, username }
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' })
    }
}