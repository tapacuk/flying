// src/render/screens.ts
export function drawLoadingScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
) {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'white'
  ctx.font = '20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('Loading Assets...', width / 2, height / 2 - 20)

  // Прогрес-бар (рамка)
  const barWidth = 300
  const barHeight = 20
  const x = (width - barWidth) / 2
  const y = height / 2

  ctx.strokeStyle = 'white'
  ctx.strokeRect(x, y, barWidth, barHeight)

  // Прогрес-бар (заповнення на основі відсотка)
  ctx.fillStyle = 'lime'
  ctx.fillRect(x + 2, y + 2, (barWidth - 4) * progress, barHeight - 4)
}

export function drawErrorScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  error: Error,
) {
  ctx.fillStyle = '#330000' // Темно-червоний фон для помилки
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'white'
  ctx.font = '20px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('Failed to load game assets!', width / 2, height / 2 - 20)

  ctx.fillStyle = 'pink'
  ctx.font = '14px monospace'
  ctx.fillText(error.message, width / 2, height / 2 + 10)
  ctx.fillText('Check console and refresh page.', width / 2, height / 2 + 40)
}
