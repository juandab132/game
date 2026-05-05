const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/Juanproyect'; // Base de datos correcta

const blockSchema = new mongoose.Schema({
    modelName: String,
    position: { x: Number, y: Number, z: Number },
    role: { type: String, default: 'obstacle' }, // Para diferenciar monedas de paredes
    level: Number
});

const Block = mongoose.model('Block', blockSchema);

const seedData = [
    // MONEDAS: Asegúrate que el modelName coincida con tu cargador de recursos
    { modelName: 'coin', position: { x: 5, y: 1, z: 5 }, role: 'default', level: 1 },
    { modelName: 'coin', position: { x: -5, y: 1, z: 10 }, role: 'default', level: 1 },
    { modelName: 'coin', position: { x: 0, y: 1, z: -5 }, role: 'default', level: 1 },
    { modelName: 'coin', position: { x: 10, y: 1, z: 0 }, role: 'default', level: 1 },
    { modelName: 'coin', position: { x: -8, y: 1, z: -8 }, role: 'default', level: 1 },
    
    // PORTAL
    { modelName: 'portal', position: { x: 0, y: 1, z: 20 }, role: 'finalPrize', level: 1 }
];

async function seedDB() {
    try {
        await mongoose.connect(mongoURI);
        await Block.deleteMany({}); 
        await Block.insertMany(seedData);
        console.log("✅ DB sincronizada con monedas y portal.");
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
}
seedDB();