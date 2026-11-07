export class Vector2 {
  public readonly x: number
  public readonly y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y)
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y)
  }

  scale(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar)
  }

  length(): number {
    return Math.hypot(this.x, this.y)
  }

  normalize(): Vector2 {
    const len = this.length()
    return len === 0 ? new Vector2(0, 0) : this.scale(1 / len)
  }

  rotate(angle: number): Vector2 {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos)
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y
  }

  static fromAngle(angle: number, length: number = 1): Vector2 {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length)
  }
}
