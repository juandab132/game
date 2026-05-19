import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// ─────────────────────────────────────────────────────────────
// Prize — moneda o portal procedural (sin GLB externo)
//
//   role "default"    → moneda giratoria dorada
//   role "finalPrize" → portal (anillo azul/morado), oculto
//                       hasta que se recogen todas las monedas
// ─────────────────────────────────────────────────────────────
export default class Prize {
    constructor({ model, position, scene, role }) {
        this.scene     = scene
        this.role      = role
        this.collected = false
        this.pivot     = null
        this._time     = 0

        if (role === 'default') {
            this._buildCoin(position)
        } else if (role === 'finalPrize') {
            this._buildPortal(position)
        }
    }

    // ── Moneda: cilindro dorado giratorio ────────────────────
    _buildCoin(position) {
        const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24)
        const mat = new THREE.MeshStandardMaterial({
            color:             0xFFD700,
            metalness:         0.8,
            roughness:         0.2,
            emissive:          0xFFAA00,
            emissiveIntensity: 0.3
        })
        this.pivot = new THREE.Mesh(geo, mat)
        this.pivot.position.copy(position)
        this.pivot.castShadow = true
        this.scene.add(this.pivot)
    }

    // ── Portal: anillo con luz dinámica ──────────────────────
    _buildPortal(position) {
        const group = new THREE.Group()
        group.position.copy(position)

        // Anillo exterior
        const torusGeo = new THREE.TorusGeometry(1.2, 0.18, 16, 60)
        const torusMat = new THREE.MeshStandardMaterial({
            color:             0x8800ff,
            emissive:          0x6600cc,
            emissiveIntensity: 1.2,
            metalness:         0.6,
            roughness:         0.2
        })
        const torus = new THREE.Mesh(torusGeo, torusMat)
        group.add(torus)

        // Disco interior semitransparente
        const discGeo = new THREE.CircleGeometry(1.0, 32)
        const discMat = new THREE.MeshStandardMaterial({
            color:             0x4400ff,
            emissive:          0x2200aa,
            emissiveIntensity: 0.8,
            transparent:       true,
            opacity:           0.55,
            side:              THREE.DoubleSide
        })
        const disc = new THREE.Mesh(discGeo, discMat)
        group.add(disc)

        // Luz puntual dentro del portal
        const light = new THREE.PointLight(0x8800ff, 2, 6)
        group.add(light)

        this.pivot         = group
        this.pivot.visible = false   // oculto hasta activarse
        this.scene.add(this.pivot)
    }

    // ── Animación por frame ───────────────────────────────────
    update(delta) {
        if (!this.pivot || this.collected) return
        this._time += delta

        if (this.role === 'default') {
            // Moneda: gira y flota suavemente
            this.pivot.rotation.y  += delta * 2.5
            this.pivot.position.y  += Math.sin(this._time * 3) * 0.003
        } else if (this.role === 'finalPrize' && this.pivot.visible) {
            // Portal: gira lentamente
            this.pivot.rotation.y += delta * 0.8
        }
    }

    // ── Recolección de moneda ─────────────────────────────────
    collect() {
        if (this.collected) return
        this.collected = true
        if (this.pivot) this.scene.remove(this.pivot)
    }
}