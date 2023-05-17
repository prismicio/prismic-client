# Timeout Requests

This example shows how to use `@prismicio/client` with an explicit request timeout limit. `fetch()` implementations typically have their own default timeout limit. Chrome, for example, times out requests after 300 seconds, while Firefox times outs at 90 seconds.

If you want to customize this value, you can use an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) to cancel (or "abort") a request after a certain duration.

In this example, we're using a library called [node-fetch][node-fetch] to make network requests. This is a nearly drop-in Node.js implementation for the browser's `fetch()` function.

We're also using a library called [abort-controller][abort-controller] to cancel network requests. This is only necessary in Node.js versions older than 15.0.0. Anything newer, or when using in the browser, does not require this library.

**Note**: This example is written for Node.js. If you plan to use this code for
the browser, you can remove `node-fetch` and `abort-controller` from the example.

```diff
  import * as prismic from '@prismicio/client'
- import fetch from 'node-fetch'
- import { AbortController } from "abort-controller";
```

## How to run the example

```sh
# Clone the repository to your computer
git clone https://github.com/prismicio/prismic-client.git
cd prismic-client/examples/custom-timeout

# Install the dependencies
npm install

# Run the example
node index.js
```

[node-fetch]: https://github.com/node-fetch/node-fetch
[abort-controller]: https://github.com/mysticatea/abort-controller
