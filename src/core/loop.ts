export type LoopMetrics = { fps: number; sps: number; frameTime: number }

type LoopConfig = {
  step?: number
  simulate: (dt: number) => void
  render: (alpha: number) => void
}

export function createLoop({ step = 1 / 60, simulate, render }: LoopConfig) {
  let last = performance.now()
  let accumulator = 0
  let rafId = 0

  let framesThisSecond = 0
  let stepsThisSecond = 0
  let lastFpsUpdate = last
  const metrics: LoopMetrics = { fps: 0, sps: 0, frameTime: 0 }

  function frame(now: number) {
    metrics.frameTime = now - last
    let dt = (now - last) / 1000

    // Обмеження dt (clamp), щоб уникнути "спіралі смерті" після згортання вкладки
    if (dt > 0.25) dt = 0.25

    last = now
    accumulator += dt

    // Симуляція наздоганяє час фіксованими кроками
    while (accumulator >= step) {
      simulate(step)
      accumulator -= step
      stepsThisSecond++
    }

    // Рендер малює з урахуванням залишку часу (alpha)
    render(accumulator / step)
    framesThisSecond++

    // Оновлення метрик раз на секунду
    if (now - lastFpsUpdate >= 1000) {
      metrics.fps = framesThisSecond
      metrics.sps = stepsThisSecond
      framesThisSecond = 0
      stepsThisSecond = 0
      lastFpsUpdate = now
    }

    rafId = requestAnimationFrame(frame)
  }

  return {
    start: () => {
      last = performance.now()
      rafId = requestAnimationFrame(frame)
    },
    stop: () => cancelAnimationFrame(rafId),
    getMetrics: () => metrics,
  }
}
