import { setup, sleep } from "./helpers"
import { latency } from "../src/index"
import { Queue } from "bullmq"

let queue: Queue

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
  await expect(latency(["bullmq"])).resolves.toBe(0)
})

test("just enqueued", async () => {
  await queue.add("bullmq", {})
  await expect(queue.count()).resolves.toBe(1)
  await expect(latency(["bullmq"])).resolves.toBe(0)
})

test("enqueued 10 in the last second", async () => {
  for (let i = 0; i < 10; i++) {
    queue.add("bullmq", {})
  }

  return new Promise(async (resolve, reject) => {
    await sleep(1000)

    try {
      await expect(queue.count()).resolves.toBe(10)
      await expect(latency(["bullmq"])).resolves.toBe(1)
      resolve(null)
    } catch (err) {
      reject(err)
    }
  })
})
