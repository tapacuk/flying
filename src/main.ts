import { createLoop } from './core/loop'
import { createInput } from './core/input'
import { Ship } from './sim/ship'
import { wrapArena, ARENA_WIDTH, ARENA_HEIGHT } from './sim/arena'
import { setupCanvas } from './render/canvas'
import { drawShip, drawHud, drawGrid } from './render/draw'
import './styles.css'

const app = document.querySelector<HTMLDivElement>('#app')!
if (!document.getElementById('game-canvas')) {
  app.innerHTML = `<canvas id="game-canvas"></canvas>`
}

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = setupCanvas(canvas, ARENA_WIDTH, ARENA_HEIGHT)

const input = createInput()
const currentShip = new Ship(ARENA_WIDTH / 2, ARENA_HEIGHT / 2)

let previousShipState = {
  pos: currentShip.pos,
  angle: currentShip.angle,
  thrust: currentShip.thrust,
}

const loop = createLoop({
  step: 1 / 60,
  simulate: (dt) => {
    previousShipState = {
      pos: currentShip.pos,
      angle: currentShip.angle,
      thrust: currentShip.thrust,
    }

    currentShip.updateWithInput(dt, input)
    wrapArena(currentShip)
  },
  render: (alpha) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

    drawGrid(ctx, ARENA_WIDTH, ARENA_HEIGHT)
    drawShip(ctx, previousShipState, currentShip, alpha)
    drawHud(ctx, loop.getMetrics())
  },
})

loop.start()
