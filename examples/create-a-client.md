# Create a client

Creating a client looks like the following example:

```typescript
import * as prismic from '@prismicio/client'

const endpoint = prismic.getEndpoint('my-repo')
const client = prismic.createClient(endpoint)
```

1. **Import the module.**

   ```typescript
   import * as prismic from '@prismicio/client'
   ```

   Importing using `import * as prismic` is recommended here to create a
   collection of Prismic-related functions.

   This library is written using
   [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
   which will enable bundlers like [webpack](https://webpack.js.org/) and
   [Rollup](https://rollupjs.org/) to
   [tree shake](https://webpack.js.org/guides/tree-shaking/) and only import
   what is used in your project.

2. **Get your Prismic repository's API endpoint.**

   ```typescript
   const endpoint = prismic.getEndpoint('my-repo')
   ```

   This will return the recommended API endpoint URL. It will automatically
   utilize Prismic's API CDN to ensure your query requests are efficient.

   If you need to use a specific endpoint for your repository, such as routing
   through a proxy, you can ignore the `getEndpoint()` function and provide your
   API endpoint as a string like the following example.

   ```typescript
   const endpoint = 'https://my-proxy.example.com'
   ```

3. **Create the Prismic client.**

   ```typescript
   const client = prismic.createClient(endpoint)
   ```

   The `createClient()` function will return a Prismic client for your
   repository. You can use it to query content and information about your
   repository.

The client can now be passed around your application as needed.
