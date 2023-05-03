# `endpoint` must use CDN

`@prismicio/client` uses either a Prismic repository name or a Prismic Rest API v2 repository endpoint to query content from Prismic.

The repository name or repository endpoint must be provided when creating a `@prismicio/client` like the following:

```typescript
import * as prismic from "@prismicio/client";

// Using the repository name
const client = prismic.createClient("example-prismic-repo")

// Using the repository endpoint
const client = prismic.createClient("https://example-prismic-repo.cdn.prismic.io/api/v2")
```

When creating a `@prismicio/client` with a repository endpoint, the endpoint's subdomain must feature the `.cdn` suffix.

```typescript
import * as prismic from "@prismicio/client";

// ✅ Correct
const client = prismic.createClient("https://example-prismic-repo.cdn.prismic.io/api/v2")

// ❌ Incorrect
const client = prismic.createClient("https://example-prismic-repo.prismic.io/api/v2")
```

Not using the `.cdn` version of your repository endpoint can have unexpected side-effects and cause performance issues when querying Prismic.
