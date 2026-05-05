import * as THREE from 'three'

export default class Prize {
    constructor({ model, position, scene, role = 'default', sound = null }) {
        this.scene = scene
        this.collected = false
        this.role = role
        this.sound = sound
        this._time = Math.random() * Math.PI * 2  // offset aleatorio para que no giren igual

        this.pivot = new THREE.Group()
        this.pivot.position.copy(position)
        this.pivot.userData.interactivo = true
        this.pivot.userData.collected = false

        // ✅ Crear mesh procedural según el rol
        if (role === 'default') {
            this._buildCoin()
        } else if (role === 'finalPrize') {
            this._buildPortal()
        } else if (model) {
            // Fallback: usar GLB si se pasa
            const clone = model.clone()
            const visual = clone.children.find(c => c.isMesh) || clone
            const bbox = new THREE.Box3().setFromObject(visual)
            const center = new THREE.Vector3()
            bbox.getCenter(center)
            visual.position.sub(center)
            this.pivot.add(clone)
        }

        this.scene.add(this.pivot)

        // Portal empieza invisible hasta que se recolectan todas las coins
        if (role === 'finalPrize') this.pivot.visible = false

        console.log(`🎯 Premio [${role}] en (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`)
    }

    // ─── Moneda dorada giratoria ──────────────────────────────
    _buildCoin() {
        // Cuerpo de la moneda (cilindro fino)
        const geo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32)
        const mat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.3
        })
        this.mesh = new THREE.Mesh(geo, mat)
        this.mesh.castShadow = true
        this.pivot.add(this.mesh)

        // Borde brillante
        const ringGeo = new THREE.TorusGeometry(0.42, 0.04, 8, 32)
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0xFFF5A0,
            metalness: 1.0,
            roughness: 0.0
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = Math.PI / 2
        this.pivot.add(ring)

        // Luz puntual dorada
        const light = new THREE.PointLight(0xFFD700, 0.8, 3)
        this.pivot.add(light)
    }

    // ─── Portal vórtice con anillos ───────────────────────────
    _buildPortal() {
        this._portalRings = []

        // 3 anillos concéntricos que giran a distintas velocidades
        const colors = [0x8B5CF6, 0x6366F1, 0x3B82F6]
        const radii  = [1.2, 0.9, 0.6]

        colors.forEach((color, i) => {
            const geo = new THREE.TorusGeometry(radii[i], 0.06, 16, 64)
            const mat = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.8,
                metalness: 0.5,
                roughness: 0.1,
                transparent: true,
                opacity: 0.9
            })
            const ring = new THREE.Mesh(geo, mat)
            ring.rotation.x = Math.PI / 2
            ring.userData.rotSpeed = (i + 1) * 0.8  // cada anillo gira diferente
            this.pivot.add(ring)
            this._portalRings.push(ring)
        })

        // Centro del portal (disco semitransparente)
        const diskGeo = new THREE.CircleGeometry(0.55, 32)
        const diskMat = new THREE.MeshStandardMaterial({
            color: 0x818CF8,
            emissive: 0x4F46E5,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        })
        const disk = new THREE.Mesh(diskGeo, diskMat)
        disk.rotation.x = Math.PI / 2
        this.pivot.add(disk)

        // Partículas simples alrededor del portal
        const particleCount = 30
        const positions = new Float32Array(particleCount * 3)
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2
            const r = 1.2 + (Math.random() - 0.5) * 0.4
            positions[i * 3]     = Math.cos(angle) * r
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5
            positions[i * 3 + 2] = Math.sin(angle) * r
        }
        const pGeo = new THREE.BufferGeometry()
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const pMat = new THREE.PointsMaterial({
            color: 0xA78BFA, size: 0.08,
            transparent: true, opacity: 0.8
        })
        this._particles = new THREE.Points(pGeo, pMat)
        this.pivot.add(this._particles)

        // Luz puntual violeta
        const light = new THREE.PointLight(0x6366F1, 2, 6)
        this.pivot.add(light)

        // Texto flotante (cartel "PORTAL")
        this._buildPortalLabel()
    }

    _buildPortalLabel() {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'rgba(0,0,0,0)'
        ctx.clearRect(0, 0, 256, 64)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('⬆ PORTAL', 128, 44)

        const tex = new THREE.CanvasTexture(canvas)
        const geo = new THREE.PlaneGeometry(1.5, 0.4)
        const mat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true,
            side: THREE.DoubleSide, depthWrite: false
        })
        const label = new THREE.Mesh(geo, mat)
        label.position.y = 1.8
        this.pivot.add(label)
        this._label = label
    }

    // ─── Update: animaciones ──────────────────────────────────
    update(delta) {
        if (this.collected) return
        this._time += delta

        if (this.role === 'default') {
            // Moneda: gira sobre Y y flota suavemente
            this.pivot.rotation.y += delta * 2.5
            this.pivot.position.y += Math.sin(this._time * 2) * delta * 0.3
        } else if (this.role === 'finalPrize') {
            // Portal: anillos giran a distintas velocidades
            this._portalRings?.forEach((ring, i) => {
                ring.rotation.z += delta * ring.userData.rotSpeed
                ring.rotation.y += delta * (i % 2 === 0 ? 0.3 : -0.3)
            })
            // Partículas rotan lentamente
            if (this._particles) {
                this._particles.rotation.y += delta * 0.4
            }
            // Label siempre mira a la cámara
            if (this._label) {
                this._label.rotation.y += delta * 0.5
            }
        }
    }

    collect() {
        if (this.collected) return
        this.collected = true

        if (this.sound && typeof this.sound.play === 'function') {
            this.sound.play()
        }

        // Animación de desaparición
        this.pivot.traverse(child => {
            child.userData.collected = true
        })
        this.scene.remove(this.pivot)
    }
}