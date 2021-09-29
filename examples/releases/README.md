# Releases

This example shows how to query for content from Releases. Releases are used to
group content changes within Prismic.

The example demonstrates how to setup the client to point the client to a
Release using its label. It also demonstrates how to revert it to the default
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
git clone https://github.com/prismicio/prismic-client.git
cd prismic-client/examples/releases

# Install the dependencies
npm install

# Run the example
node index.js
```
