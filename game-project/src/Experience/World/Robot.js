import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

export default class Robot {
    constructor(experience) {
        this.experience    = experience
        this.scene         = experience.scene
        this.resources     = experience.resources
        this.time          = experience.time
        this.physics       = experience.physics
        this.keyboard      = experience.keyboard
        this.points        = 0

        this.setModel()
        this.setPhysics()
        this.setAnimation()
    }

    setModel() {
        // ✅ Igual que Adventurer: SkeletonUtils.clone + clonar materiales
        this.model = SkeletonUtils.clone(this.resources.items.robotModel.scene)
        this.model.scale.set(1.0, 1.0, 1.0)
        this.model.position.set(0, -0.3, 0)

        this.group = new THREE.Group()
        this.group.add(this.model)
        this.scene.add(this.group)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                if (child.material) {
                    child.material = Array.isArray(child.material)
                        ? child.material.map(m => m.clone())
                        : child.material.clone()
                }
            }
        })
    }

    setPhysics() {
        // ✅ Igual que Adventurer: body empieza dormido, se despierta con delay
        this.body = new CANNON.Body({
            mass:           10,
            shape:          new CANNON.Sphere(0.45),
            position:       new CANNON.Vec3(0, 2, 0),
            linearDamping:  0.4,
            angularDamping: 1.0
        })
        this.body.angularFactor.set(0, 0, 0)
        this.body.velocity.setZero()
        this.body.angularVelocity.setZero()
        // ✅ Dormir el body al inicio — como hace Adventurer
        this.body.sleep()
        this.body.material = this.physics.robotMaterial
        this.physics.world.addBody(this.body)

        // ✅ Despertar después de 100ms — igual que Adventurer
        setTimeout(() => { this.body.wakeUp() }, 100)
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        const anims = this.resources.items.robotModel.animations

        console.log('Animaciones del Punk:', anims.map(c => c.name))

        // Buscar por nombre — igual que Adventurer
        const clipMap = {}
        anims.forEach(clip => { clipMap[clip.name] = clip })

        this.animation.actions = {
            idle:    this.animation.mixer.clipAction(
                clipMap['CharacterArmature|Idle'] || anims[4] || anims[0]),
            walking: this.animation.mixer.clipAction(
                clipMap['CharacterArmature|Walk'] || anims[22] || anims[0]),
            running: this.animation.mixer.clipAction(
                clipMap['CharacterArmature|Run'] || anims[16] || anims[0]),
            jump:    this.animation.mixer.clipAction(
                clipMap['CharacterArmature|Roll'] || anims[15] || anims[0]),
            death:   this.animation.mixer.clipAction(
                clipMap['CharacterArmature|Death'] || anims[0]),
        }

        this.animation.actions.jump.setLoop(THREE.LoopOnce, 1)
        this.animation.actions.jump.clampWhenFinished  = true
        this.animation.actions.death.setLoop(THREE.LoopOnce, 1)
        this.animation.actions.death.clampWhenFinished = true

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        this.animation.play = (name) => {
            const next = this.animation.actions[name]
            const curr = this.animation.actions.current
            if (!next || next === curr) return
            next.reset().play().crossFadeFrom(curr, 0.25)
            this.animation.actions.current = next
        }
    }

    isGrounded() {
        if (!this.body) return false
        const start = this.body.position
        const end   = new CANNON.Vec3(start.x, start.y - 0.6, start.z)
        const result = new CANNON.RaycastResult()
        this.physics.world.raycastClosest(start, end, { skipBackfaces: true }, result)
        return result.hasHit
    }

    update() {
        if (!this.body) return

        const delta = this.time.delta * 0.001
        this.animation.mixer.update(delta)

        if (this.animation.actions.current === this.animation.actions.death) return

        const keys      = this.keyboard.getState()
        const isShift   = keys.shift || false
        // ✅ Igual que Adventurer: applyForce en lugar de velocity directa
        const moveForce = isShift ? 120 : 75
        const maxSpeed  = isShift ? 10  : 6
        const turnSpeed = 2.5
        let isMoving    = false

        if (keys.left)  this.group.rotation.y += turnSpeed * delta
        if (keys.right) this.group.rotation.y -= turnSpeed * delta
        this.body.quaternion.setFromEuler(0, this.group.rotation.y, 0)

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion)

        if (keys.up) {
            this.body.applyForce(
                new CANNON.Vec3(forward.x * moveForce, 0, forward.z * moveForce),
                this.body.position
            )
            isMoving = true
        }
        if (keys.down) {
            const back = forward.clone().multiplyScalar(-1)
            this.body.applyForce(
                new CANNON.Vec3(back.x * moveForce, 0, back.z * moveForce),
                this.body.position
            )
            isMoving = true
        }

        // ✅ Limitar velocidad horizontal — igual que Adventurer
        const vx = this.body.velocity.x
        const vz = this.body.velocity.z
        const hSpeed = Math.sqrt(vx * vx + vz * vz)
        if (hSpeed > maxSpeed) {
            const scale = maxSpeed / hSpeed
            this.body.velocity.x = vx * scale
            this.body.velocity.z = vz * scale
        }

        // Freno cuando no se presiona tecla
        if (!keys.up && !keys.down) {
            this.body.velocity.x *= 0.75
            this.body.velocity.z *= 0.75
        }

        // Salto — solo si está en el suelo
        if (keys.space && this.isGrounded()) {
            this.body.velocity.y = 6.5
            this.animation.play('jump')
            this.group.position.copy(this.body.position)
            return
        }

        // Respawn si cae
        if (this.body.position.y < -5) {
            this.body.position.set(0, 3, 0)
            this.body.velocity.set(0, 0, 0)
        }

        // Animaciones
        const curr      = this.animation.actions.current
        const isJumping = curr === this.animation.actions.jump
        const isDead    = curr === this.animation.actions.death

        if (!isJumping && !isDead) {
            if (isMoving) {
                isShift
                    ? this.animation.play('running')
                    : this.animation.play('walking')
            } else {
                this.animation.play('idle')
            }
        }

        this.group.position.copy(this.body.position)
    }

    die() {
        this.animation.play('death')
    }

    revive() {
        if (!this.body) this.setPhysics()
        this.group.rotation.set(0, 0, 0)
        this.animation.actions.death?.stop()
        this.animation.actions.idle?.reset().play()
        this.animation.actions.current = this.animation.actions.idle
    }
}