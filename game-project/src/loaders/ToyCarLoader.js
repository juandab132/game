import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { createBoxShapeFromModel } from '../Experience/Utils/PhysicsShapeFactory.js'
import Prize from '../Experience/World/Prize.js'

export default class ToyCarLoader {
    constructor(experience) {
        this.experience = experience
        this.scene      = this.experience.scene
        this.resources  = this.experience.resources
        this.physics    = this.experience.physics
        this.prizes     = []
    }

    // ─────────────────────────────────────────────────────────
    // Procesa un array de bloques del toy_car_blocks.json
    //
    // Formato esperado por bloque:
    //   { name, x, y, z, role }
    //
    //   role "mapa"       → GLB del terreno, física Trimesh
    //   role "obstacle"   → GLB de objeto, física Box
    //   role "default"    → moneda procedural (Prize)
    //   role "finalPrize" → portal procedural (Prize), oculto hasta activarse
    //
    // precisePhysicsModels → array de names que usan Trimesh en lugar de Box
    // ─────────────────────────────────────────────────────────
    async _processBlocks(blocks, precisePhysicsModels = []) {
        for (const block of blocks) {
            const resourceKey = block.name
            const isCoin      = block.role === 'default'
            const isPortal    = block.role === 'finalPrize'

            // ── Monedas y portal: Prize procedural ───────────
            if (isCoin || isPortal) {
                const prize = new Prize({
                    model:    null,
                    position: new THREE.Vector3(block.x, block.y, block.z),
                    scene:    this.scene,
                    role:     block.role
                })
                this.prizes.push(prize)
                continue
            }

            // ── GLB: verificar que el recurso esté cargado ───
            const glb = this.resources.items[resourceKey]
            if (!glb) {
                console.warn(`⚠️ Modelo "${resourceKey}" no encontrado en resources — verifica sources.js`)
                continue
            }

            // Clonar y posicionar el modelo en la escena
            const model = glb.scene.clone()
            model.position.set(block.x, block.y, block.z)
            model.userData.levelObject = true
            this.scene.add(model)
            model.updateMatrixWorld(true)

            // ── Físicas ──────────────────────────────────────
            if (precisePhysicsModels.includes(resourceKey)) {
                // Terreno/mapa complejo → Trimesh (colisión exacta)
                model.traverse((child) => {
                    if (!child.isMesh) return

                    const geom = child.geometry.clone()
                    geom.applyMatrix4(child.matrixWorld)

                    const verts = Float32Array.from(geom.attributes.position.array)
                    const idx   = geom.index
                        ? Uint16Array.from(geom.index.array)
                        : Uint16Array.from(geom.attributes.position.array.map((_, i) => i))

                    const shape = new CANNON.Trimesh(verts, idx)
                    const body  = new CANNON.Body({
                        mass:     0,
                        shape,
                        material: this.physics.obstacleMaterial
                    })
                    body.userData = { levelBody: true }
                    this.physics.world.addBody(body)
                })
            } else {
                // Objetos simples → Box (más eficiente)
                const shape  = createBoxShapeFromModel(model, 0.9)
                const bbox   = new THREE.Box3().setFromObject(model)
                const center = new THREE.Vector3()
                bbox.getCenter(center)

                const body = new CANNON.Body({
                    mass:     0,
                    shape,
                    position: new CANNON.Vec3(center.x, center.y, center.z),
                    material: this.physics.obstacleMaterial
                })
                body.userData = { levelBody: true }
                this.physics.world.addBody(body)
            }
        }
    }
}