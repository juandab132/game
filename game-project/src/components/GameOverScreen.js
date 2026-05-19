// ─────────────────────────────────────────────────────────────
// GameOverScreen.js
// Reintentar llama a window.experience.resetGameToFirstLevel()
// que ya existe en Experience.js y reinicia sin recargar página
// ─────────────────────────────────────────────────────────────

export function showGameOver({ points = 0, level = 1, reason = 'death' }) {
    const existing = document.getElementById('gameover-overlay')
    if (existing) existing.remove()

    const isDeath = reason === 'death'
    const color   = isDeath ? '#ef4444' : '#818cf8'
    const glow    = isDeath ? 'rgba(239,68,68,0.4)' : 'rgba(129,140,248,0.4)'

    const overlay = document.createElement('div')
    overlay.id = 'gameover-overlay'
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:99999;
        background:${isDeath
            ? 'radial-gradient(ellipse at center,rgba(80,0,0,0.97),rgba(10,0,0,0.98))'
            : 'radial-gradient(ellipse at center,rgba(0,30,80,0.97),rgba(5,0,30,0.98))'};
        display:flex;align-items:center;justify-content:center;
        font-family:system-ui,sans-serif;
    `
    overlay.innerHTML = `
        <style>#go-btn:hover { transform:translateY(-2px); }</style>
        <div style="text-align:center;color:white;padding:0 20px;max-width:420px;width:100%;">
            <div style="font-size:80px;margin-bottom:16px">${isDeath ? '💀' : '🏆'}</div>
            <h1 style="margin:12px 0 8px;font-size:36px;font-weight:800;color:${color}">
                ${isDeath ? '¡GAME OVER!' : '¡JUEGO COMPLETADO!'}
            </h1>
            <div style="margin:24px 0;background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.08);border-radius:16px;
                padding:20px;display:flex;">
                <div style="flex:1;border-right:1px solid rgba(255,255,255,0.08);">
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px">PUNTOS</div>
                    <div style="font-size:32px;font-weight:700;color:#fbbf24">${points}</div>
                </div>
                <div style="flex:1;">
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px">NIVEL</div>
                    <div style="font-size:32px;font-weight:700;color:#60a5fa">
                        ${level}<span style="font-size:14px;color:rgba(255,255,255,0.3)">/5</span>
                    </div>
                </div>
            </div>
            <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.35)">
                ${isDeath ? '¡Un zombie te atrapó!' : '¡Completaste todos los niveles!'}
            </p>
            <button id="go-btn" style="
                padding:15px 48px;border:none;cursor:pointer;
                background:linear-gradient(135deg,${isDeath ? '#dc2626,#991b1b' : '#6366f1,#4338ca'});
                color:white;font-size:16px;font-weight:700;border-radius:14px;
                box-shadow:0 6px 20px ${glow};transition:all 0.2s ease;">
                🔄 Reintentar
            </button>
        </div>
    `
    document.body.appendChild(overlay)

    document.getElementById('go-btn').onclick = async () => {
        overlay.remove()
        // ✅ Usar resetGameToFirstLevel() que ya existe en Experience
        // y reinicia el juego sin recargar la página ni perder la sesión
        if (window.experience?.resetGameToFirstLevel) {
            await window.experience.resetGameToFirstLevel()
        } else if (window.experience?.resetGame) {
            window.experience.resetGame()
        }
    }
}

export function showLevelComplete({ level, points, onContinue }) {
    const existing = document.getElementById('levelcomplete-overlay')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'levelcomplete-overlay'
    overlay.style.cssText = `
        position:fixed;inset:0;z-index:99998;
        background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);
        display:flex;align-items:center;justify-content:center;
        font-family:system-ui,sans-serif;
    `
    overlay.innerHTML = `
        <div style="text-align:center;color:white;max-width:380px;width:100%;
            background:rgba(255,255,255,0.04);border:1px solid rgba(139,92,246,0.25);
            border-radius:24px;padding:40px 32px;">
            <div style="font-size:60px;margin-bottom:12px">🏆</div>
            <h2 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#a78bfa">
                ¡Nivel ${level} Superado!
            </h2>
            <p style="margin:0 0 24px;color:rgba(255,255,255,0.4);font-size:14px">
                Puntos: <strong style="color:#fbbf24">${points}</strong>
            </p>
            <button id="lc-btn" style="
                padding:14px 40px;border:none;cursor:pointer;
                background:linear-gradient(135deg,#7c3aed,#2563eb);
                color:white;font-size:15px;font-weight:700;border-radius:12px;">
                ¡Vamos! 🚀
            </button>
        </div>
    `
    document.body.appendChild(overlay)
    document.getElementById('lc-btn').onclick = () => {
        overlay.remove()
        onContinue()
    }
}