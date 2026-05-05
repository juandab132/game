import gsap from 'gsap'

export default class CircularMenu {
    constructor({ container, vrIntegration, onAudioToggle, onWalkMode, onFullscreen, onCancelGame }) {
        this.container = container
        this.vrIntegration = vrIntegration
        this.isOpen = false
        this.actionButtons = []

        // Estilos base
        const baseButtonStyle = `
            position: fixed;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(0, 255, 247, 0.12);
            color: #00fff7;
            font-size: 20px;
            border: 1px solid rgba(0, 255, 247, 0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px #00fff7;
            backdrop-filter: blur(4px);
            z-index: 9999;
            transition: all 0.3s ease;
        `

        const hoverStyle = `
            background: rgba(0, 255, 247, 0.25);
            box-shadow: 0 0 15px #00fff7, 0 0 30px #00fff7;
            transform: scale(1.1);
        `

        // Botón principal
        this.toggleButton = document.createElement('button')
        this.toggleButton.innerText = '⚙️'
        this.toggleButton.style.cssText = baseButtonStyle + 'top: 80px; right: 20px;'
        this.container.appendChild(this.toggleButton)
        this.toggleButton.addEventListener('click', () => this.toggleMenu())

        // Acciones del menú
        const actions = [
            { icon: '🔊', title: 'Audio', onClick: onAudioToggle },
            { icon: '🚶', title: 'Modo Caminata', onClick: onWalkMode },
            { icon: '🖥️', title: 'Pantalla Completa', onClick: onFullscreen },
            { icon: '🥽', title: 'Modo VR', onClick: () => this.vrIntegration.toggleVR() },
            { icon: '👨‍💻', title: 'Acerca de', onClick: () => this.showAboutModal() },
            { icon: '❌', title: 'Cancelar Juego', onClick: onCancelGame }
        ]

        actions.forEach((action, index) => {
            const btn = document.createElement('button')
            btn.innerText = action.icon
            btn.title = action.title
            btn.style.cssText = baseButtonStyle + `top: ${140 + index * 60}px; right: 20px; opacity: 0; pointer-events: none;`

            btn.addEventListener('click', () => {
                action.onClick()
                this.toggleMenu()
            })

            btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(0, 255, 247, 0.25)' })
            btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(0, 255, 247, 0.12)' })

            this.container.appendChild(btn)
            this.actionButtons.push(btn)
        })

        // HUD Elements
        const hudBase = `
            position: fixed;
            top: 16px;
            font-size: 16px;
            font-weight: bold;
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            z-index: 9999;
            font-family: monospace;
            pointer-events: none;
        `

        this.timer = this.createHudElement(hudBase + 'left: 16px;', '⏱ 0s')
        this.levelIndicator = this.createHudElement(hudBase + 'left: 110px; color: #00fff7;', '🌍 Nivel: 1')
        this.playersLabel = this.createHudElement(hudBase + 'left: 230px;', '👥 Jugadores: 1')
        this.status = this.createHudElement(hudBase + 'right: 20px;', '🎖️ Puntos: 0')
    }

    createHudElement(style, initialText) {
        const el = document.createElement('div')
        el.style.cssText = style
        el.innerText = initialText
        document.body.appendChild(el)
        return el
    }

    showAboutModal() {
        if (this.aboutContainer) return
        this.aboutContainer = document.createElement('div')
        this.aboutContainer.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95); padding: 20px; border-radius: 12px;
            color: #fff; z-index: 10000; textAlign: center; font-family: sans-serif;
            max-width: 300px; box-shadow: 0 0 20px #00fff7;
        `
        this.aboutContainer.innerHTML = `
            <h2 style="margin-bottom: 10px;">👨‍💻 Desarrollador</h2>
            <p>Juan David Sánchez Meza</p>
            <p style="font-size: 14px;">Ingeniería de Software</p>
            <button id="close-about" style="margin-top: 12px; padding: 6px 14px; background: #00fff7; border: none; border-radius: 6px; cursor: pointer; color: black;">Cerrar</button>
        `
        document.body.appendChild(this.aboutContainer)
        this.aboutContainer.querySelector('#close-about').onclick = () => {
            this.aboutContainer.remove()
            this.aboutContainer = null
        }
    }

    toggleMenu() {
        this.isOpen = !this.isOpen
        this.actionButtons.forEach((btn, index) => {
            gsap.to(btn, {
                opacity: this.isOpen ? 1 : 0,
                y: this.isOpen ? 0 : -10,
                pointerEvents: this.isOpen ? 'auto' : 'none',
                delay: index * 0.05,
                duration: 0.3
            })
        })
    }

    setStatus(text) { if (this.status) this.status.innerText = text }
    setTimer(seconds) { if (this.timer) this.timer.innerText = `⏱ ${seconds}s` }
    setPlayerCount(count) { if (this.playersLabel) this.playersLabel.innerText = `👥 Jugadores: ${count}` }
    setLevel(level) { if (this.levelIndicator) this.levelIndicator.innerText = `🌍 Nivel: ${level}` }

    destroy() {
        this.toggleButton?.remove()
        this.actionButtons.forEach(btn => btn.remove())
        this.timer?.remove()
        this.status?.remove()
        this.levelIndicator?.remove()
        this.playersLabel?.remove()
    }
}