# Prefer repository name

`@prismicio/client` uses either a Prismic repository name or a repository-specific Document API endpoint to query content from Prismic.

The repository name must be provided when creating a `@prismicio/client` like the following:

```typescript
import * as prismic from "@prismicio/client";

const client = prismic.createClient("example-prismic-repo")
```

When proxying a Prismic API v2 repository endpoint (not recommended), the `documentAPIEndpoint` option can be used to specify that endpoint.

```typescript
import * as prismic from "@prismicio/client"

// ✅ Correct
const client = prismic.createClient("my-repo-name", {
	documentAPIEndpoint: "https://example.com/my-prismic-proxy"
})

// ❌ Incorrect: repository name can't be inferred from a proxied endpoint
const client = prismic.createClient("https://example.com/my-prismic-proxy", {
	documentAPIEndpoint: "https://example.com/my-prismic-proxy"
})
```

Proxying a Prismic API v2 repository endpoint can have unexpected side-effects and cause performance issues when querying Prismic.
