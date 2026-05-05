import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Environment from './Environment.js'
import Robot from './Robot.js'
import ToyCarLoader from '../../loaders/ToyCarLoader.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'
import Enemy from './Enemy.js'
import authService from '../../services/authService.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const TOTAL_LEVELS = 5

export default class World {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.physics = this.experience.physics
        this.enemies = []
        this.isGameOver = false
        this.collectedCoins = 0
        this.totalCoinsNeeded = 5
        this.currentLevel = 1
        this.totalPoints = 0

        this.resources.on('ready', async () => {
            this.environment = new Environment(this.experience)
            this.loader = new ToyCarLoader(this.experience)
            this.robot = new Robot(this.experience)

            if (this.robot.body) this.robot.body.type = CANNON.Body.STATIC

            await this.loadLevel(1)
            this.thirdPersonCamera = new ThirdPersonCamera(this.experience, this.robot.group)
            this.spawnEnemies(4)
        })
    }

    async loadLevel(levelNumber = 1) {
        this.currentLevel = levelNumber
        this.collectedCoins = 0
        this.isGameOver = false
        this._updateHUD()

        const mapName = levelNumber === 1 ? 'escenario_completo' : `escenario_nivel${levelNumber}`
        const modelKey = this.resources.items[mapName] ? mapName : 'escenario_completo'
        const mapBlocks = [{ name: modelKey, x: 0, y: 0, z: 0, role: 'mapa' }]

        try {
            await this.loader._processBlocks(mapBlocks, [modelKey])
            await this.initLevelFromDB(levelNumber)
            setTimeout(() => { this.resetRobotPosition({ x: 0, y: 15, z: 0 }) }, 2000)
        } catch (err) {
            console.error('Error en carga de nivel:', err)
        }
    }

    async initLevelFromDB(levelNumber = 1) {
        try {
            const response = await authService.fetchWithAuth(
                `${API_URL}/api/blocks?level=${levelNumber}`
            )
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            const dbBlocks = await response.json()
            const formattedBlocks = dbBlocks.map(block => ({
                name: block.modelName || block.name,
                x: block.position?.x ?? block.x ?? 0,
                y: block.position?.y ?? block.y ?? 0,
                z: block.position?.z ?? block.z ?? 0,
                role: block.role || 'default'
            }))

            const coins = formattedBlocks.filter(b => b.role === 'default')
            this.totalCoinsNeeded = coins.length || 5

            if (formattedBlocks.length > 0) {
                await this.loader._processBlocks(formattedBlocks, [])
            }
            console.log(`✅ Nivel ${levelNumber} desde MongoDB — ${coins.length} coins`)
        } catch (error) {
            console.warn('Backend no disponible, usando JSON local:', error.message)
            await this.initLevelFromJSON(levelNumber)
        }
    }

    async initLevelFromJSON(levelNumber = 1) {
        try {
            const response = await fetch('/data/toy_car_blocks.json')
            const allLevels = await response.json()
            const levelData = allLevels.find(l => l.level === levelNumber)

            if (!levelData) {
                this.totalCoinsNeeded = 5
                return
            }

            const formattedBlocks = levelData.blocks.map(block => ({
                name: block.model.replace('models/', '').replace('.glb', ''),
                x: block.position.x,
                y: block.position.y,
                z: block.position.z,
                role: block.Role === 'finalPrize' ? 'finalPrize' : (block.type === 'coin' ? 'default' : block.type)
            }))

            const coins = formattedBlocks.filter(b => b.role === 'default')
            this.totalCoinsNeeded = coins.length || 5
            await this.loader._processBlocks(formattedBlocks, [])
            console.log(`📄 Nivel ${levelNumber} desde JSON — ${coins.length} coins`)
        } catch (e) {
            console.error('Error cargando JSON local:', e)
        }
    }

    clearCurrentScene() {
        if (this.loader?.prizes) {
            this.loader.prizes.forEach(p => {
                const mesh = p.pivot || p.model
                if (mesh) this.scene.remove(mesh)
            })
            this.loader.prizes = []
        }

        const toRemove = []
        this.scene.traverse(obj => { if (obj.userData?.levelObject) toRemove.push(obj) })
        toRemove.forEach(obj => this.scene.remove(obj))

        const bodiesToRemove = this.physics.world.bodies.filter(b => b.userData?.levelBody)
        bodiesToRemove.forEach(b => this.physics.world.removeBody(b))

        this.collectedCoins = 0
    }

    resetRobotPosition(spawn) {
        if (!this.robot?.body) return
        this.robot.body.type = CANNON.Body.DYNAMIC
        this.robot.body.mass = 10
        this.robot.body.updateMassProperties()
        this.robot.body.position.set(spawn.x, spawn.y, spawn.z)
        this.robot.body.velocity.set(0, 0, 0)
        this.robot.body.wakeUp()
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 25
            const z = (Math.random() - 0.5) * 25
            const enemy = new Enemy(this.experience, { x, y: 5, z })
            this.enemies.push(enemy)
        }
    }

    checkCollisions() {
        if (!this.robot || this.isGameOver) return

        this.loader?.prizes.forEach((prize) => {
            const mesh = prize.pivot || prize.model
            if (!mesh || !mesh.visible) return

            const dist = this.robot.group.position.distanceTo(mesh.position)
            if (dist < 1.5) {
                if (prize.role === 'default') {
                    mesh.visible = false
                    this.collectedCoins++
                    this.totalPoints++
                    this._updateHUD()
                    if (this.collectedCoins >= this.totalCoinsNeeded) this.revealPortal()
                } else if (prize.role === 'finalPrize') {
                    this.nextLevel()
                }
            }
        })
    }

    revealPortal() {
        const portal = this.loader?.prizes.find(p => p.role === 'finalPrize')
        if (portal) {
            const mesh = portal.pivot || portal.model
            if (mesh) {
                mesh.visible = true
                console.log('🌀 Portal revelado!')
            }
        }
    }

    async nextLevel() {
        if (this.isGameOver) return
        this.isGameOver = true

        const next = this.currentLevel + 1
        if (next > TOTAL_LEVELS) {
            setTimeout(() => {
                alert(`🏆 ¡JUEGO COMPLETADO!\n\nPuntos totales: ${this.totalPoints}`)
                location.reload()
            }, 300)
            return
        }

        this._showLevelTransition(this.currentLevel, next, async () => {
            this.clearCurrentScene()
            this.isGameOver = false
            await this.loadLevel(next)
        })
    }

    _updateHUD() {
        let hudLevel = document.getElementById('hud-level')
        let hudPoints = document.getElementById('hud-points')
        let hudCoins = document.getElementById('hud-coins')

        if (!hudLevel) {
            const hud = document.createElement('div')
            hud.id = 'hud-container'
            hud.setAttribute('role', 'status')
            hud.setAttribute('aria-live', 'polite')
            hud.style.cssText = `
                position: fixed; top: 16px; left: 16px; z-index: 100;
                display: flex; flex-direction: column; gap: 8px;
            `
            hud.innerHTML = `
                <div id="hud-level" aria-label="Nivel actual" style="
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
                    color: white; padding: 8px 16px; border-radius: 20px;
                    font-size: 14px; font-weight: 600; font-family: system-ui;
                    border: 1px solid rgba(255,255,255,0.15);">
                    🗺️ Nivel 1 / ${TOTAL_LEVELS}
                </div>
                <div id="hud-points" aria-label="Puntos acumulados" style="
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
                    color: #FFD700; padding: 8px 16px; border-radius: 20px;
                    font-size: 14px; font-weight: 600; font-family: system-ui;
                    border: 1px solid rgba(255,215,0,0.3);">
                    🎖️ 0 pts
                </div>
                <div id="hud-coins" aria-label="Monedas recolectadas" style="
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
                    color: #4ADE80; padding: 8px 16px; border-radius: 20px;
                    font-size: 13px; font-family: system-ui;
                    border: 1px solid rgba(74,222,128,0.3);">
                    🪙 0 / ${this.totalCoinsNeeded}
                </div>
            `
            document.body.appendChild(hud)
            hudLevel  = document.getElementById('hud-level')
            hudPoints = document.getElementById('hud-points')
            hudCoins  = document.getElementById('hud-coins')
        }

        if (hudLevel)  hudLevel.textContent  = `🗺️ Nivel ${this.currentLevel} / ${TOTAL_LEVELS}`
        if (hudPoints) hudPoints.textContent = `🎖️ ${this.totalPoints} pts`
        if (hudCoins)  hudCoins.textContent  = `🪙 ${this.collectedCoins} / ${this.totalCoinsNeeded}`
    }

    _showLevelTransition(fromLevel, toLevel, onContinue) {
        const overlay = document.createElement('div')
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui;
        `
        overlay.innerHTML = `
            <div style="
                text-align: center; color: white;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px; padding: 48px 40px;
            ">
                <div style="font-size: 56px; margin-bottom: 16px">🏆</div>
                <h2 style="margin: 0 0 8px; font-size: 28px">¡Nivel ${fromLevel} Superado!</h2>
                <p style="margin: 0 0 8px; color: rgba(255,255,255,0.6)">Puntos: ${this.totalPoints}</p>
                <p style="margin: 0 0 32px; font-size: 20px; color: #818CF8">Entrando al Nivel ${toLevel}...</p>
                <button id="btn-continue" style="
                    padding: 14px 40px; border: none; cursor: pointer;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white; font-size: 16px; font-weight: 600;
                    border-radius: 12px;">¡Vamos! 🚀</button>
            </div>
        `
        document.body.appendChild(overlay)
        document.getElementById('btn-continue').onclick = () => {
            document.body.removeChild(overlay)
            onContinue()
        }
    }

    update(delta) {
        if (this.isGameOver) return

        this.robot?.update()
        this.checkCollisions()

        if (this.robot?.body?.type === CANNON.Body.DYNAMIC && this.robot.body.position.y < -15) {
            this.gameOver()
        }

        this.enemies.forEach(e => {
            e.update(delta)
            if (this.robot && e.model) {
                if (this.robot.group.position.distanceTo(e.model.position) < 1.2) {
                    this.gameOver()
                }
            }
        })

        if (this.thirdPersonCamera) this.thirdPersonCamera.update()
    }

    gameOver() {
        if (this.isGameOver) return
        this.isGameOver = true
        setTimeout(() => location.reload(), 500)
    }
}