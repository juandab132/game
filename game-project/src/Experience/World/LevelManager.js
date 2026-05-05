export default class LevelManager {
    constructor(experience) {
        this.experience = experience;
        
        // Actualizamos a los 5 niveles que subimos a la base de datos
        this.currentLevel = 1;
        this.totalLevels = 5;

        // Definimos cuántas monedas hay que recoger en cada nivel para activar el portal
        // Como en el seed.js pusimos 5 monedas por nivel, aquí ponemos 5
        this.levelTargets = {
            1: 5,
            2: 5,
            3: 5,
            4: 5,
            5: 5
        };
    }

    /**
     * Actividad 2 & 5: Verifica cuántos puntos se necesitan para el nivel actual
     */
    getCurrentLevelTargetPoints() {
        return this.levelTargets[this.currentLevel] || 5;
    }

    /**
     * Actividad 4: Cambia de nivel consultando la API de MongoDB
     */
    async nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.currentLevel++;
            console.log(`🚀 Preparando Nivel ${this.currentLevel}...`);

            // 1. Limpiamos visuales y físicas del nivel anterior
            this.experience.world.clearCurrentScene();

            // 2. Cargamos el nuevo nivel desde MongoDB a través del World
            // loadLevel ya se encarga de resetear la posición del robot con el spawnPoint de la API
            await this.experience.world.loadLevel(this.currentLevel);

            // 3. Notificación visual opcional
            if(this.experience.modal) {
                this.experience.modal.show({
                    icon: '🎮',
                    message: `¡Nivel ${this.currentLevel - 1} Superado!\nEntrando al Nivel ${this.currentLevel}`,
                    buttons: [{ text: '¡Vamos!', onClick: () => {} }]
                });
            }
        } else {
            console.log('🏆 ¡Has completado todos los niveles!');
        }
    }

    resetLevel() {
        this.currentLevel = 1;
        this.experience.world.clearCurrentScene();
        this.experience.world.loadLevel(this.currentLevel);
    }
}