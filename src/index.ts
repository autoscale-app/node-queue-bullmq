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
    host: '127.0.0.1',
    port: 6379
  }
}

//   latency(["default"])
//   latency(["default", "low", "critical"], {lifo: true, connection: {host: '127.0.0.1', port: 6379}})
export async function latency (names: string[], options: Partial<LatencyOptions> = {}): Promise<number | null> {
  const opts: LatencyOptions = { ...defaultLatencyOptions, ...options }
  let queues

  try {
    queues = names.map(queue => new Queue(queue, { connection: opts.connection }))
    const requests = queues.map(async queue => await queue.getJobs(['wait'], 0, 0, !opts.lifo))
    const responses = await Promise.all(requests)
    const start = Date.now()
    let oldest = start

    for (const queue of responses) {
      for (const job of queue) {
        let jobStart

        if (job.processedOn) {
          // can't figure out a way to easily acquire the jobStart
          // after a failed attempt. While not ideal, leaving it on job.processedOn
          // for now to ensure latency increases.
          jobStart = job.processedOn // + await backoffDuration(job)
        } else {
          jobStart = job.timestamp + job.delay
        }

        if (jobStart < oldest) {
          oldest = jobStart
        }
      }
    }

    return Math.round((start - oldest) / 1000)
  } catch (err) {
    console.error('[@autoscale/queue-bullmq] latency error:', err)
    return null
  } finally {
    if (queues != null) {
      for (const queue of queues) {
        void queue.close()
      }
    }
  }
}

// Inadequate -- can't figure out custom backoff
// async function backoffDuration (job: Job): Promise<number> {
//   if (typeof job.opts.backoff === "number") {
//     return job.opts.backoff
//   } else if (job.opts.backoff != null) {
//     return Backoffs.calculate(job.opts.backoff, job.attemptsMade, new Error(), job)
//   }
//   return 0
// }
