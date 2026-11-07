import { Entity } from '../core/entity'
import { Vector2 } from '../core/vector'

export interface HomingComponent {
  target: Entity
  turnRate: number
}

export function applyHoming(
  entity: Entity & { homing?: HomingComponent },
  dt: number,
) {
  if (!entity.homing || !entity.homing.target.alive) return

  const targetPos = entity.homing.target.pos
  const toTarget = targetPos.sub(entity.pos)

  const desiredAngle = Math.atan2(toTarget.y, toTarget.x)
  const currentSpeed = entity.vel.length()

  const desiredVel = Vector2.fromAngle(desiredAngle, currentSpeed)

  const lerpFactor = Math.min(entity.homing.turnRate * dt, 1)
  entity.vel = new Vector2(
    entity.vel.x + (desiredVel.x - entity.vel.x) * lerpFactor,
    entity.vel.y + (desiredVel.y - entity.vel.y) * lerpFactor,
  )
}
