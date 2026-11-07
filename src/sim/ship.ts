import { Bullet } from './bullet'
import { Entity } from './entity'
import { Vector2 } from './vector'
import type { World } from './world'

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

  fire(world: World) {
    const bulletSpeed = 600
    const nose = this.pos.add(Vector2.fromAngle(this.angle, this.radius))
    const bulletVel = this.vel.add(Vector2.fromAngle(this.angle, bulletSpeed))

    world.spawn(new Bullet(nose, bulletVel))
  }
}
