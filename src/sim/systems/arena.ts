import type { Entity } from '../core/entity'
import { Vector2 } from '../core/vector'

export const ARENA_WIDTH = 800
export const ARENA_HEIGHT = 600

export function wrapArena(entity: Entity) {
  let { x, y } = entity.pos
  if (x < 0) x += ARENA_WIDTH
  if (x >= ARENA_WIDTH) x -= ARENA_WIDTH
  if (y < 0) y += ARENA_HEIGHT
  if (y >= ARENA_HEIGHT) y -= ARENA_HEIGHT

  entity.pos = new Vector2(x, y)
}
