import { Entity } from './entity'
import { Vector2 } from './vector'

export class Pickup extends Entity {
  constructor(x: number, y: number) {
    super(new Vector2(x, y), 'pickup', 12)
  }
}
