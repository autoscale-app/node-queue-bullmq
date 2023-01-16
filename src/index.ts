import { Queue } from "bullmq"
// import { Worker } from 'bullmq';

type RedisConnectionOptions = {
    host: string,
    port: number
}

type LatencyOptions = {
    lifo: boolean,
    connection: RedisConnectionOptions
}

const defaultLatencyOptions: LatencyOptions = {
    lifo: false,
    connection: {
        host: "localhost",
        port: 6379
    }
}

// @example
//   latency(["default"])
//   latency(["default", "low", "critical"], {lifo: true})
export async function latency(queues: string[], options: Partial<LatencyOptions> = {}) {
    try {
        const opts: LatencyOptions = validateLatencyOptions({ ...defaultLatencyOptions, ...options })
        const responses = await Promise.all(queues.map(queue => requestOldestJob(queue, opts)))
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
        console.error("autoscale-queue-bullmq error:", err)
        return null
    }
}

// @todo does connection close automatically?
function requestOldestJob(queue: string, options: LatencyOptions) {
    return new Queue(queue).getJobs(["wait"], 0, 0, !options.lifo)
}

function validateLatencyOptions(options: LatencyOptions) {
    // @todo
    return options
}

async function main() {
    // setTimeout(() => {
    //     new Worker('default', async (_) => {
    //         console.log("processing job")
    //     });
    // }, 5000)

    // const queue = new Queue("default")

    // setTimeout(async () => {
    //     await queue.add('wall', { color: 'pink' });
    // }, 1000)
    // setTimeout(async () => {
    //     await queue.add('wall', { color: 'pink' });
    // }, 2000)
    // setTimeout(async () => {
    //     await queue.add('wall', { color: 'pink' });
    // }, 3000)

    // setTimeout(async () => {
    //     await queue.add('wall', { color: 'pink' }, { lifo: true });
    // }, 1000)
    // setTimeout(async () => {
    //     await queue.add('wall', { color: 'pink' }, { lifo: true });
    // }, 2000)
    // setTimeout(async () => {
    //     await queue.add('wall', { color: 'pink' }, { lifo: true });
    // }, 3000)

    // setTimeout(async () => {
    //     console.log(await latency(["default"]))
    //     console.log(await latency(["default"], { lifo: true }))
    // }, 2000)

    // setInterval(async () => {
    //     console.log(await latency(["default"]))
    //     console.log(await latency(["default"], { lifo: true }))
    // }, 1000)

    // console.log(await queue.getJobs(["wait"], 0, 0, true)) // oldest for fifo
    // console.log(await queue.getJobs(["wait"], 0, 0, false)) // oldest for lifo
}

main()


// const queue = new Queue("foo")
// // const waiting = await queue.getJobs(["wait"], 0, 0, true) // if FIFO
// const waiting = await queue.getJobs(["wait"], 0, 0, false) // if LIFO
// console.log(waiting)

// function isObject(value) {
//     return Object.prototype.toString.call(value) === "[object Object]"
// }
