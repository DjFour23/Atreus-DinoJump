import React, { useState, useEffect } from 'react';
import './App.css'; 

const INVITATION_IMAGE_URL = '/invitacion.jpg'; 
const DINO_SPRITE_URL = '/dino.png'; 
const GOOGLE_MAPS_LINK = 'https://maps.app.goo.gl/TuDireccionReal';
const GOOGLE_FORM_LINK = 'https://forms.gle/TuFormularioReal';

// Mapa de nuestra pirámide. (0,0) es el inicio.
const PLATFORMS = [
  { col: 0, row: 0, label: '' }, 
  { col: -1, row: 1, label: '1' }, { col: 1, row: 1, label: '2' },
  { col: -2, row: 2, label: '3' }, { col: 0, row: 2, label: '4' }, { col: 2, row: 2, label: '5' },
  { col: -1, row: 3, label: '6' }, { col: 1, row: 3, label: '7' },
  { col: 0, row: 4, isGoal: true } 
];

function App() {
  const [playerPos, setPlayerPos] = useState({ col: 0, row: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [isJumping, setIsJumping] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (gameStatus !== 'playing') return;
    if (timeLeft <= 0) {
      setGameStatus('lost');
      setShowModal(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameStatus]);

  // Acepta un objeto de movimiento: { dCol: -1|1, dRow: 1|-1 }
  const handleJump = (move) => {
    // AHORA: Mientras no estés cayendo, ¡puedes moverte siempre!
    if (isJumping || isFalling) return;
    
    setIsJumping(true);
    
    // Cambiamos la posición horizontal INMEDIATAMENTE
    // para que avance MIENTRAS hace la parábola vertical
    const nextCol = playerPos.col + move.dCol;
    const nextRow = playerPos.row + move.dRow;

    setPlayerPos({ col: nextCol, row: nextRow });

    setTimeout(() => {
      setIsJumping(false);
      
      // Verificamos si existe una plataforma donde aterrizó
      const landedPlatform = PLATFORMS.find(p => p.col === nextCol && p.row === nextRow);

      if (!landedPlatform) {
        // Cayó al vacío
        setIsFalling(true);
        setTimeout(() => {
          setGameStatus('lost');
          setShowModal(true);
        }, 600); 
      } else if (landedPlatform.isGoal && gameStatus === 'playing') {
        setGameStatus('won');
        setShowModal(true);
      }
    }, 600); // 0.6s coincide con la transición CSS
  };

  const closeMenu = () => {
    setShowModal(false);
  };

  return (
    <div className="game-container">
      <header className="hud">
        <h1 className="game-title">ATREUS JUMP</h1>
        <div className={`timer ${timeLeft <= 10 ? 'alert' : ''}`}>Tiempo: {timeLeft}s</div>
      </header>

      {/* Escena Isométrica */}
      <main className="scene">
        
        {/* Generamos las plataformas dinámicamente usando variables CSS */}
        <div className="platforms-container">
          {PLATFORMS.map((plat, idx) => (
            <div 
              key={idx} 
              className={`platform ${plat.isGoal ? 'cube-goal' : ''}`}
              style={{ '--col': plat.col, '--row': plat.row }}
            >
              <div className={`cube-top ${plat.isGoal ? 'pattern-goal' : ''}`}></div>
              <div className="cube-front"></div>
              <div className="cube-right"></div>
              
              {plat.label && <div className="floating-num">{plat.label}</div>}
              {plat.isGoal && <div className="floating-num banner-goal">🏁</div>}
            </div>
          ))}
        </div>

        {/* Dinosaurio con Doble Animación (Parábola en U Invertida) */}
        <div 
          className={`dino-player ${isFalling ? 'falling' : ''}`}
          style={{ '--col': playerPos.col, '--row': playerPos.row }}
        >
          {/* El div se mueve en línea recta, la imagen hace el salto */}
          <img 
            src={DINO_SPRITE_URL} 
            alt="Dino" 
            className={isJumping && !isFalling ? 'jumping-arc' : ''} 
          />
        </div>

      </main>

      {/* Controles: Cuadrícula de salto isométrico completo (↖️ ↗️ ↙️ ↘️) */}
      <div className="controls">
        <div className="btn-grid">
            {/* Fila superior: Adelante */}
            <button className="btn-saltar left forward" onClick={() => handleJump({ dCol: -1, dRow: 1 })} disabled={isJumping || isFalling}>
              ↖️ Adelante Izq
            </button>
            <button className="btn-saltar right forward" onClick={() => handleJump({ dCol: 1, dRow: 1 })} disabled={isJumping || isFalling}>
              Adelante Der ↗️
            </button>
            
            {/* Fila inferior: Atrás */}
            <button className="btn-saltar left backward" onClick={() => handleJump({ dCol: -1, dRow: -1 })} disabled={isJumping || isFalling}>
              ↙️ Atrás Izq
            </button>
            <button className="btn-saltar right backward" onClick={() => handleJump({ dCol: 1, dRow: -1 })} disabled={isJumping || isFalling}>
              Atrás Der ↘️
            </button>
        </div>

        {/* Botón de la invitación siempre accesible una vez termina el juego */}
        {gameStatus !== 'playing' && (
           <button className="btn-invitacion" onClick={() => setShowModal(true)}>
             📩 VER INVITACIÓN
           </button>
        )}
      </div>

      {/* Modal Interactivo Cerrable */}
      {showModal && (
        <div className="modal-overlay" onClick={closeMenu}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="btn-cerrar" onClick={closeMenu}>X</button>
            <h2 className="modal-title">{gameStatus === 'won' ? '¡BRUTAL!' : '¡OUCH!'}</h2>
            <p className="modal-msg">
              {gameStatus === 'won' 
                ? '¡Llegaste a la meta, eres un crack!' 
                : (timeLeft <= 0 ? 'Se acabó el tiempo.' : 'Te caíste del trampolín.')}
              <br/> Pero la fiesta sigue:
            </p>
            <img src={INVITATION_IMAGE_URL} alt="Invitación" className="modal-img" />
            <div className="modal-buttons">
              <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noreferrer" className="btn-action">Maps</a>
              <a href={GOOGLE_FORM_LINK} target="_blank" rel="noreferrer" className="btn-action confirm">Asistiré</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;