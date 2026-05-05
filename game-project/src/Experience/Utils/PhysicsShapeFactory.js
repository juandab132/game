import * as CANNON from 'cannon-es'
import * as THREE from 'three'

/**
 * Crea una caja de colisión basada en el tamaño real del modelo.
 * @param {THREE.Object3D} model - El modelo 3D.
 * @param {number} scaleFactor - Ajuste de margen (1.0 = tamaño exacto).
 */
export function createBoxShapeFromModel(model, scaleFactor = 0.95) {
    const bbox = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    bbox.getSize(size)

    // Cannon-es usa 'halfExtents', por eso dividimos el tamaño total entre 2.
    // Aplicamos el scaleFactor para dar un pequeño margen de error.
    return new CANNON.Box(new CANNON.Vec3(
        (size.x / 2) * scaleFactor,
        (size.y / 2) * scaleFactor,
        (size.z / 2) * scaleFactor
    ))
}

export function createTrimeshShapeFromModel(model) {
    const mergedPositions = []
    const mergedIndices = []
    let vertexOffset = 0

    model.updateMatrixWorld(true) 

    model.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const geometry = child.geometry.clone().toNonIndexed()
            const position = geometry.attributes.position

            if (!position) return

            const vertexCount = position.count

            for (let i = 0; i < vertexCount; i++) {
                const vertex = new THREE.Vector3().fromBufferAttribute(position, i)
                vertex.applyMatrix4(child.matrixWorld) 
                mergedPositions.push(vertex.x, vertex.y, vertex.z)
            }

            for (let i = 0; i < vertexCount / 3; i++) {
                mergedIndices.push(
                    vertexOffset + i * 3,
                    vertexOffset + i * 3 + 1,
                    vertexOffset + i * 3 + 2
                )
            }

            vertexOffset += vertexCount
        }
    })

    if (mergedPositions.length === 0) {
        console.warn('❌ No se pudo construir un Trimesh: modelo sin vértices')
        return null
    }

    const vertices = new Float32Array(mergedPositions)
    const indices = new Uint16Array(mergedIndices)

    return new CANNON.Trimesh(vertices, indices)
}


