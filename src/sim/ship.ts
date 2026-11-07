import { Entity } from './entity'
import { Vector2 } from './vector'

interface InputState {
  isDown(code: string): boolean
}

export class Ship extends Entity {
  public thrust: boolean = false

  constructor(x: number, y: number) {
    super(new Vector2(x, y), 'ship', 15)
  }
  updateWithInput(dt: number, input: InputState): void {
    const TURN_SPEED = 4
    const THRUST_POWER = 400
    const DRAG = 0.98

    if (input.isDown('ArrowLeft') || input.isDown('KeyA')) {
      this.angle -= TURN_SPEED * dt
    }
    if (input.isDown('ArrowRight') || input.isDown('KeyD')) {
      this.angle += TURN_SPEED * dt
    }

    this.thrust = input.isDown('ArrowUp') || input.isDown('KeyW')
    if (this.thrust) {
      const thrustVec = Vector2.fromAngle(this.angle, THRUST_POWER * dt)
      this.vel = this.vel.add(thrustVec)
    }

    this.vel = this.vel.scale(DRAG)

    super.update(dt)
  }
}
