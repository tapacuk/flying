import { audioCtx, type AssetCache } from '../assets/loader'
import { gameBus } from '../sim/core/events'

export function initAudio(assets: AssetCache) {
  const unlock = () => {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
    window.removeEventListener('keydown', unlock)
    window.removeEventListener('click', unlock)
  }
  window.addEventListener('keydown', unlock)
  window.addEventListener('click', unlock)

  // Підписуємося на події гри (декаплінг)[cite: 7]
  gameBus.addEventListener('fired', () => playSound(assets.sounds.get('fire')))
  gameBus.addEventListener('exploded', () =>
    playSound(assets.sounds.get('explosion')),
  )
}

function playSound(buffer?: AudioBuffer) {
  if (!buffer) return
  // Створюємо нову ноду (вузол) для кожного програвання, щоб звуки могли накладатися[cite: 7]
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.connect(audioCtx.destination)
  source.start(0)
}
