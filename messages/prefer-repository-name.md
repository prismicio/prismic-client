# Prefer repository name

`@prismicio/client` uses either a Prismic repository name or a Prismic Rest API v2 repository endpoint to query content from Prismic.

The repository name or repository endpoint must be provided when creating a `@prismicio/client` like the following:

```typescript
import * as prismic from "@prismicio/client";

// Using the repository name
const client = prismic.createClient("example-prismic-repo")

// Using the repository endpoint
const client = prismic.createClient("https://example-prismic-repo.cdn.prismic.io/api/v2")
```

When proxying a Prismic API v2 repository endpoint (not recommended), the `apiEndpoint` option can be used to specify that endpoint explicitly. When doing so, if a repository endpoint is also provided as the first parameter, it should match the provided `apiEndpoint`.

```typescript
import * as prismic from "@prismicio/client"

// ✅ Correct
const client = prismic.createClient("my-repo-name", {
	apiEndpoint: "https://example.com/my-repo-name/prismic"
})

// ✅ Correct
const client = prismic.createClient("https://example.com/my-repo-name/prismic", {
	apiEndpoint: "https://example.com/my-repo-name/prismic"
})

// ❌ Incorrect
const client = prismic.createClient("https://example-prismic-repo.cdn.prismic.io/api/v2", {
	apiEndpoint: "https://example.com/my-repo-name/prismic"
})
```

Proxying a Prismic API v2 repository endpoint can have unexpected side-effects and cause performance issues when querying Prismic.
