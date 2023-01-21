@TODO rewrite for BullMQ

# Autoscale.app Node Agent

Node library that provides Autoscale.app with metrics required for autoscaling.

## Installation

Add the package to your package.json:

    npm install @autoscale/agent

## Usage

This library is designed to be used as either a stand-alone library to dispatch metrics to the Autoscale.app metric servers, or as the foundation to easily build middleware for any Node web frameworks such as Express and Koa.

### Middleware

For middleware examples, see the following packages:

| Web Framework | Repository                                          |
|---------------|-----------------------------------------------------|
| Express       | https://github.com/autoscale-app/node-agent-express |
| Koa           | https://github.com/autoscale-app/node-agent-koa     |

In most cases you'll be using node-agent through one of the middleware packages.

The middleware approach is suitable for both web and worker autoscaling.

### Stand-alone

The following example demonstrates how to report ([BullMQ](https://github.com/taskforcesh/bullmq)) queue latency for the default queue.

```ts
import { Agent } from "@autoscale/agent"
import { latency } from "@autoscale/queue-bullmq"

const PLATFORM = "render"
const WORKER = process.env("WORKER_METRIC_TOKEN")

new Agent(PLATFORM).dispatch(WORKER, () => latency(["default"]))
```

This will periodically call the latency function and dispatch (report) the result in the background.

The stand-alone approach is only suitable for worker autoscaling.

## Related Packages

The following packages are currently available.

#### Agents (Web Framework Middleware)

| Web Framework | Repository                                          |
|---------------|-----------------------------------------------------|
| Express       | https://github.com/autoscale-app/node-agent-express |
| Koa           | https://github.com/autoscale-app/node-agent-koa     |

#### Queues (Worker Library Helpers)

| Worker Library | Repository                                         |
|----------------|----------------------------------------------------|
| BullMQ         | https://github.com/autoscale-app/node-queue-bullmq |

Get in touch if your preferred integration isn't available and we'll check if we can add support for it.

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

Bug reports and pull requests are welcome on GitHub at https://github.com/autoscale-app/node-agent
