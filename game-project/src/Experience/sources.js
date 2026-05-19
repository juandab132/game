// src/Experience/sources.js
// ─────────────────────────────────────────────────────────────
// Recursos globales del juego (texturas, personajes, monedas,
// portal) + todos los modelos del Nivel 1 exportados desde Blender.
// ─────────────────────────────────────────────────────────────

export default [
    // ── Texturas del entorno ─────────────────────────────────
    {
        name: 'environmentMapTexture',
        type: 'cubeTexture',
        path: [
            '/textures/environmentMap/px.jpg',
            '/textures/environmentMap/nx.jpg',
            '/textures/environmentMap/py.jpg',
            '/textures/environmentMap/ny.jpg',
            '/textures/environmentMap/pz.jpg',
            '/textures/environmentMap/nz.jpg'
        ]
    },
    {
        name: 'grassColorTexture',
        type: 'texture',
        path: '/textures/dirt/color.jpg'
    },
    {
        name: 'grassNormalTexture',
        type: 'texture',
        path: '/textures/dirt/normal.jpg'
    },

    // ── Personajes ───────────────────────────────────────────
    {
        name: 'foxModel',       // Enemigo (Zombie)
        type: 'gltfModel',
        path: '/models/Zombie (1).glb'
    },
    {
        name: 'robotModel',     // Jugador (Punk)
        type: 'gltfModel',
        path: '/models/Punk.glb'
    },

    

    // ── NIVEL 1 — modelos exportados desde Blender ───────────
    { name: 'legleft_lev1',                  type: 'gltfModel', path: '/models/nivel1/legleft_lev1.glb' },
    { name: 'legright_lev1',                 type: 'gltfModel', path: '/models/nivel1/legright_lev1.glb' },
    { name: 'legleft.001_lev1',              type: 'gltfModel', path: '/models/nivel1/legleft.001_lev1.glb' },
    { name: 'legright.001_lev1',             type: 'gltfModel', path: '/models/nivel1/legright.001_lev1.glb' },
    { name: 'legleft.002_lev1',              type: 'gltfModel', path: '/models/nivel1/legleft.002_lev1.glb' },
    { name: 'legright.002_lev1',             type: 'gltfModel', path: '/models/nivel1/legright.002_lev1.glb' },
    { name: 'barrel_lev1',                   type: 'gltfModel', path: '/models/nivel1/barrel_lev1.glb' },
    { name: 'barrels_lev1',                  type: 'gltfModel', path: '/models/nivel1/barrels_lev1.glb' },
    { name: 'barrel.003_lev1',               type: 'gltfModel', path: '/models/nivel1/barrel.003_lev1.glb' },
    { name: 'barrel.004_lev1',               type: 'gltfModel', path: '/models/nivel1/barrel.004_lev1.glb' },
    { name: 'barrel.005_lev1',               type: 'gltfModel', path: '/models/nivel1/barrel.005_lev1.glb' },
    { name: 'barrel.006_lev1',               type: 'gltfModel', path: '/models/nivel1/barrel.006_lev1.glb' },
    { name: 'barrel.008_lev1',               type: 'gltfModel', path: '/models/nivel1/barrel.008_lev1.glb' },
    { name: 'corridor_lev1',                 type: 'gltfModel', path: '/models/nivel1/corridor_lev1.glb' },
    { name: 'corridor_cross_lev1',           type: 'gltfModel', path: '/models/nivel1/corridor_cross_lev1.glb' },
    { name: 'corridor_roof_lev1',            type: 'gltfModel', path: '/models/nivel1/corridor_roof_lev1.glb' },
    { name: 'craft_cargoa_lev1',             type: 'gltfModel', path: '/models/nivel1/craft_cargoa_lev1.glb' },
    { name: 'craft_cargob_lev1',             type: 'gltfModel', path: '/models/nivel1/craft_cargob_lev1.glb' },
    { name: 'craft_miner_lev1',              type: 'gltfModel', path: '/models/nivel1/craft_miner_lev1.glb' },
    { name: 'craft_racer_lev1',              type: 'gltfModel', path: '/models/nivel1/craft_racer_lev1.glb' },
    { name: 'craft_speedera_lev1',           type: 'gltfModel', path: '/models/nivel1/craft_speedera_lev1.glb' },
    { name: 'craft_speederb_lev1',           type: 'gltfModel', path: '/models/nivel1/craft_speederb_lev1.glb' },
    { name: 'craft_speederc_lev1',           type: 'gltfModel', path: '/models/nivel1/craft_speederc_lev1.glb' },
    { name: 'craft_speederd_lev1',           type: 'gltfModel', path: '/models/nivel1/craft_speederd_lev1.glb' },
    { name: 'crater_lev1',                   type: 'gltfModel', path: '/models/nivel1/crater_lev1.glb' },
    { name: 'craterlarge_lev1',              type: 'gltfModel', path: '/models/nivel1/craterlarge_lev1.glb' },
    { name: 'desk_chair_lev1',               type: 'gltfModel', path: '/models/nivel1/desk_chair_lev1.glb' },
    { name: 'desk_chairstool_lev1',          type: 'gltfModel', path: '/models/nivel1/desk_chairstool_lev1.glb' },
    { name: 'desk_computerscreen_lev1',      type: 'gltfModel', path: '/models/nivel1/desk_computerscreen_lev1.glb' },
    { name: 'hangar_largeb_lev1',            type: 'gltfModel', path: '/models/nivel1/hangar_largeb_lev1.glb' },
    { name: 'gate.003_lev1',                 type: 'gltfModel', path: '/models/nivel1/gate.003_lev1.glb' },
    { name: 'hangar_rounda_lev1',            type: 'gltfModel', path: '/models/nivel1/hangar_rounda_lev1.glb' },
    { name: 'hangar_roundglass_lev1',        type: 'gltfModel', path: '/models/nivel1/hangar_roundglass_lev1.glb' },
    { name: 'machine_generatorlarge_lev1',   type: 'gltfModel', path: '/models/nivel1/machine_generatorlarge_lev1.glb' },
    { name: 'cable.001_lev1',                type: 'gltfModel', path: '/models/nivel1/cable.001_lev1.glb' },
    { name: 'monorail_trackstraight_lev1',   type: 'gltfModel', path: '/models/nivel1/monorail_trackstraight_lev1.glb' },
    { name: 'monorail_traincargo_lev1',      type: 'gltfModel', path: '/models/nivel1/monorail_traincargo_lev1.glb' },
    { name: 'load_lev1',                     type: 'gltfModel', path: '/models/nivel1/load_lev1.glb' },
    { name: 'pipe_cross_lev1',               type: 'gltfModel', path: '/models/nivel1/pipe_cross_lev1.glb' },
    { name: 'pipe_ramplarge_lev1',           type: 'gltfModel', path: '/models/nivel1/pipe_ramplarge_lev1.glb' },
    { name: 'pipe_rampsmall_lev1',           type: 'gltfModel', path: '/models/nivel1/pipe_rampsmall_lev1.glb' },
    { name: 'platform_high_lev1',            type: 'gltfModel', path: '/models/nivel1/platform_high_lev1.glb' },
    { name: 'platform_smalldiagonal_lev1',   type: 'gltfModel', path: '/models/nivel1/platform_smalldiagonal_lev1.glb' },
    { name: 'rail_lev1',                     type: 'gltfModel', path: '/models/nivel1/rail_lev1.glb' },
    { name: 'rail_end_lev1',                 type: 'gltfModel', path: '/models/nivel1/rail_end_lev1.glb' },
    { name: 'rail_middle_lev1',              type: 'gltfModel', path: '/models/nivel1/rail_middle_lev1.glb' },
    { name: 'rocket_basea_lev1',             type: 'gltfModel', path: '/models/nivel1/rocket_basea_lev1.glb' },
    { name: 'rocket_baseb_lev1',             type: 'gltfModel', path: '/models/nivel1/rocket_baseb_lev1.glb' },
    { name: 'rocket_fuela_lev1',             type: 'gltfModel', path: '/models/nivel1/rocket_fuela_lev1.glb' },
    { name: 'rocks_smalla_lev1',             type: 'gltfModel', path: '/models/nivel1/rocks_smalla_lev1.glb' },
    { name: 'structure_lev1',                type: 'gltfModel', path: '/models/nivel1/structure_lev1.glb' },
    { name: 'supports_high_lev1',            type: 'gltfModel', path: '/models/nivel1/supports_high_lev1.glb' },
    { name: 'terrain_side_lev1',             type: 'gltfModel', path: '/models/nivel1/terrain_side_lev1.glb' },
    { name: 'hangar_roundb.011_lev1',        type: 'gltfModel', path: '/models/nivel1/hangar_roundb.011_lev1.glb' },
    { name: 'hangar_roundb.036_lev1',        type: 'gltfModel', path: '/models/nivel1/hangar_roundb.036_lev1.glb' },
    { name: 'hangar_roundb.048_lev1',        type: 'gltfModel', path: '/models/nivel1/hangar_roundb.048_lev1.glb' },
    { name: 'hangar_roundb.049_lev1',        type: 'gltfModel', path: '/models/nivel1/hangar_roundb.049_lev1.glb' },
    { name: 'hangar_roundb.050_lev1',        type: 'gltfModel', path: '/models/nivel1/hangar_roundb.050_lev1.glb' },
    { name: 'terreno_lev1',                  type: 'gltfModel', path: '/models/nivel1/terreno_lev1.glb' },
]