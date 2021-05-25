# Server Usage

This example shows how to use `@prismicio/client` on the server. Usage is
identical to usage in the browser, except for the need to provide a `fetch()`
function.

In this example, we're using a library called [node-fetch][node-fetch] to make
network requests. This is a nearly drop-in Node.js implementation for the
browser's `fetch()` function.

For our use-case, its only limitation is the lack of built-in caching. If you
are running in a serverless architecture where instances are started and stopped
per-request, caching is unnecessary. If you are running on a long-living server,
caching would be beneficial. See the [Custom Caching](../custom-caching) example
to see how to setup caching.

## How to run the example

```sh
# Clone the repository to your computer
git clone https://github.com/prismicio/prismic-javascript.git
cd prismic-javascript/examples/server-usage

# Install the dependencies
npm install

# Run the example
node index.js
```

[node-fetch]: https://github.com/node-fetch/node-fetch
