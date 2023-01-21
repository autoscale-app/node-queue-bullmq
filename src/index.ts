import { Queue } from 'bullmq'

interface LatencyOptions {
  lifo: boolean
  connection: RedisConnectionOptions
}

interface RedisConnectionOptions {
  host: string
  port: number
}

const defaultLatencyOptions: LatencyOptions = {
  lifo: false,
  connection: {
    host: 'localhost',
    port: 6379
  }
}

// @example
//   latency(["default"])
//   latency(["default", "low", "critical"], {lifo: true})
export async function latency (names: string[], options: Partial<LatencyOptions> = {}): Promise<number | null> {
  const opts: LatencyOptions = { ...defaultLatencyOptions, ...options }
  const queues = names.map(queue => new Queue(queue))

  try {
    const requests = queues.map(async queue => await queue.getJobs(['wait'], 0, 0, !opts.lifo))
    const responses = await Promise.all(requests)
    const start = Date.now()
    let oldest = start

    for (const queue of responses) {
      for (const job of queue) {
        if (job.timestamp < oldest) {
          oldest = job.timestamp
        }
      }
    }

    return Math.round((start - oldest) / 1000)
  } catch (err) {
    console.error('[@autoscale/queue-bullmq] latency error:', err)
    return null
  } finally {
    for (const queue of queues) {
      void queue.close()
    }
  }
}
