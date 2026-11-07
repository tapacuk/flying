import { createLoop } from './core/loop'
import { createInput } from './core/input'
import { Ship } from './sim/ship'
import { wrapArena, ARENA_WIDTH, ARENA_HEIGHT } from './sim/arena'
import { setupCanvas } from './render/canvas'
import { drawShip, drawHud, drawGrid } from './render/draw'
import './styles.css'
import { Asteroid } from './sim/asteroid'
import { World } from './sim/world'
import { getCollisions } from './sim/collision'
import { spawnExplosion } from './sim/particle'

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
// Змінні стану гри
let score = 0
let respawnTimer = 0 // Таймер респауну (2 секунди)[cite: 4]

const loop = createLoop({
  step: 1 / 60,
  simulate: (dt) => {
    previousStates.clear()
    for (const e of world)
      previousStates.set(e.id, { pos: e.pos, angle: e.angle })

    // Логіка гравця (якщо живий) або таймер респауну
    if (currentShip.alive) {
      currentShip.updateWithInput(dt, input)
    } else {
      respawnTimer -= dt
      if (respawnTimer <= 0) {
        // Респаун у центрі арени (або будь-якому безпечному місці)[cite: 4]
        currentShip.reset(ARENA_WIDTH / 2, ARENA_HEIGHT / 2)
        world.spawn(currentShip)
      }
    }

    world.step(dt)
    for (const e of world) wrapArena(e)

    // ОБРОБКА КОЛІЗІЙ
    const collisions = getCollisions(world)
    for (const [a, b] of collisions) {
      // Куля влучає в астероїд
      if (
        (a.kind === 'bullet' && b.kind === 'asteroid') ||
        (b.kind === 'bullet' && a.kind === 'asteroid')
      ) {
        a.alive = false
        b.alive = false
        score += 10 // Додаємо очки на HUD[cite: 4]
        spawnExplosion(world, a.kind === 'asteroid' ? a.pos : b.pos)

        // Відроджуємо новий астероїд деінде, щоб гра не зупинялася
        world.spawn(
          new Asteroid(
            Math.random() * ARENA_WIDTH,
            Math.random() * ARENA_HEIGHT,
            Math.random() * 100 - 50,
            Math.random() * 100 - 50,
          ),
        )
      }

      // Корабель влучає в астероїд
      if (
        (a.kind === 'ship' && b.kind === 'asteroid') ||
        (b.kind === 'ship' && a.kind === 'asteroid')
      ) {
        const ship = (a.kind === 'ship' ? a : b) as Ship
        const asteroid = a.kind === 'asteroid' ? a : b

        ship.takeDamage(100) // Знищуємо корабель
        asteroid.alive = false

        if (!ship.alive) {
          spawnExplosion(world, ship.pos, 30) // Великий вибух із частинок[cite: 4]
          respawnTimer = 2.0 // Встановлюємо таймер на 2 секунди[cite: 4]
        }
      }
    }
  },
  render: (alpha) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
    drawGrid(ctx, ARENA_WIDTH, ARENA_HEIGHT)

    for (const e of world) {
      const prev = previousStates.get(e.id) || e
      if (e.kind === 'ship') drawShip(ctx, prev, e, alpha)
      else if (e.kind === 'asteroid') {
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
      // Малюємо частинки вибуху
      else if (e.kind === 'particle') {
        const x = prev.pos.x + (e.pos.x - prev.pos.x) * alpha
        const y = prev.pos.y + (e.pos.y - prev.pos.y) * alpha
        ctx.fillStyle = 'orange'
        ctx.fillRect(x - 1, y - 1, 2, 2)
      }
    }

    // Малюємо HUD зі здоров'ям та рахунком[cite: 4]
    drawHud(ctx, loop.getMetrics())
    ctx.fillStyle = 'white'
    ctx.fillText(`Score: ${score}`, ARENA_WIDTH - 100, 20)
    ctx.fillText(`HP: ${currentShip.hp}`, ARENA_WIDTH - 100, 40)
  },
})

loop.start()
