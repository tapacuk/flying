import { createLoop } from './core/loop'
import { createInput } from './core/input'
import { createShip, integrate } from './sim/ship'
import { wrapArena, ARENA_WIDTH, ARENA_HEIGHT } from './sim/arena'
import { setupCanvas } from './render/canvas'
import { drawShip, drawHud, drawGrid } from './render/draw'
import './styles.css'

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `<canvas id="game-canvas"></canvas>`

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = setupCanvas(canvas, ARENA_WIDTH, ARENA_HEIGHT)

const input = createInput()
const currentShip = createShip()
// Зберігаємо попередній стан для інтерполяції[cite: 2]
let previousShip = { ...currentShip }

const loop = createLoop({
  step: 1 / 60,
  simulate: (dt) => {
    // Копіюємо стан ПЕРЕД симуляцією нового кроку
    previousShip = { ...currentShip }
    integrate(currentShip, input, dt)
    wrapArena(currentShip)
  },
  render: (alpha) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

    drawGrid(ctx, ARENA_WIDTH, ARENA_HEIGHT)
    drawShip(ctx, previousShip, currentShip, alpha)
    drawHud(ctx, loop.getMetrics())
  },
})

loop.start()
