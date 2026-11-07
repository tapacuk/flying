// src/render/canvas.ts
export function setupCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
) {
  const dpr = window.devicePixelRatio || 1

  // Фактичний розмір у пікселях для малювання
  canvas.width = cssWidth * dpr
  canvas.height = cssHeight * dpr

  // Розмір на екрані через CSS
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  const ctx = canvas.getContext('2d')!
  // Масштабуємо контекст, щоб усі подальші координати збігалися з CSS-розмірами
  ctx.scale(dpr, dpr)

  return ctx
}
