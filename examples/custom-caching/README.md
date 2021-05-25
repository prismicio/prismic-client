# Custom Caching

This example shows how to setup custom caching. Custom caching is useful when
using `@prismicio/client` on the server or if you need to hook into a
framework's cache.

Remember that in the browser, caching is enabled by default by using the global
[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
function. Browsers will automatically utilize their caching mechanism unless it
is disabled by a user.

**Note**: This example is written for Node.js. If you plan to use this code for
the browser, you can remove `node-fetch` from the example.

```diff
   import * as prismic from '@prismicio/client'
-  import fetch from 'node-fetch'
   import QuickLRU from 'quick-lru'
```

## How to run the example

```sh
# Clone the repository to your computer
git clone https://github.com/prismicio/prismic-javascript.git
cd prismic-javascript/examples/custom-caching

# Install the dependencies
npm install

# Run the example
node index.js
```
