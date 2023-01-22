# Autoscale.app Node Queue (BullMQ)

Node library that calculates [BullMQ] queue metrics for use with the [Autoscale.app] [Agent].

## Installation

Add the package to your package.json:

    npm install @autoscale/queue-bullmq

## Usage

The following `latency` function can be used to determine the latency of the specified queue(s) in FIFO or LIFO mode.

The return value of `latency` (number or null) is used in conjunction with one of the [Agent] middleware libraries to make metrics available to [Autoscale.app].

```ts
import { latency } from '@autoscale/queue-bullmq'

const OPTIONS = {
  lifo: false,
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
}

await latency(['default'], OPTIONS) // => number | null
```

Note that only the 'wait' queue is used to measure latency. It is advised to have at least one worker running at all times, and to (auto)scale up when latency increases using [Autoscale.app].

## Development

Install dependencies:

    npm install

To lint:

    npm run lint

To test:

    npm test

To format:

    npm run format

To produce a build:

    npm run build

To bump to the next version:

    npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]

To release a new version:

    npm run release

To yank a release:

    npm unpublish [@autoscale/agent@<version>] --force

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/autoscale-app/node-queue-bullmq

[Autoscale.app]: https://autoscale.app
[Agent]: https://github.com/autoscale-app/node-agent
[BullMQ]: https://github.com/taskforcesh/bullmq
