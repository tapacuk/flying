export async function fetchJson(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    const error = new Error(`HTTP Error: ${response.status}`)
    ;(error as any).status = response.status
    throw error
  }
  return response.json()
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { attempts: number; baseMs: number; signal?: AbortSignal },
): Promise<T> {
  let attempt = 0

  while (attempt < options.attempts) {
    try {
      if (options.signal?.aborted)
        throw new DOMException('Aborted', 'AbortError')

      return await fn()
    } catch (err: any) {
      attempt++

      if (err.status >= 400 && err.status < 500) {
        throw err
      }

      if (attempt >= options.attempts || err.name === 'AbortError') {
        throw err
      }

      const backoff = options.baseMs * Math.pow(2, attempt)
      const jitter = Math.random() * 100
      const delay = backoff + jitter

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('Unreachable')
}
// 3. Завантаження картинки з підтримкою скасування (AbortSignal)[cite: 7]
export function loadImage(
  url: string,
  signal?: AbortSignal,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException('Aborted', 'AbortError'))

    const img = new Image()

    const onAbort = () => {
      img.src = '' // Зупиняємо завантаження
      reject(new DOMException('Aborted', 'AbortError'))
    }

    img.onload = () => {
      signal?.removeEventListener('abort', onAbort)
      resolve(img)
    }

    img.onerror = () => {
      signal?.removeEventListener('abort', onAbort)
      reject(new Error(`Failed to load image: ${url}`))
    }

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true })
    }

    img.src = url
  })
}
// Структура для збереження завантажених ресурсів
export interface AssetCache {
  sprites: Map<string, HTMLImageElement>
  // Аудіо додамо на кроці M2
}

export async function loadAll(
  manifestUrl: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<AssetCache> {
  // 1. Завантажуємо сам маніфест (з повторними спробами)
  const manifest = await withRetry(() => fetchJson(manifestUrl, signal), {
    attempts: 3,
    baseMs: 500,
    signal,
  })

  const cache: AssetCache = {
    sprites: new Map(),
  }

  // 2. Рахуємо загальну кількість файлів для прогрес-бару[cite: 6]
  const spriteKeys = Object.keys(manifest.sprites)
  const totalItems = spriteKeys.length
  let doneItems = 0

  if (totalItems === 0) {
    onProgress(1)
    return cache
  }

  // 3. Формуємо масив промісів
  const loadPromises = spriteKeys.map(async (key) => {
    const url = manifest.sprites[key]

    // Завантажуємо кожну картинку з retry[cite: 7]
    const img = await withRetry(() => loadImage(url, signal), {
      attempts: 3,
      baseMs: 300,
      signal,
    })

    cache.sprites.set(key, img)

    // Оновлюємо прогрес[cite: 6]
    doneItems++
    onProgress(doneItems / totalItems)
  })

  // 4. Чекаємо завершення всіх паралельних завантажень[cite: 6, 7]
  await Promise.all(loadPromises)

  return cache
}

// Створюємо глобальний контекст (він стартує у стані "suspended")
export const audioCtx = new (
  window.AudioContext || (window as any).webkitAudioContext
)()

// Завантаження та декодування аудіо
export async function loadAudio(
  url: string,
  signal?: AbortSignal,
): Promise<AudioBuffer> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    const error = new Error(`HTTP Error: ${response.status}`)
    ;(error as any).status = response.status
    throw error
  }
  const arrayBuffer = await response.arrayBuffer()
  return await audioCtx.decodeAudioData(arrayBuffer)
}
