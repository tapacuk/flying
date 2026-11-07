import { createLoop } from './core/loop'
import { createInput } from './core/input'
import { setupCanvas } from './render/canvas'
import { drawGrid, drawHud, drawWorld } from './render/draw'
import { drawLoadingScreen, drawErrorScreen } from './render/screens'
import { loadAll, type AssetCache } from './assets/loader'

import { World } from './sim/core/world'
import { Ship } from './sim/entities/ship'
import { Asteroid } from './sim/entities/asteroid'
import { ARENA_WIDTH, ARENA_HEIGHT, wrapArena } from './sim/systems/arena'
import { resolveCollisions, type GameState } from './sim/systems/collision'
import './styles.css'
import { initAudio } from './audio/audio'
import { gameBus } from './sim/core/events'

const app = document.querySelector<HTMLDivElement>('#app')!
if (!document.getElementById('game-canvas')) {
  app.innerHTML = `<canvas id="game-canvas"></canvas>`
}
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
const ctx = setupCanvas(canvas, ARENA_WIDTH, ARENA_HEIGHT)

drawLoadingScreen(ctx, ARENA_WIDTH, ARENA_HEIGHT, 0)

try {
  const assets: AssetCache = await loadAll(
    '/assets/manifest.json',
    (progress) => {
      drawLoadingScreen(ctx, ARENA_WIDTH, ARENA_HEIGHT, progress)
    },
  )

  startGame(assets)
} catch (error) {
  console.error('Game initialization failed:', error)
  drawErrorScreen(ctx, ARENA_WIDTH, ARENA_HEIGHT, error as Error)
}

function startGame(assets: AssetCache) {
  const input = createInput()
  const world = new World()
  const currentShip = new Ship(ARENA_WIDTH / 2, ARENA_HEIGHT / 2)
  initAudio(assets)

  world.spawn(currentShip)
  world.spawn(new Asteroid(100, 100, 50, 30))

  const gameState: GameState = { score: 0, respawnTimer: 0 }
  let previousStates = new Map<number, any>()

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && currentShip.alive) {
      currentShip.fire(world)
      gameBus.dispatchEvent(new CustomEvent('fired'))
    }
  })

  const loop = createLoop({
    step: 1 / 60,
    simulate: (dt) => {
      previousStates.clear()
      for (const e of world)
        previousStates.set(e.id, { pos: e.pos, angle: e.angle })

      if (currentShip.alive) currentShip.updateWithInput(dt, input)
      else {
        gameState.respawnTimer -= dt
        if (gameState.respawnTimer <= 0) {
          currentShip.reset(ARENA_WIDTH / 2, ARENA_HEIGHT / 2)
          world.spawn(currentShip)
        }
      }

      world.step(dt)
      for (const e of world) wrapArena(e)
      resolveCollisions(world, gameState)
    },

    render: (alpha) => {
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)
      drawGrid(ctx, ARENA_WIDTH, ARENA_HEIGHT)

      drawWorld(ctx, world, previousStates, alpha)

      drawHud(ctx, loop.getMetrics())
      ctx.fillStyle = 'white'
      ctx.fillText(`Score: ${gameState.score}`, ARENA_WIDTH - 100, 20)
    },
  })

  loop.start()
}
