# With Express

This example shows how to setup `@prismicio/client` for use within an
[Express](https://expressjs.com/) app. Although Express is being used here, the
same concept applies to similar server libraries, like
[Fastify](https://www.fastify.io/), [Koa](https://koajs.com/), and
[Next.js](https://nextjs.org/).

In this example, we setup a client for server usage by providing it a `fetch()`
compatible function via
[`node-fetch`](https://github.com/node-fetch/node-fetch). We also implement
client caching using [`quick-lru`](https://github.com/sindresorhus/quick-lru).

We also create and register a `prismicAutoPreviewsMiddleware` Express
middleware. This automatically enables the client to fetch draft content during
a Prismic preview session.

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

Once the server is started, open <http://localhost:3000> to view the API. Then
refresh the page to see how subsequent requests are much quicker due to the
cache we set up.
