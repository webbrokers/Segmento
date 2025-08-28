import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useGameLoop } from '../hooks/useGameLoop.js'
import { haptic } from '../telegram.js'

const GRAVITY = 1500
const FLAP = -450
const PIPE_GAP = 160
const PIPE_INTERVAL = 1.4
const BIRD_SIZE = 32
const GROUND_HEIGHT = 64
const MAX_SPEED = 600

export default function GameCanvas({ onGameOver }) {
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)

  const stateRef = useRef({
    w: 360, h: 640,
    bird: { x: 120, y: 280, vy: 0 },
    pipes: [],
    timeToNext: PIPE_INTERVAL,
    started: false,
    gameover: false,
  })

  const resize = useCallback(() => {
    const parent = canvasRef.current?.parentElement
    if (!parent) return
    const pw = parent.clientWidth
    const ph = Math.min(parent.clientHeight, 800)
    // Keep aspect near 9:16
    const targetW = Math.min(420, pw - 24)
    const targetH = Math.min(ph - 24, Math.max(600, Math.round(targetW * 16/9)))
    const c = canvasRef.current
    c.width = targetW * devicePixelRatio
    c.height = targetH * devicePixelRatio
    c.style.width = targetW + 'px'
    c.style.height = targetH + 'px'
    const s = stateRef.current
    s.w = targetW
    s.h = targetH
  }, [])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  const reset = () => {
    stateRef.current = {
      w: stateRef.current.w, h: stateRef.current.h,
      bird: { x: 120, y: 280, vy: 0 },
      pipes: [],
      timeToNext: PIPE_INTERVAL,
      started: false,
      gameover: false,
    }
    setScore(0)
    setRunning(true)
  }

  const flap = () => {
    const s = stateRef.current
    if (s.gameover) return
    s.started = true
    s.bird.vy = FLAP
    haptic('medium')
  }

  useEffect(() => {
    const c = canvasRef.current
    const onPointer = (e) => { e.preventDefault(); flap() }
    c.addEventListener('pointerdown', onPointer)
    return () => c.removeEventListener('pointerdown', onPointer)
  }, [])

  const spawnPipe = (s) => {
    const minY = 80
    const maxY = s.h - GROUND_HEIGHT - 80 - PIPE_GAP
    const topHeight = Math.floor(minY + Math.random() * (maxY - minY))
    const bottomY = topHeight + PIPE_GAP
    const pipe = {
      x: s.w + 40,
      top: { y: 0, h: topHeight },
      bottom: { y: bottomY, h: s.h - GROUND_HEIGHT - bottomY },
      passed: false
    }
    s.pipes.push(pipe)
  }

  const update = useCallback((dt) => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const s = stateRef.current
    const scale = devicePixelRatio

    // physics
    if (!s.gameover && s.started) {
      s.bird.vy = Math.min(MAX_SPEED, s.bird.vy + GRAVITY * dt)
      s.bird.y += s.bird.vy * dt
      s.timeToNext -= dt
      if (s.timeToNext <= 0) {
        spawnPipe(s)
        s.timeToNext = PIPE_INTERVAL
      }
      const speed = 180
      s.pipes.forEach(p => p.x -= speed * dt)
      s.pipes = s.pipes.filter(p => p.x > -80)
    }

    // collisions
    const birdRect = { x: s.bird.x, y: s.bird.y, w: BIRD_SIZE, h: BIRD_SIZE }
    const groundY = s.h - GROUND_HEIGHT
    if (birdRect.y + birdRect.h >= groundY) {
      s.gameover = true
    }
    for (const p of s.pipes) {
      const topRect = { x: p.x, y: 0, w: 64, h: p.top.h }
      const botRect = { x: p.x, y: p.bottom.y, w: 64, h: p.bottom.h }
      if (rectsOverlap(birdRect, topRect) || rectsOverlap(birdRect, botRect)) {
        s.gameover = true
      }
      if (!p.passed && p.x + 64 < s.bird.x) {
        p.passed = true
      }
    }

    // scoring
    for (const p of s.pipes) {
      if (!p.counted && p.x + 64 < s.bird.x) {
        p.counted = true
        setScore(prev => prev + 1)
      }
    }

    // draw
    ctx.save()
    ctx.scale(scale, scale)
    ctx.clearRect(0,0,s.w,s.h)

    // sky
    const g = ctx.createLinearGradient(0,0,0,s.h)
    g.addColorStop(0,'#0f2027')
    g.addColorStop(1,'#203a43')
    ctx.fillStyle = g
    ctx.fillRect(0,0,s.w,s.h)

    // ground
    ctx.fillStyle = '#2b2b2b'
    ctx.fillRect(0, groundY, s.w, GROUND_HEIGHT)

    // pipes
    for (const p of s.pipes) {
      ctx.fillStyle = '#31c281'
      roundRect(ctx, p.x, 0, 64, p.top.h, 8, true, false)
      roundRect(ctx, p.x, p.bottom.y, 64, p.bottom.h, 8, true, false)
    }

    // bird
    drawBird(ctx, s.bird.x, s.bird.y, s.started && !s.gameover ? s.bird.vy : 0)

    // UI
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 28px system-ui, sans-serif'
    ctx.textAlign = 'center'
    if (!s.started) {
      ctx.fillText('Тапни, чтобы начать', s.w/2, s.h*0.35)
    }
    ctx.font = 'bold 36px system-ui, sans-serif'
    ctx.fillText(String(score), s.w/2, 64)

    if (s.gameover) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0,0,s.w,s.h)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 32px system-ui, sans-serif'
      ctx.fillText('Игра окончена', s.w/2, s.h/2 - 10)
      ctx.font = 'bold 20px system-ui, sans-serif'
      ctx.fillText('Тапни, чтобы сыграть снова', s.w/2, s.h/2 + 24)
    }

    ctx.restore()

    // input handling when gameover - tap to restart
    if (s.gameover && running) {
      setRunning(false)
    }
  }, [running])

  useGameLoop(update, true)

  useEffect(() => {
    if (!running) {
      const c = canvasRef.current
      const onRestart = (e) => {
        e.preventDefault()
        if (!stateRef.current.gameover) return
        reset()
      }
      c.addEventListener('pointerdown', onRestart, { once: true })
      return () => c.removeEventListener('pointerdown', onRestart)
    }
  }, [running])

  return (
    <canvas ref={canvasRef} style={{touchAction:'manipulation', borderRadius:16}} />
  )
}

// Helpers
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.arcTo(x+w, y,   x+w, y+h, r)
  ctx.arcTo(x+w, y+h, x,   y+h, r)
  ctx.arcTo(x,   y+h, x,   y,   r)
  ctx.arcTo(x,   y,   x+w, y,   r)
  ctx.closePath()
  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}

function drawBird(ctx, x, y, vy) {
  ctx.save()
  ctx.translate(x + 16, y + 16)
  const angle = Math.max(-0.6, Math.min(0.6, vy / 600))
  ctx.rotate(angle)
  // body
  ctx.fillStyle = '#ffd54f'
  ctx.beginPath()
  ctx.ellipse(0,0,18,14,0,0,Math.PI*2)
  ctx.fill()
  // wing
  ctx.fillStyle = '#ffb300'
  ctx.beginPath()
  ctx.ellipse(-2,0,10,6,0,0,Math.PI*2)
  ctx.fill()
  // eye
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(6,-4,5,0,Math.PI*2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(7,-4,2.5,0,Math.PI*2)
  ctx.fill()
  // beak
  ctx.fillStyle = '#ef6c00'
  ctx.beginPath()
  ctx.moveTo(16,2)
  ctx.lineTo(26,6)
  ctx.lineTo(16,10)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}
