import { Queue, Backoffs, type BackoffStrategy, type Job } from 'bullmq'

// export type BackoffStrategy = (
//   attemptsMade?: number,
//   type?: string,
//   err?: Error,
//   job?: MinimalJob,
// ) => Promise<number> | number;

interface LatencyOptions {
  lifo: boolean
  connection: RedisConnectionOptions
  backoffStrategy?: BackoffStrategy
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
          jobStart = job.processedOn + await backoffDelay(job, opts.backoffStrategy)
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

async function backoffDelay (job: Job, backoffStrategy?: BackoffStrategy): Promise<number> {
  if (job.opts.backoff == null) {
    return 0
  }

  const backoffOptions = Backoffs.normalize(job.opts.backoff)
  return await Backoffs.calculate(backoffOptions, job.attemptsMade, new Error(), job, backoffStrategy)
}
