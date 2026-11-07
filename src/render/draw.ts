import type { LoopMetrics } from '../core/loop'
import type { World } from '../sim/core/world'

export function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha
}

export function lerpAngle(a: number, b: number, alpha: number) {
  // Найкоротший шлях для повороту, щоб уникнути стрибків при переході 360° -> 0°[cite: 3]
  let diff = b - a
  while (diff < -Math.PI) diff += Math.PI * 2
  while (diff > Math.PI) diff -= Math.PI * 2
  return a + diff * alpha
}

export function drawShip(
  ctx: CanvasRenderingContext2D,
  prev: any,
  curr: any,
  alpha: number,
) {
  // Використовуємо .pos.x та .pos.y
  const x = lerp(prev.pos.x, curr.pos.x, alpha)
  const y = lerp(prev.pos.y, curr.pos.y, alpha)
  const angle = lerpAngle(prev.angle, curr.angle, alpha)

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  ctx.beginPath()
  ctx.moveTo(15, 0)
  ctx.lineTo(-10, 10)
  ctx.lineTo(-10, -10)
  ctx.closePath()
  ctx.fillStyle = 'white'
  ctx.fill()

  if (curr.thrust) {
    ctx.beginPath()
    ctx.moveTo(-10, 5)
    ctx.lineTo(-25, 0)
    ctx.lineTo(-10, -5)
    ctx.fillStyle = 'orange'
    ctx.fill()
  }
  ctx.restore()
}

export function drawHud(ctx: CanvasRenderingContext2D, metrics: LoopMetrics) {
  ctx.fillStyle = 'lime'
  ctx.font = '14px monospace'
  ctx.fillText(`steps/s: ${metrics.sps}`, 10, 20)
  ctx.fillText(`frames/s: ${metrics.fps}`, 10, 40)
  ctx.fillText(`frame ms: ${metrics.frameTime.toFixed(1)}`, 10, 60)
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.strokeStyle = '#222'
  ctx.beginPath()
  for (let x = 0; x < width; x += 50) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  for (let y = 0; y < height; y += 50) {
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  world: World,
  previousStates: Map<number, any>,
  alpha: number,
) {
  for (const e of world) {
    const prev = previousStates.get(e.id) || e

    if (e.kind === 'ship') {
      drawShip(ctx, prev, e, alpha)
    } else if (e.kind === 'asteroid') {
      const x = lerp(prev.pos.x, e.pos.x, alpha)
      const y = lerp(prev.pos.y, e.pos.y, alpha)
      ctx.beginPath()
      ctx.arc(x, y, e.radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'gray'
      ctx.stroke()
    } else if (e.kind === 'bullet') {
      const x = lerp(prev.pos.x, e.pos.x, alpha)
      const y = lerp(prev.pos.y, e.pos.y, alpha)
      ctx.fillStyle = 'yellow'
      ctx.fillRect(x - 2, y - 2, 4, 4)
    } else if (e.kind === 'homing-bullet') {
      const x = lerp(prev.pos.x, e.pos.x, alpha)
      const y = lerp(prev.pos.y, e.pos.y, alpha)
      ctx.fillStyle = 'magenta'
      ctx.fillRect(x - 3, y - 3, 6, 6)
    } else if (e.kind === 'particle') {
      const x = lerp(prev.pos.x, e.pos.x, alpha)
      const y = lerp(prev.pos.y, e.pos.y, alpha)
      ctx.fillStyle = 'orange'
      ctx.fillRect(x - 1, y - 1, 2, 2)
    } else if (e.kind === 'pickup') {
      const x = lerp(prev.pos.x, e.pos.x, alpha)
      const y = lerp(prev.pos.y, e.pos.y, alpha)
      ctx.fillStyle = 'cyan'
      ctx.beginPath()
      ctx.moveTo(x, y - 8)
      ctx.lineTo(x + 8, y)
      ctx.lineTo(x, y + 8)
      ctx.lineTo(x - 8, y)
      ctx.fill()
    }
  }
}
