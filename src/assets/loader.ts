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
export interface AssetCache {
  sprites: Map<string, HTMLImageElement>
  sounds: Map<string, AudioBuffer>
}

export async function loadAll(
  manifestUrl: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<AssetCache> {
  const manifest = await withRetry(() => fetchJson(manifestUrl, signal), {
    attempts: 3,
    baseMs: 500,
    signal,
  })

  const cache: AssetCache = { sprites: new Map(), sounds: new Map() }

  const spriteKeys = manifest.sprites ? Object.keys(manifest.sprites) : []
  const soundKeys = manifest.sounds ? Object.keys(manifest.sounds) : []
  const totalItems = spriteKeys.length + soundKeys.length
  let doneItems = 0

  if (totalItems === 0) return cache

  const updateProgress = () => {
    doneItems++
    onProgress(doneItems / totalItems)
  }

  const promises = [
    ...spriteKeys.map(async (key) => {
      const img = await withRetry(
        () => loadImage(manifest.sprites[key], signal),
        { attempts: 3, baseMs: 300, signal },
      )
      cache.sprites.set(key, img)
      updateProgress()
    }),
    ...soundKeys.map(async (key) => {
      const audio = await withRetry(
        () => loadAudio(manifest.sounds[key], signal),
        { attempts: 3, baseMs: 300, signal },
      )
      cache.sounds.set(key, audio)
      updateProgress()
    }),
  ]

  await Promise.all(promises)
  return cache
}

export const audioCtx = new (
  window.AudioContext || (window as any).webkitAudioContext
)()

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
