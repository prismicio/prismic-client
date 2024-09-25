# `endpoint` must use CDN

`@prismicio/client` uses either a Prismic repository name or a repository-specific Document API endpoint to query content from Prismic.

The repository name must be provided when creating a `@prismicio/client` like the following:

```typescript
import * as prismic from "@prismicio/client";

const client = prismic.createClient("example-prismic-repo")
```

When creating a `@prismicio/client` with a repository endpoint (not recommended), the endpoint's subdomain must feature the `.cdn` suffix.

```typescript
import * as prismic from "@prismicio/client";

// ✅ Correct
const client = prismic.createClient("https://example-prismic-repo.cdn.prismic.io/api/v2")

// ❌ Incorrect
const client = prismic.createClient("https://example-prismic-repo.prismic.io/api/v2")
```

Not using the `.cdn` version of your repository endpoint can have unexpected side-effects and cause performance issues when querying Prismic.
