# With TypeScript

This example shows how to use `@prismicio/client` with TypeScript. The client
library is written in TypeScript with TypeScript users in mind. All method
arguments and return types are properly specified and extendable where needed.

The example shows how to use `@prismicio/types` alongside the client library. By
using the types library, you can fully type client responses, including document
fields.

**Note**: This example is written for Node.js. If you plan to use this code for
the browser, you can remove `node-fetch` from the example.

```diff
   import * as prismic from '@prismicio/client'
-  import fetch from 'node-fetch'
```

## How to run the example

```sh
# Clone the repository to your computer
git clone https://github.com/prismicio/prismic-javascript.git
cd prismic-javascript/examples/with-typescript

# Install the dependencies
npm install

# Run the example
node --loader ts-node/esm index.ts
```
