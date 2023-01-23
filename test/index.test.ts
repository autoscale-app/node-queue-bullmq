// import { setup, sleep } from "./helpers"
import { setup } from "./helpers"
import { latency } from "../src/index"
import { Queue } from "bullmq"

let queue: Queue
let queueB: Queue

const OPTIONS = {
  lifo: false,
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
}

const LIFO_OPTIONS = Object.assign({}, OPTIONS, {
  lifo: true
})

beforeAll(async () => {
  const options = {
    connection: {
      host: '127.0.0.1',
      port: 6379
    }
  }
  queue = new Queue("bullmq", options)
  queueB = new Queue("bullmq-b", options)
})

beforeEach(async () => {
  setup()
  await queue.drain(true)
  await queueB.drain(true)
})

afterAll(async () => {
  await queue.close()
  await queueB.close()
})

test("empty", async () => {
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(0)
})

test("enqueue 1 in FIFO", async () => {
  await queue.add("default", {})
  await expect(queue.count()).resolves.toBe(1)
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(0)
})

test("enqueue 1 in LIFO", async () => {
  await queue.add("default", {})
  await expect(queue.count()).resolves.toBe(1)
  await expect(latency(["bullmq"], LIFO_OPTIONS)).resolves.toBe(0)
})

test("enqueue 3 in FIFO mode in the last 3 seconds", async () => {
  for (let i = 3; i > 0; i--) {
    await queue.add("default", {}, { timestamp: Date.now() - (1000 * i) })
  }
  await expect(queue.count()).resolves.toBe(3)
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(3)
})

test("enqueue 3 in LIFO mode in the last 3 seconds", async () => {
  for (let i = 3; i > 0; i--) {
    await queue.add("default", {}, { timestamp: Date.now() - (1000 * i) })
  }
  await expect(queue.count()).resolves.toBe(3)
  await expect(latency(["bullmq"], LIFO_OPTIONS)).resolves.toBe(1)
})

test("enqueue 6 in the last 6 seconds between 2 queues", async () => {
  for (let i = 6; i > 3; i--) {
    await queue.add("default", {}, { timestamp: Date.now() - (1000 * i) })
  }
  for (let i = 3; i > 0; i--) {
    await queueB.add("default", {}, { timestamp: Date.now() - (1000 * i) })
  }

  await expect(queue.count()).resolves.toBe(3)
  await expect(queueB.count()).resolves.toBe(3)
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(6)
  await expect(latency(["bullmq-b"], OPTIONS)).resolves.toBe(3)
  await expect(latency(["bullmq", "bullmq-b"], OPTIONS)).resolves.toBe(6)
})

test("null return value on error", async () => {
  jest.spyOn(Date, "now").mockImplementation(() => { throw new Error() })
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(null)
})
