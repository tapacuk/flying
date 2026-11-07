import type { Ship } from './ship'

// Для початку зафіксуємо розміри арени
export const ARENA_WIDTH = 800
export const ARENA_HEIGHT = 600

export function wrapArena(ship: Ship) {
  if (ship.x < 0) ship.x += ARENA_WIDTH
  if (ship.x >= ARENA_WIDTH) ship.x -= ARENA_WIDTH
  if (ship.y < 0) ship.y += ARENA_HEIGHT
  if (ship.y >= ARENA_HEIGHT) ship.y -= ARENA_HEIGHT
}
