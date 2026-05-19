import * as THREE from 'three'

export default class ThirdPersonCamera {
    constructor(experience, target) {
        this.experience = experience
        this.camera     = experience.camera.instance
        this.target     = target  // this.robot.group
        this._initialized = false
    }

    update() {
        if (!this.target) return

        const pos = this.target.position   // posición del robot

        // Dirección que mira el robot en el plano XZ
        const angle  = this.target.rotation.y
        const sinA   = Math.sin(angle)
        const cosA   = Math.cos(angle)

        // Cámara: 10 unidades DETRÁS del robot (dirección opuesta al frente)
        // y 6 unidades ARRIBA
        const camX = pos.x - sinA * 10
        const camY = pos.y + 6
        const camZ = pos.z - cosA * 10

        if (!this._initialized) {
            // Primera vez: posición instantánea sin lerp
            this.camera.position.set(camX, camY, camZ)
            this._initialized = true
        } else {
            this.camera.position.x += (camX - this.camera.position.x) * 0.1
            this.camera.position.y += (camY - this.camera.position.y) * 0.1
            this.camera.position.z += (camZ - this.camera.position.z) * 0.1
        }

        // Mirar al robot con offset vertical para ver bien al personaje
        this.camera.lookAt(pos.x, pos.y + 1.5, pos.z)
    }
}