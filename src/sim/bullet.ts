import { Entity } from './entity'
import { Vector2 } from './vector'

export class Bullet extends Entity {
  public ttl: number = 1

  constructor(pos: Vector2, vel: Vector2) {
    super(pos, 'bullet', 2)
    this.vel = vel
  }

  update(dt: number) {
    super.update(dt)
    this.ttl -= dt
    if (this.ttl <= 0) {
      this.alive = false
    }
  }
}
