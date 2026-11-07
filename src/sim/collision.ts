import { World } from './world'
import { Entity } from './entity'

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
