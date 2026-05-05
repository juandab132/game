import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class Robot {
    constructor(experience) {
        this.experience = experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.physics = this.experience.physics
        this.keyboard = this.experience.keyboard

        this.setModel()
        this.setPhysics()
        this.setAnimation()
    }

    setModel() {
        this.model = this.resources.items.robotModel.scene
        this.model.scale.set(0.3, 0.3, 0.3)
        this.model.position.y = -0.4 

        this.group = new THREE.Group()
        this.group.add(this.model)
        this.scene.add(this.group)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) child.castShadow = true
        })
    }

    setPhysics() {
        const shape = new CANNON.Sphere(0.4)
        this.body = new CANNON.Body({
            mass: 10,
            shape: shape,
            position: new CANNON.Vec3(0, 5, 0),
            linearDamping: 0.92, // Freno de aire para mayor control
            angularDamping: 0.99
        })

        this.body.angularFactor.set(0, 1, 0)
        this.body.material = this.physics.robotMaterial
        
        // Blindaje CCD para evitar que el robot se entierre en el mapa
        this.body.collisionResponse = true;
        this.body.ccdSpeedThreshold = 0.4; 
        this.body.ccdRadius = 0.35;

        this.physics.world.addBody(this.body)
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)
        const anims = this.resources.items.robotModel.animations
        
        this.animation.actions = {
            idle: this.animation.mixer.clipAction(anims[2]),
            walking: this.animation.mixer.clipAction(anims[10]),
            jump: this.animation.mixer.clipAction(anims[3])
        }
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        this.animation.play = (name) => {
            const next = this.animation.actions[name]
            const curr = this.animation.actions.current
            if (next !== curr) {
                next.reset().play().crossFadeFrom(curr, 0.2)
                this.animation.actions.current = next
            }
        }
    }

    update() {
        if (!this.body || this.body.type === CANNON.Body.STATIC) return
        
        const delta = this.time.delta * 0.001
        this.animation.mixer.update(delta)

        const keys = this.keyboard.getState()
        const turnSpeed = 3.2 
        let isMoving = false

        if (keys.left) this.group.rotation.y += turnSpeed * delta
        if (keys.right) this.group.rotation.y -= turnSpeed * delta
        this.body.quaternion.setFromEuler(0, this.group.rotation.y, 0)

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.group.quaternion)

        // Fuerzas ajustadas para evitar que el robot "vuele"
        const moveForce = 1100; 
        const MAX_SPEED = 5.5; 

        let currentVelH = new THREE.Vector2(this.body.velocity.x, this.body.velocity.z);
        
        if (keys.up && currentVelH.length() < MAX_SPEED) {
            this.body.applyForce(
                new CANNON.Vec3(forward.x * moveForce, 0, forward.z * moveForce), 
                this.body.position
            )
            isMoving = true
        }
        if (keys.down && currentVelH.length() < MAX_SPEED) {
            this.body.applyForce(
                new CANNON.Vec3(-forward.x * moveForce, 0, -forward.z * moveForce), 
                this.body.position
            )
            isMoving = true
        }

        // Freno automático para que el robot se sienta "pesado"
        if (!isMoving) {
            this.body.velocity.x *= 0.88;
            this.body.velocity.z *= 0.88;
        }

        // Salto con impulso vertical fijo
        if (keys.space && Math.abs(this.body.velocity.y) < 0.1) {
            this.body.applyImpulse(new CANNON.Vec3(0, 5.5, 0))
            this.animation.play('jump')
        }

        // Control de animaciones
        if (isMoving) {
            if (this.animation.actions.current !== this.animation.actions.walking) this.animation.play('walking')
        } else {
            this.animation.play('idle')
        }

        this.group.position.copy(this.body.position)
    }
}