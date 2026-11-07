// src/sim/world.ts
import { Entity } from './entity'

export class World {
  #entities = new Map<number, Entity>()

  spawn(e: Entity) {
    this.#entities.set(e.id, e)
  }

  get(id: number): Entity | undefined {
    return this.#entities.get(id)
  }

  // Робить клас World ітерованим (можна використовувати у for...of)
  *[Symbol.iterator]() {
    yield* this.#entities.values()
  }

  // Генератор для фільтрації без створення проміжних масивів[cite: 4]
  *ofKind(kind: string) {
    for (const e of this) {
      if (e.kind === kind) yield e
    }
  }

  step(dt: number) {
    // Оновлюємо всі сутності
    for (const e of this) {
      e.update(dt)
    }
    this.sweep()
  }

  // Відкладене видалення "мертвих" сутностей[cite: 4]
  private sweep() {
    for (const e of this) {
      if (!e.alive) {
        this.#entities.delete(e.id)
      }
    }
  }
}
