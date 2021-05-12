# @prismicio/client

The official JavaScript + TypeScript client library for [Prismic][prismic].

- Query content from a Prismic repository.
- Filter queries using [Predicates][prismic-predicates].
- Automatically query draft content during [preview sessions][prismic-previews].
- Built for browser and server usage.

```typescript
import * as prismic from '@prismicio/client'

// First, create a client
const endpoint = prismic.getEndpoint('my-repository')
const client = prismic.createClient(endpoint)

// Then query for your content
const response = await client.getAllByType('blog_post')
```

## Install

```sh
npm install @prismicio/client
```

## Documentation

For full documentation, visit the [Prismic documentation site][docs].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd
love to have you as part of the Prismic developer community!

**Reporting a bug**: [Open an issue][repo-issues] explaining your site's setup
and the bug you're encountering.

**Suggest an improvement**: [Open an issue][repo-issues] explaining your
improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes (1-10 lines), feel free to [open a
PR][repo-pull-requests] with a description of your changes. For large changes,
please first [open an issue][repo-issues] so we can discuss if and how the
changes should be implemented.

[prismic]: https://prismic.io
[prismic-predicates]:
  https://prismic.io/docs/technologies/query-predicate-reference-javascript
[prismic-previews]: https://prismic.io/docs/core-concepts/previews
[docs]: https://prismic.io/docs/technologies/javascript
[repo-issues]: https://github.com/prismicio/prismic-javascript/issues
[repo-pull-requests]: https://github.com/prismicio/prismic-javascript/pulls
