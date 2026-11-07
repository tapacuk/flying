import { World } from '../core/world'
import { Entity } from '../core/entity'
import { Asteroid } from '../entities/asteroid'
import { Ship } from '../entities/ship'
import { spawnExplosion } from '../entities/particle'
import { ARENA_WIDTH, ARENA_HEIGHT } from './arena'

export function getCollisions(world: World): [Entity, Entity][] {
  const entities = Array.from(world)
  const pairs: [Entity, Entity][] = []

  for (let i = 0; i < entities.length; i++) {
    const a = entities[i]
    if (!a.alive) continue

    for (let j = i + 1; j < entities.length; j++) {
      const b = entities[j]
      if (!b.alive) continue

      const dist = a.pos.sub(b.pos).length()

      if (dist < a.radius + b.radius) {
        pairs.push([a, b])
      }
    }
  }
  return pairs
}
export interface GameState {
  score: number
  respawnTimer: number
}

export function resolveCollisions(world: World, state: GameState) {
  const collisions = getCollisions(world)

  for (const [a, b] of collisions) {
    if (
      ((a.kind === 'bullet' || a.kind === 'homing-bullet') &&
        b.kind === 'asteroid') ||
      ((b.kind === 'bullet' || b.kind === 'homing-bullet') &&
        a.kind === 'asteroid')
    ) {
      a.alive = false
      b.alive = false
      state.score += 10
      spawnExplosion(world, a.kind === 'asteroid' ? a.pos : b.pos)
      world.spawn(
        new Asteroid(
          Math.random() * ARENA_WIDTH,
          Math.random() * ARENA_HEIGHT,
          Math.random() * 100 - 50,
          Math.random() * 100 - 50,
        ),
      )
    }

    if (
      (a.kind === 'ship' && b.kind === 'asteroid') ||
      (b.kind === 'ship' && a.kind === 'asteroid')
    ) {
      const ship = (a.kind === 'ship' ? a : b) as Ship
      const asteroid = a.kind === 'asteroid' ? a : b

      ship.takeDamage(100)
      asteroid.alive = false

      if (!ship.alive && state.respawnTimer <= 0) {
        spawnExplosion(world, ship.pos, 30)
        state.respawnTimer = 2.0
      }
    }

    if (
      (a.kind === 'ship' && b.kind === 'pickup') ||
      (b.kind === 'ship' && a.kind === 'pickup')
    ) {
      const pickup = a.kind === 'pickup' ? a : b
      pickup.alive = false
      state.score += 50
    }
  }
}
