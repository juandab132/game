import { useEffect, useRef, useState } from 'react'
import Experience from './Experience/Experience'
import LoginScreen from './components/LoginScreen'
import authService from './services/authService'
import './styles/loader.css'

const App = () => {
  const canvasRef = useRef()
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  // Solo arranca el juego DESPUÉS de que el usuario inicia sesión
  useEffect(() => {
    if (!loggedIn) return

    const experience = new Experience(canvasRef.current)

    const handleProgress = (e) => setProgress(e.detail)
    const handleComplete = () => setLoading(false)

    window.addEventListener('resource-progress', handleProgress)
    window.addEventListener('resource-complete', handleComplete)

    return () => {
      window.removeEventListener('resource-progress', handleProgress)
      window.removeEventListener('resource-complete', handleComplete)
    }
  }, [loggedIn])

  const handleLogin = (user) => {
    setUsername(user)
    setLoggedIn(true)
  }

  // Si no está logueado, mostrar pantalla de login
  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <>
      {loading && (
        <div id="loader-overlay">
          <div id="loader-bar" style={{ width: `${progress}%` }}></div>
          <div id="loader-text">Cargando... {progress}%</div>
        </div>
      )}

      {/* Nombre del usuario en esquina */}
      {!loading && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          color: 'white', padding: '6px 14px', borderRadius: '20px',
          fontSize: '13px', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)'
        }}>
          👤 {username}
        </div>
      )}

      <canvas ref={canvasRef} className="webgl" />
    </>
  )
}

export default App