const User = require('../models/User')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'videojuego_secret_key_2026'
const JWT_EXPIRES = '24h'

// ─── REGISTRO ────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña requeridos' })
        }

        const exists = await User.findOne({ username })
        if (exists) {
            return res.status(409).json({ message: 'El usuario ya existe' })
        }

        const user = new User({ username, password })
        await user.save()

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        )

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            username: user.username
        })
    } catch (error) {
        console.error('Error en register:', error)
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message })
    }
}

// ─── LOGIN ───────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña requeridos' })
        }

        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' })
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        )

        res.json({
            message: 'Login exitoso',
            token,
            username: user.username
        })
    } catch (error) {
        console.error('Error en login:', error)
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message })
    }
}