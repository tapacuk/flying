// src/core/input.ts
export function createInput(target: EventTarget = window) {
  const down = new Set<string>()
  const justPressed = new Set<string>()

  target.addEventListener('keydown', (e) => {
    const event = e as KeyboardEvent
    if (event.repeat) return // ігноруємо повтори від ОС[cite: 3]
    down.add(event.code)
    justPressed.add(event.code)
  })

  target.addEventListener('keyup', (e) => {
    const event = e as KeyboardEvent
    down.delete(event.code)
  })

  return {
    isDown: (code: string) => down.has(code),
    // Метод consume повертає true, якщо клавіша натиснута в цьому кадрі, і одразу видаляє її зі стану
    consumeJustPressed: (code: string) => {
      const has = justPressed.has(code)
      if (has) justPressed.delete(code)
      return has
    },
  }
}
