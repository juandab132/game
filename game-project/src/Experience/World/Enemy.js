import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import Sound from './Sound.js'

export default class Enemy {
    constructor(experience, position = { x: 0, y: 1.5, z: 0 }) {
        this.experience  = experience
        this.scene       = experience.scene
        this.physicsWorld = experience.physics.world
        this.playerRef   = experience.world?.robot

        // ✅ Mismas velocidades que ZombieEnemy del compañero
        this.baseSpeed       = 0.55
        this.chaseSpeed      = 1.65
        this.detectionRadius = 16
        this.releaseRadius   = 21
        this.attackDistance  = 1.85
        this.isChasing       = false

        // ✅ Mismo offset visual que el compañero
        this.visualYOffset   = -1.32
        this.lastAttackTime  = 0
        this.attackCooldown  = 900
        this.hasTriggeredDefeat = false

        // Movimiento variable — igual que compañero
        this.movementMode    = 'walk2'
        this.modeTimer       = 0
        this.nextModeChange  = 3 + Math.random() * 3

        // ✅ Delay de activación — el compañero lo usa para que no ataquen inmediato
        this.delayActivation = 1.5 + Math.random() * 2

        try {
            this.proximitySound = new Sound('/sounds/alert.ogg', { loop: true, volume: 0 })
            this.proximitySound.play()
        } catch (e) { this.proximitySound = null }

        this.alertSoundPlaying = false

        // Grupo visual igual que ZombieEnemy
        this.model = new THREE.Group()
        this.model.name = 'Enemy'
        this.model.position.set(position.x, position.y, position.z)

        const res = this.experience.resources.items.foxModel
        this.visual = this._cloneModel(res)
        this.visual.scale.setScalar(0.40)
        this.visual.position.y = this.visualYOffset
        this.model.add(this.visual)

        this.model.traverse(c => { if (c.isMesh) c.castShadow = true })
        this.scene.add(this.model)

        this.setAnimation()

        // ✅ Body KINEMATIC — igual que ZombieEnemy del compañero
        this.body = new CANNON.Body({
            mass:  0,
            type:  CANNON.Body.KINEMATIC,
            shape: new CANNON.Sphere(0.68),
            position: new CANNON.Vec3(position.x, position.y, position.z),
            angularDamping: 1
        })
        this.body.fixedRotation = true
        this.body.wakeUp()
        this.physicsWorld.addBody(this.body)

        this._onCollide = (event) => {
            const robot = this.experience.world?.robot
            if (event.body === robot?.body) this._killPlayer()
        }
        this.body.addEventListener('collide', this._onCollide)
    }

    // ✅ Clonar igual que ZombieEnemy del compañero
    _cloneModel(source) {
        const sourceScene = source?.scene || source
        const clone = SkeletonUtils.clone(sourceScene)

        clone.traverse((child) => {
            const srcChild = sourceScene.getObjectByName(child.name)
            if (child.isMesh && child.material) {
                child.material = Array.isArray(child.material)
                    ? child.material.map(m => m.clone())
                    : child.material.clone()
            }
            if (child.isMesh && srcChild?.material) {
                const s = srcChild.material
                const d = child.material
                if (!Array.isArray(s) && !Array.isArray(d)) {
                    if (s.map          && !d.map)          d.map          = s.map
                    if (s.normalMap    && !d.normalMap)    d.normalMap    = s.normalMap
                    if (s.roughnessMap && !d.roughnessMap) d.roughnessMap = s.roughnessMap
                    if (s.metalnessMap && !d.metalnessMap) d.metalnessMap = s.metalnessMap
                }
            }
        })
        return clone
    }

    // ✅ Animaciones por nombre — igual que ZombieEnemy
    setAnimation() {
        const animations = this.experience.resources.items.foxModel?.animations || []

        this.animation = { mixer: null, actions: {}, current: null }
        if (!animations.length) return

        this.animation.mixer = new THREE.AnimationMixer(this.visual)

        animations.forEach(clip => {
            this.animation.actions[clip.name] = this.animation.mixer.clipAction(clip)
        })

        const getClip = (name) => animations.find(c =>
            c.name === name ||
            c.name === `Armature|${name}` ||
            c.name.endsWith(`|${name}`)
        )

        const idleClip   = getClip('Idle')   || animations[0]
        const walkSlowClip = getClip('Walk2') || getClip('Walk') || idleClip
        const walkClip   = getClip('Walk')   || walkSlowClip
        const attackClip = getClip('Attack') || getClip('Bite_ground') || idleClip

        this.animation.idleAction     = this.animation.mixer.clipAction(idleClip)
        this.animation.walkSlowAction = this.animation.mixer.clipAction(walkSlowClip)
        this.animation.walkAction     = this.animation.mixer.clipAction(walkClip)
        this.animation.runAction      = this.animation.walkAction
        this.animation.attackAction   = this.animation.mixer.clipAction(attackClip)

        this.animation.attackAction.setLoop(THREE.LoopOnce)
        this.animation.attackAction.clampWhenFinished = false

        this.animation.current = this.animation.idleAction
        this.animation.current.reset().fadeIn(0.2).play()
    }

