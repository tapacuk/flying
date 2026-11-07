import { createLoop } from './core/loop'
import { createInput } from './core/input'
import { Ship } from './sim/ship'
import { wrapArena, ARENA_WIDTH, ARENA_HEIGHT } from './sim/arena'
import { setupCanvas } from './render/canvas'
import { drawShip, drawHud, drawGrid } from './render/draw'
import './styles.css'
import { Asteroid } from './sim/asteroid'
import { World } from './sim/world'

const app = document.querySelector<HTMLDivElement>('#app')!
if (!document.getElementById('game-canvas')) {
  app.innerHTML = `<canvas id="game-canvas"></canvas>`
}

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = setupCanvas(canvas, ARENA_WIDTH, ARENA_HEIGHT)

const input = createInput()
const world = new World()
const currentShip = new Ship(ARENA_WIDTH / 2, ARENA_HEIGHT / 2)
world.spawn(currentShip)

world.spawn(new Asteroid(100, 100, 50, 30))
world.spawn(new Asteroid(600, 400, -40, -60))

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    currentShip.fire(world)
  }
})

let previousStates = new Map<number, { pos: any; angle: number }>()

const loop = createLoop({
  step: 1 / 60,
  simulate: (dt) => {
    previousStates.clear()

    for (const e of world) {
      previousStates.set(e.id, { pos: e.pos, angle: e.angle })
    }

    currentShip.updateWithInput(dt, input)
    world.step(dt)

    for (const e of world) {
      wrapArena(e)
    }
  },
  render: (alpha) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    drawGrid(ctx, ARENA_WIDTH, ARENA_HEIGHT)

    for (const e of world) {
      const prev = previousStates.get(e.id) || e

      if (e.kind === 'ship') {
        drawShip(ctx, prev, e, alpha)
      } else if (e.kind === 'asteroid') {
        const x = prev.pos.x + (e.pos.x - prev.pos.x) * alpha
        const y = prev.pos.y + (e.pos.y - prev.pos.y) * alpha
        ctx.beginPath()
        ctx.arc(x, y, e.radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'gray'
        ctx.stroke()
      } else if (e.kind === 'bullet') {
        const x = prev.pos.x + (e.pos.x - prev.pos.x) * alpha
        const y = prev.pos.y + (e.pos.y - prev.pos.y) * alpha
        ctx.fillStyle = 'yellow'
        ctx.fillRect(x - 2, y - 2, 4, 4)
      }
    }

    drawHud(ctx, loop.getMetrics())
  },
})

loop.start()
