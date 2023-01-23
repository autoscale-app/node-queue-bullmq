# Autoscale.app Node Queue (BullMQ)

Package that calculates [BullMQ] queue metrics for use with the [Autoscale.app] [Agent].

## Installation

Add the package to your package.json:

    npm install @autoscale/queue-bullmq

## Usage

The following `latency` function can be used to determine the latency of the specified queue(s) in FIFO (default) or LIFO mode.

The return value of `latency` (`number` or `null`) is used in conjunction with the [Agent] package to make metrics available to [Autoscale.app] for the purpose of autoscaling [BullMQ] worker processes.

```ts
import { latency } from '@autoscale/queue-bullmq'

const OPTIONS = {
  lifo: false,
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
}

// Single queue latency example
await latency(['default'], OPTIONS) // => number | null

// Highest latency of multiple queue example
await latency(['email', 'sms'], OPTIONS) // => number | null
```

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