    playAnimation(action, fade = 0.25) {
        if (!action || action === this.animation?.current) return
        const previous = this.animation.current
        action.reset().fadeIn(fade).play()
        previous?.fadeOut(fade)
        this.animation.current = action
    }

    // ✅ Igual que ZombieEnemy: modo de movimiento variable
    updateMovementMode(delta, isChasing) {
        this.modeTimer += delta
        if (this.modeTimer < this.nextModeChange) return
        this.modeTimer = 0

        if (isChasing) {
            this.movementMode  = Math.random() < 0.7 ? 'run' : 'walk'
            this.nextModeChange = 1.4 + Math.random() * 1.6
        } else {
            this.movementMode  = Math.random() < 0.45 ? 'walk' : 'walk2'
            this.nextModeChange = 2.5 + Math.random() * 3
        }
    }

    _killPlayer() {
        if (this.hasTriggeredDefeat) return
        const now = Date.now()
        if (now - this.lastAttackTime < this.attackCooldown) return
        this.lastAttackTime = now
        this.hasTriggeredDefeat = true
        this.experience.world?.triggerDefeat?.()
    }

    stopMoving(action) {
        if (!this.body) return
        this.body.velocity.set(0, 0, 0)
        this.model.position.copy(this.body.position)
        this.playAnimation(action || this.animation?.idleAction)
    }

    update(delta) {
        this.animation?.mixer?.update(delta)

        // ✅ Delay de activación — igual que ZombieEnemy
        if (this.delayActivation > 0) {
            this.delayActivation -= delta
            return
        }

        const robot = this.experience.world?.robot
        if (!robot?.body) return

        const playerPos = robot.body.position
        const enemyPos  = this.body.position
        const dx = playerPos.x - enemyPos.x
        const dz = playerPos.z - enemyPos.z
        const dist = Math.sqrt(dx * dx + dz * dz)

        // Atacar si está muy cerca
        if (dist < this.attackDistance) {
            this.stopMoving(this.animation?.attackAction || this.animation?.idleAction)
            this._killPlayer()
            return
        }

        // ✅ Lógica de detección con zona de liberación — igual que ZombieEnemy
        this.isChasing = this.isChasing
            ? dist < this.releaseRadius
            : dist < this.detectionRadius

        this.updateMovementMode(delta, this.isChasing)

        if (!this.isChasing) {
            this.stopMoving()
            return
        }

        // ✅ Velocidad según modo — igual que ZombieEnemy
        let speed  = this.chaseSpeed * 0.78
        let action = this.animation?.walkAction || this.animation?.walkSlowAction

        if (this.movementMode === 'run') {
            speed  = this.chaseSpeed
            action = this.animation?.runAction || this.animation?.walkAction
        }

        // Mover hacia el jugador
        const len = Math.sqrt(dx * dx + dz * dz)
        if (len > 0.35) {
            const nx = dx / len
            const nz = dz / len
            // ✅ Velocidad directa sin acumulación — igual que ZombieEnemy
            this.body.velocity.x = nx * speed
            this.body.velocity.y = 0
            this.body.velocity.z = nz * speed
            this.body.position.y = playerPos.y  // flotar al nivel del jugador

            if (action) action.timeScale = Math.min(1.9, Math.max(0.7, speed / this.baseSpeed))
            this.playAnimation(action)
            this.model.rotation.y = Math.atan2(dx, dz)
        } else {
            this.stopMoving()
        }

        this.model.position.copy(this.body.position)

        // Sonido de proximidad
        if (dist < 12) {
            const vol = (1 - dist / 12) * 0.65
            if (!this.alertSoundPlaying) {
                this.proximitySound?.play?.()
                this.alertSoundPlaying = true
            }
            this.proximitySound?.setVolume?.(vol)
        } else {
            this.proximitySound?.setVolume?.(0)
            if (this.alertSoundPlaying) {
                this.proximitySound?.stop?.()
                this.alertSoundPlaying = false
            }
        }
    }

    destroy() {
        this.animation?.mixer?.stopAllAction()
        this.proximitySound?.stop?.()
        if (this.model) this.scene.remove(this.model)
        if (this.body) {
            this.body.removeEventListener('collide', this._onCollide)
            if (this.physicsWorld.bodies.includes(this.body))
                this.physicsWorld.removeBody(this.body)
            this.body = null
        }
    }
}