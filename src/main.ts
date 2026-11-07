import { createLoop } from './core/loop'
import { createInput } from './core/input'
import { Ship } from './sim/ship'
import { World } from './sim/world'
import { Asteroid } from './sim/asteroid'
import { Pickup } from './sim/pickup'
import { applyHoming } from './sim/homing'
import { wrapArena, ARENA_WIDTH, ARENA_HEIGHT } from './sim/arena'
import { setupCanvas } from './render/canvas'
import { drawGrid, drawHud, drawWorld } from './render/draw'
import { resolveCollisions, type GameState } from './sim/collision'
import './styles.css'

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
world.spawn(new Pickup(200, 200))

// Стан гри, який ми передаватимемо в системи
const gameState: GameState = { score: 0, respawnTimer: 0 }
let bulletsFired = 0

// Обробка пострілів
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && currentShip.alive) {
    currentShip.fire(world)
    bulletsFired++

    let lastBullet = Array.from(world)
      .filter((e) => e.kind === 'bullet')
      .pop()
    if (lastBullet && bulletsFired % 3 === 0) {
      const asteroid = Array.from(world).find((e) => e.kind === 'asteroid')
      if (asteroid) {
        ;(lastBullet as any).homing = { target: asteroid, turnRate: 5.0 }
        lastBullet.kind = 'homing-bullet'
      }
    }
  }
})

let previousStates = new Map<number, any>()

const loop = createLoop({
  step: 1 / 60,
  simulate: (dt) => {
    // 1. Збереження попередніх станів
    previousStates.clear()
    for (const e of world)
      previousStates.set(e.id, { pos: e.pos, angle: e.angle })

    // 2. Оновлення гравця або таймера відродження
    if (currentShip.alive) {
      currentShip.updateWithInput(dt, input)
    } else {
      gameState.respawnTimer -= dt
      if (gameState.respawnTimer <= 0) {
        currentShip.reset(ARENA_WIDTH / 2, ARENA_HEIGHT / 2)
        world.spawn(currentShip)
      }
    }

    // 3. Системи симуляції (Самонаведення, оновлення фізики, wrap-around)
    for (const e of world) {
      if ((e as any).homing) applyHoming(e as any, dt)
    }
    world.step(dt)
    for (const e of world) wrapArena(e)

    // 4. Обробка зіткнень
    resolveCollisions(world, gameState)
  },

  render: (alpha) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    drawGrid(ctx, ARENA_WIDTH, ARENA_HEIGHT)

    // Виклик винесеної функції відмальовування
    drawWorld(ctx, world, previousStates, alpha)

    drawHud(ctx, loop.getMetrics())
    ctx.fillStyle = 'white'
    ctx.fillText(`Score: ${gameState.score}`, ARENA_WIDTH - 100, 20)
    ctx.fillText(`HP: ${currentShip.hp}`, ARENA_WIDTH - 100, 40)
  },
})

loop.start()
