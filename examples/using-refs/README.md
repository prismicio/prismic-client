# Using Refs

This example shows how to query for content from different "refs". Refs are
identifiers for different content versions of your repository. Each edit to a
document and creation of a Release generates a new ref.

The example demonstrates how to setup the client to point the client to a
specific ref using its label. It also demonstrates how to revert it to the default
setting of querying the latest published content. Finally, it also demonstrates
how to override this on a per-query basis.

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
cd prismic-javascript/examples/using-refs

# Install the dependencies
npm install

# Run the example
node index.js
```
