import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import Environment from './Environment.js'
import Robot from './Robot.js'
import ToyCarLoader from '../../loaders/ToyCarLoader.js'
import ThirdPersonCamera from './ThirdPersonCamera.js'
import Enemy from './Enemy.js'
import { showGameOver, showLevelComplete } from '../../components/GameOverScreen.js'

const TOTAL_LEVELS = 5

export default class World {
    constructor(experience) {
        this.experience       = experience
        this.scene            = experience.scene
        this.resources        = experience.resources
        this.physics          = experience.physics
        this.enemies          = []
        this.isGameOver       = false
        this.collectedCoins   = 0
        this.totalCoinsNeeded = 5
        this.currentLevel     = 1
        this.totalPoints      = 0
        this.gameStarted      = false
        this.defeatTriggered  = false

        this.resources.on('ready', async () => {
            this.environment = new Environment(this.experience)
            this.loader      = new ToyCarLoader(this.experience)
            this.robot       = new Robot(this.experience)

            await this.loadLevel(1)
            this.thirdPersonCamera = new ThirdPersonCamera(this.experience, this.robot.group)
            // ✅ Spawn lejos — radio 14 a 20 unidades, con delay de activación en cada uno
            this.spawnEnemies(4)
        })
    }

    async loadLevel(levelNumber = 1) {
        this.currentLevel    = levelNumber
        this.collectedCoins  = 0
        this.isGameOver      = false
        this.defeatTriggered = false
        this._updateHUD()

        try {
            await this.initLevelFromJSON(levelNumber)
            // ✅ Reset de posición del robot — sin congelar el body
            this.resetRobotPosition({ x: 0, y: 3, z: 0 })
        } catch (err) {
            console.error('Error cargando nivel:', err)
        }
    }

    async initLevelFromJSON(levelNumber = 1) {
        try {
            const res       = await fetch('/data/toy_car_blocks.json')
            const allLevels = await res.json()
            const levelData = allLevels.find(l => l.level === levelNumber)

            if (!levelData) {
                console.warn(`⚠️ No se encontró nivel ${levelNumber}`)
                this.totalCoinsNeeded = 5
                return
            }

            const mapaBlocks     = levelData.blocks.filter(b => b.role === 'mapa')
            const obstacleBlocks = levelData.blocks.filter(b => b.role === 'obstacle')
            const coinBlocks     = levelData.blocks.filter(b => b.role === 'default')
            const portalBlocks   = levelData.blocks.filter(b => b.role === 'finalPrize')

            this.totalCoinsNeeded = coinBlocks.length || 5
            this._updateHUD()

            if (mapaBlocks.length > 0)
                await this.loader._processBlocks(mapaBlocks, mapaBlocks.map(b => b.name))
            if (obstacleBlocks.length > 0)
                await this.loader._processBlocks(obstacleBlocks, [])
            if ([...coinBlocks, ...portalBlocks].length > 0)
                await this.loader._processBlocks([...coinBlocks, ...portalBlocks], [])

            console.log(`✅ Nivel ${levelNumber} — ${obstacleBlocks.length} objetos, ${coinBlocks.length} monedas`)
        } catch (e) {
            console.error('Error leyendo toy_car_blocks.json:', e)
        }
    }

    clearCurrentScene() {
        if (this.loader?.prizes) {
            this.loader.prizes.forEach(p => { if (p.pivot) this.scene.remove(p.pivot) })
            this.loader.prizes = []
        }
        const toRemove = []
        this.scene.traverse(obj => { if (obj.userData?.levelObject) toRemove.push(obj) })
        toRemove.forEach(obj => this.scene.remove(obj))
        this.physics.world.bodies
            .filter(b => b.userData?.levelBody)
            .forEach(b => this.physics.world.removeBody(b))
        this.collectedCoins = 0
    }

    resetRobotPosition(spawn = { x: 0, y: 3, z: 0 }) {
        if (!this.robot?.body) return
        // ✅ Igual que Adventurer: set directo sin cambiar type
        this.robot.body.position.set(spawn.x, spawn.y, spawn.z)
        this.robot.body.velocity.set(0, 0, 0)
        this.robot.body.angularVelocity.set(0, 0, 0)
        this.robot.body.quaternion.setFromEuler(0, 0, 0)
        this.robot.body.wakeUp()

        if (this.robot.group) {
            this.robot.group.position.set(spawn.x, spawn.y, spawn.z)
            this.robot.group.rotation.set(0, 0, 0)
        }
    }

