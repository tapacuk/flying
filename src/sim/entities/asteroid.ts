import { Entity } from '../core/entity'
import { Vector2 } from '../core/vector'

export class Asteroid extends Entity {
  constructor(x: number, y: number, vx: number, vy: number) {
    super(new Vector2(x, y), 'asteroid', 20)
    this.vel = new Vector2(vx, vy)
  }
}
