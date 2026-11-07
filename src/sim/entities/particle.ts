import { Entity } from '../core/entity'
import { Vector2 } from '../core/vector'
import { World } from '../core/world'

export class Particle extends Entity {
  public ttl: number

  constructor(pos: Vector2, vel: Vector2) {
    super(pos, 'particle', 2)
    this.vel = vel
    this.ttl = Math.random() * 0.5 + 0.2
  }

  update(dt: number) {
    super.update(dt)
    this.ttl -= dt
    if (this.ttl <= 0) this.alive = false
  }
}

export function spawnExplosion(world: World, pos: Vector2, count: number = 15) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 150 + 50
    const vel = Vector2.fromAngle(angle, speed)
    world.spawn(new Particle(pos, vel))
  }
}
