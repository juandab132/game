import * as CANNON from 'cannon-es'

export default class Physics {
    constructor() {
        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.82, 0)
        this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        
        // CAMBIO: Desactivamos allowSleep temporalmente para evitar que el robot flote por error de inactividad
        this.world.allowSleep = false 

        this.defaultMaterial = new CANNON.Material('default')
        this.robotMaterial = new CANNON.Material('robot')
        this.obstacleMaterial = new CANNON.Material('obstacle')

        const defaultContact = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            { friction: 0.4, restitution: 0.0 }
        )
        this.world.defaultContactMaterial = defaultContact

        // Contacto Robot vs Escenario (Crucial para que no resbale y avance)
        const robotObstacleContact = new CANNON.ContactMaterial(
            this.robotMaterial,
            this.obstacleMaterial,
            {
                friction: 0.9,
                restitution: 0.0,
                contactEquationStiffness: 1e7, // Bajamos un poco la rigidez para que no rebote
                contactEquationRelaxation: 5,  // Más relajación evita que el motor de física "explote" al tocar el Trimesh
                frictionEquationStiffness: 1e6,
                frictionEquationRelaxation: 5
            }
        )
        this.world.addContactMaterial(robotObstacleContact)
    }

    update(delta) {
        // Quitamos el filtro manual de cuerpos porque corrompe el broadphase de Cannon
        try {
            // Usamos un step fijo de 1/60 para que la física sea estable
            this.world.step(1 / 60, delta, 3)
        } catch (err) {
            console.error('🚫 Cannon step error:', err)
        }
    }
}