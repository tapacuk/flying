// src/sim/ship.ts
export interface Ship {
  x: number
  y: number
  vx: number
  vy: number
  angle: number // у радіанах
  thrust: boolean
}

export function createShip(): Ship {
  return { x: 400, y: 300, vx: 0, vy: 0, angle: 0, thrust: false }
}

// dt завжди дорівнює фіксованому кроку (наприклад, 1/60 с)
export function integrate(
  ship: Ship,
  input: ReturnType<typeof import('../core/input').createInput>,
  dt: number,
) {
  const TURN_SPEED = 4 // радіан за секунду
  const THRUST_POWER = 400 // пікселів за секунду в квадраті
  const DRAG = 0.98 // тертя/опір простору

  // Поворот
  if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
    ship.angle -= TURN_SPEED * dt
  }
  if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
    ship.angle += TURN_SPEED * dt
  }

  // Прискорення
  ship.thrust = input.isDown('ArrowUp') || input.isDown('KeyW')
  if (ship.thrust) {
    ship.vx += Math.cos(ship.angle) * THRUST_POWER * dt
    ship.vy += Math.sin(ship.angle) * THRUST_POWER * dt
  }

  // Інерція (гальмування)
  ship.vx *= DRAG
  ship.vy *= DRAG

  // Оновлення позиції
  ship.x += ship.vx * dt
  ship.y += ship.vy * dt
}
