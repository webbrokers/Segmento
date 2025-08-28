import React, { useEffect, useState } from 'react'
import { initTelegram, getUserSafe } from './telegram.js'
import GameCanvas from './game/GameCanvas.jsx'

export default function App() {
  const [tgReady, setTgReady] = useState(false)
  const [username, setUsername] = useState('Игрок')
  const [showMenu, setShowMenu] = useState(true)
  const [best, setBest] = useState(() => Number(localStorage.getItem('best-score') || 0))

  useEffect(() => {
    const tg = initTelegram()
    setTgReady(!!tg)
    const u = getUserSafe()
    if (u?.first_name) setUsername(u.first_name)
  }, [])

  const onGameOver = (score) => {
    if (score > best) {
      setBest(score)
      localStorage.setItem('best-score', String(score))
    }
    setShowMenu(true)
  }

  return (
    <div className="safe" style={{display:'flex',flexDirection:'column',gap:12, width:'100%'}}>
      {showMenu ? (
        <Menu username={username} best={best} onStart={() => setShowMenu(false)} />
      ) : (
        <GameCanvas onGameOver={onGameOver} />
      )}
      <Footer tgReady={tgReady} />
    </div>
  )
}

function Menu({ username, best, onStart }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:16, alignItems:'center', width:'100%'}}>
      <h1 style={{margin:0, fontSize:28}}>Flappy TG</h1>
      <p style={{opacity:0.9, margin:0}}>Привет, {username}! Тапай по экрану, чтобы лететь.</p>
      <p style={{opacity:0.8, margin:'4px 0'}}>Лучший результат: <b>{best}</b></p>
      <button onClick={onStart}>Играть</button>
    </div>
  )
}

function Footer({ tgReady }) {
  return (
    <div style={{opacity:0.6, fontSize:12, textAlign:'center', width:'100%'}}>
      Telegram API: {tgReady ? 'активен' : 'нет'} • React + Canvas
    </div>
  )
}
