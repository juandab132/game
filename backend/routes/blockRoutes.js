const express = require('express')
const router = express.Router()
const blockController = require('../controllers/blockController')
const verifyToken = require('../middleware/authMiddleware')

/**
 * @route   GET /api/blocks
 * @desc    Obtener bloques por nivel — PROTEGIDO con JWT
 * @access  Private (requiere Authorization: Bearer <token>)
 */
router.get('/', verifyToken, blockController.getBlocks)

/**
 * @route   POST /api/blocks
 * @desc    Agregar un bloque — protegido
 */
router.post('/', verifyToken, blockController.addBlock)

/**
 * @route   POST /api/blocks/batch
 * @desc    Cargar múltiples bloques
 */
router.post('/batch', verifyToken, blockController.addMultipleBlocks)

/**
 * @route   GET /api/blocks/ping
 * @desc    Health check — público (no requiere token)
 */
router.get('/ping', (req, res) => {
    res.json({
        status: 'online',
        message: 'pong',
        timestamp: new Date()
    })
})

module.exports = router