    // ✅ Spawn lejos con delay de activación escalonado — igual que compañero
    spawnEnemies(count) {
        this.enemies.forEach(e => e.destroy?.())
        this.enemies = []

        for (let i = 0; i < count; i++) {
            const angle  = (i / count) * Math.PI * 2
            const radius = 14 + Math.random() * 6
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const enemy = new Enemy(this.experience, { x, y: 1.5, z })
            // ✅ Delay escalonado — igual que compañero
            enemy.delayActivation = i * 0.5 + 2.0
            this.enemies.push(enemy)
        }
    }

    checkCollisions() {
        if (!this.robot || this.isGameOver) return

        this.loader?.prizes.forEach(prize => {
            if (prize.collected) return
            const mesh = prize.pivot
            if (!mesh?.visible) return

            const dist = this.robot.group.position.distanceTo(mesh.position)
            if (dist < 1.8) {
                if (prize.role === 'default') {
                    prize.collect()
                    this.collectedCoins++
                    this.totalPoints++
                    this._updateHUD()
                    if (this.collectedCoins >= this.totalCoinsNeeded) {
                        this.revealPortal()
                    }
                } else if (prize.role === 'finalPrize') {
                    this.nextLevel()
                }
            }
        })
    }

    revealPortal() {
        const portal = this.loader?.prizes.find(p => p.role === 'finalPrize')
        if (portal?.pivot) {
            portal.pivot.visible = true
            portal.collected     = false
            console.log('🌀 Portal activado!')
        }
    }

    async nextLevel() {
        if (this.isGameOver) return
        this.isGameOver = true

        const next = this.currentLevel + 1
        if (next > TOTAL_LEVELS) {
            showGameOver({ points: this.totalPoints, level: this.currentLevel, reason: 'victory' })
            return
        }

        showLevelComplete({
            level: this.currentLevel,
            points: this.totalPoints,
            onContinue: async () => {
                this.enemies.forEach(e => e.destroy?.())
                this.enemies = []
                this.clearCurrentScene()
                this.isGameOver = false
                await this.loadLevel(next)
                this.spawnEnemies(4)
            }
        })
    }

    // ✅ triggerDefeat igual que compañero — usa modal de Experience
    triggerDefeat() {
        if (this.defeatTriggered) return
        this.defeatTriggered = true

        this.enemies.forEach(e => e.destroy?.())
        this.enemies = []

        showGameOver({ points: this.totalPoints, level: this.currentLevel, reason: 'death' })
    }

    _updateHUD() {
        let hudLevel  = document.getElementById('hud-level')
        let hudPoints = document.getElementById('hud-points')
        let hudCoins  = document.getElementById('hud-coins')

        if (!hudLevel) {
            const hud = document.createElement('div')
            hud.id = 'hud-container'
            hud.setAttribute('role', 'status')
            hud.setAttribute('aria-live', 'polite')
            hud.style.cssText = `position:fixed;top:16px;left:16px;z-index:100;display:flex;flex-direction:column;gap:8px;`
            hud.innerHTML = `
                <div id="hud-level" style="background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);color:white;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;font-family:system-ui;border:1px solid rgba(255,255,255,0.15)" aria-label="Nivel actual">🗺️ Nivel 1 / ${TOTAL_LEVELS}</div>
                <div id="hud-points" style="background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);color:#FFD700;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;font-family:system-ui;border:1px solid rgba(255,215,0,0.3)" aria-label="Puntos totales">🎖️ 0 pts</div>
                <div id="hud-coins" style="background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);color:#4ADE80;padding:8px 16px;border-radius:20px;font-size:13px;font-family:system-ui;border:1px solid rgba(74,222,128,0.3)" aria-label="Monedas recolectadas">🪙 0 / ${this.totalCoinsNeeded}</div>
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

    update(delta) {
        if (this.isGameOver) return

        this.robot?.update()
        this.checkCollisions()
        this.loader?.prizes.forEach(p => p.update?.(delta))

        if (this.robot?.body?.position?.y < -5) {
            this.resetRobotPosition({ x: 0, y: 3, z: 0 })
        }

        this.enemies.forEach(e => e.update(delta))
        if (this.thirdPersonCamera) this.thirdPersonCamera.update()
    }

    gameOver() {
        this.triggerDefeat()
    }
}