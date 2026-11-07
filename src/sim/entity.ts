import { Vector2 } from './vector'

export class Entity {
  static #nextId = 1

  public id = Entity.#nextId++
  public pos: Vector2
  public vel: Vector2
  public angle: number
  public radius: number
  public alive: boolean = true
  public kind: string

  constructor(pos: Vector2, kind: string = 'entity', radius: number = 10) {
    this.pos = pos
    this.vel = new Vector2(0, 0)
    this.angle = 0
    this.radius = radius
    this.kind = kind
  }

  update(dt: number): void {
    this.pos = this.pos.add(this.vel.scale(dt))
  }
}
