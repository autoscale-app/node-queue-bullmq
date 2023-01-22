export function setup () {
  jest.useRealTimers()
  jest.restoreAllMocks()
}

export function travelTo (datetime: string) {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(datetime))
}

export function travel (distance: number) {
  jest.advanceTimersByTime(distance)
}

export function sleep (n: number): Promise<null> {
  return new Promise(resolve => setTimeout(() => resolve(null), n))
}
