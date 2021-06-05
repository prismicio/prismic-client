# Multiple Languages

This example shows how to query for documents of different languages. By
default, the client will return documents from your repository's default
language.

The example demonstrates how the `lang` parameter can be used to override the
default behavior. If you want to query for a document with a language, pass the
language identifier in any client `get` method.

The example also shows how to set default parameters on the client. In this
example, we set `en-us` as the default language to query.

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
cd prismic-javascript/examples/multiple-languages

# Install the dependencies
npm install

# Run the example
node index.js
```
