import type { Ship } from '../sim/ship'
import type { LoopMetrics } from '../core/loop'

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
  prev: Ship,
  curr: Ship,
  alpha: number,
) {
  const x = lerp(prev.x, curr.x, alpha)
  const y = lerp(prev.y, curr.y, alpha)
  const angle = lerpAngle(prev.angle, curr.angle, alpha)

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Малюємо простий корабель (трикутник), який дивиться вправо
  ctx.beginPath()
  ctx.moveTo(15, 0)
  ctx.lineTo(-10, 10)
  ctx.lineTo(-10, -10)
  ctx.closePath()
  ctx.fillStyle = 'white'
  ctx.fill()

  // Полум'я двигуна
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
