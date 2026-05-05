import { useState, useEffect } from 'react'
import authService from '../services/authService'

// Partículas de fondo animadas
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes glitch {
          0%, 90%, 100% { clip-path: none; transform: none; }
          92% { clip-path: inset(20% 0 60% 0); transform: translateX(-4px); }
          94% { clip-path: inset(60% 0 10% 0); transform: translateX(4px); }
          96% { clip-path: none; transform: none; }
        }
        .login-card {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .logo-float {
          animation: float 3s ease-in-out infinite;
        }
        .game-title {
          animation: glitch 6s ease-in-out infinite;
        }
        .input-field {
          transition: all 0.2s ease;
          outline: none;
        }
        .input-field:focus {
          border-color: rgba(139, 92, 246, 0.8) !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15), 0 0 20px rgba(139, 92, 246, 0.1);
          background: rgba(139, 92, 246, 0.08) !important;
        }
        .tab-btn {
          transition: all 0.25s ease;
        }
        .submit-btn {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5) !important;
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .submit-btn:hover::after { opacity: 1; }
      `}</style>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          borderRadius: '50%',
          background: s.size > 2 ? '#a78bfa' : '#e2e8f0',
          animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`
        }} />
      ))}
    </div>
  )
}

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!username.trim()) return setError('Ingresá tu nombre de usuario')
    if (!password.trim()) return setError('Ingresá tu contraseña')
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await authService.register(username, password)
      } else {
        await authService.login(username, password)
      }
      setSuccess(true)
      setTimeout(() => onLogin(username), 800)
    } catch (err) {
      if (err.message.includes('fetch') || err.message.includes('Failed') || err.message.includes('NetworkError')) {
        authService.loginOffline(username)
        setSuccess(true)
        setTimeout(() => onLogin(username), 800)
      } else {
        setError(err.message)
        setLoading(false)
      }
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0a0a1a 40%, #000510 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <StarField />

      {/* Líneas de grid decorativas */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }} />

      {/* Orbes de luz */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '8%', width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />

      {/* Card principal */}
      <div className="login-card" style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '400px',
        margin: '0 16px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 64px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.08)'
      }}>

        {/* Línea de scan animada */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
          animation: 'scan 4s linear infinite',
          pointerEvents: 'none', borderRadius: '24px'
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="logo-float" style={{ marginBottom: '16px' }}>
            {/* Ícono con anillo pulsante */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                position: 'absolute', inset: '-8px', borderRadius: '50%',
                border: '2px solid rgba(139,92,246,0.4)',
                animation: 'pulse-ring 2s ease-out infinite'
              }} />
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', boxShadow: '0 0 30px rgba(139,92,246,0.4)'
              }}>🎮</div>
            </div>
          </div>

          <h1 className="game-title" style={{
            margin: '0 0 4px',
            fontSize: '22px', fontWeight: 700,
            color: '#f1f5f9', letterSpacing: '-0.3px'
          }}>
            VIDEOJUEGO 3D
          </h1>
          <p style={{
            margin: 0, fontSize: '12px',
            color: 'rgba(148,163,184,0.6)',
            letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>
            Universidad Cooperativa · UCC
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px', padding: '4px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {[
            { key: 'login',    label: 'Iniciar sesión', icon: '🔑' },
            { key: 'register', label: 'Registrarse',    icon: '✨' }
          ].map(({ key, label, icon }) => (
            <button key={key} className="tab-btn"
              onClick={() => { setMode(key); setError('') }}
              style={{
                flex: 1, padding: '9px 12px',
                border: 'none', cursor: 'pointer',
                borderRadius: '9px', fontSize: '13px', fontWeight: 500,
                background: mode === key
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(37,99,235,0.4))'
                  : 'transparent',
                color: mode === key ? '#e2e8f0' : 'rgba(148,163,184,0.5)',
                boxShadow: mode === key ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                border: mode === key ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent'
              }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
          <div>
            <label style={{
              display: 'block', marginBottom: '6px',
              fontSize: '12px', color: 'rgba(148,163,184,0.7)',
              letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>Usuario</label>
            <input
              className="input-field"
              type="text"
              placeholder="tu_nombre"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px',
                boxSizing: 'border-box',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: '#f1f5f9', fontSize: '14px',
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block', marginBottom: '6px',
              fontSize: '12px', color: 'rgba(148,163,184,0.7)',
              letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>Contraseña</label>
            <input
              className="input-field"
              type="password"
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px',
                boxSizing: 'border-box',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: '#f1f5f9', fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            margin: '12px 0',
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Éxito */}
        {success && (
          <div style={{
            margin: '12px 0',
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            color: '#86efac', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>✅</span> ¡Entrando al juego...
          </div>
        )}

        {/* Botón */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || success}
          style={{
            width: '100%', marginTop: '20px',
            padding: '14px',
            borderRadius: '12px', border: 'none',
            cursor: (loading || success) ? 'not-allowed' : 'pointer',
            background: (loading || success)
              ? 'rgba(99,102,241,0.3)'
              : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            color: 'white', fontSize: '15px', fontWeight: 600,
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            letterSpacing: '0.02em'
          }}>
          {loading ? '⏳ Verificando...'
            : success ? '🚀 ¡Cargando!'
            : mode === 'login' ? '🎮 Jugar'
            : '✅ Crear cuenta y jugar'}
        </button>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '20px', marginBottom: 0,
          fontSize: '11px', color: 'rgba(148,163,184,0.35)',
          lineHeight: 1.6
        }}>
          Sin servidor activo entrarás en modo sin conexión
        </p>
      </div>
    </div>
  )
}