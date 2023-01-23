import { setup, sleep } from "./helpers"
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

test("just enqueued", async () => {
  await queue.add("bullmq", {})
  await expect(queue.count()).resolves.toBe(1)
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(0)
})

test("enqueued 6 in FIFO mode in the last 3 seconds", async () => {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      queue.add("bullmq", {})
    }, 500 * i)
  }

  return new Promise(async (resolve, reject) => {
    await sleep(3000)

    try {
      await expect(queue.count()).resolves.toBe(6)
      await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(3)
      resolve(null)
    } catch (err) {
      reject(err)
    }
  })
})

test("enqueued 6 in LIFO mode in the last 3 seconds", async () => {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      queue.add("bullmq", {})
    }, 500 * i)
  }

  return new Promise(async (resolve, reject) => {
    await sleep(3000)

    try {
      await expect(queue.count()).resolves.toBe(6)
      await expect(latency(["bullmq"], LIFO_OPTIONS)).resolves.toBe(1)
      resolve(null)
    } catch (err) {
      reject(err)
    }
  })
})

test("null on error", async () => {
  jest.spyOn(Date, "now").mockImplementation(() => { throw new Error() })
  await expect(latency(["bullmq"], OPTIONS)).resolves.toBe(null)
})
