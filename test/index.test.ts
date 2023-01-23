// import { setup, sleep } from "./helpers"
import { setup } from "./helpers"
import { latency } from "../src/index"
import { Queue } from "bullmq"

let queue: Queue

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
  queue = new Queue("bullmq", {
    connection: {
      host: '127.0.0.1',
      port: 6379
    }
  })
})

beforeEach(async () => {
  setup()
  await queue.drain(true)
})

afterAll(async () => {
  await queue.close()
})

test("empty", async () => {
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(0)
})

test("just enqueued in FIFO", async () => {
  await queue.add("bullmq", {})
  await expect(queue.count()).resolves.toBe(1)
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(0)
})

test("just enqueued in LIFO", async () => {
  await queue.add("bullmq", {})
  await expect(queue.count()).resolves.toBe(1)
  await expect(latency(["bullmq"], LIFO_OPTIONS)).resolves.toBe(0)
})

test("enqueued 3 in FIFO mode in the last 3 seconds", async () => {
  for (let i = 3; i > 0; i--) {
    await queue.add("bullmq", {}, { timestamp: Date.now() - (1000 * i) })
  }
  await expect(queue.count()).resolves.toBe(3)
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(3)
})

test("enqueued 3 in LIFO mode in the last 3 seconds", async () => {
  for (let i = 3; i > 0; i--) {
    await queue.add("bullmq", {}, { timestamp: Date.now() - (1000 * i) })
  }
  await expect(queue.count()).resolves.toBe(3)
  await expect(latency(["bullmq"], LIFO_OPTIONS)).resolves.toBe(1)
})

test("null on error", async () => {
  jest.spyOn(Date, "now").mockImplementation(() => { throw new Error() })
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(null)
})
