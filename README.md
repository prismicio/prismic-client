# @prismicio/client

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

The official JavaScript + TypeScript client library for [Prismic][prismic].

- Query content from a Prismic repository.
- Refines queries using [Filters][prismic-filters].
- Automatically query draft content during [preview sessions][prismic-previews].
- Built for browser and server usage.

```typescript
import * as prismic from "@prismicio/client";

// Create a client
const client = prismic.createClient("my-repository");

// Then query for your content
const blogPosts = await client.getAllByType("blog_post");
```

## Install

```bash
npm install @prismicio/client
```

## Documentation

To discover what's new on this package check out [the changelog][changelog]. For full documentation, visit the [official Prismic documentation][prismic-docs].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a pull request][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

For more clarity on this project and its structure you can also check out the detailed [CONTRIBUTING.md][contributing] document.

## License

```
   Copyright 2013-2023 Prismic <contact@prismic.io> (https://prismic.io)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

<!-- Links -->

[prismic]: https://prismic.io
[prismic-filters]: https://prismic.io/docs/rest-api-technical-reference#q
[prismic-previews]: https://prismic.io/docs/guides/previews
[prismic-docs]: https://prismic.io/docs/technical-reference/prismicio-client
[changelog]: ./CHANGELOG.md
[contributing]: ./CONTRIBUTING.md
[forum-question]: https://community.prismic.io/c/kits-and-dev-languages/javascript/14
[repo-bug-report]: https://github.com/prismicio/prismic-client/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/prismic-client/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/prismic-client/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@prismicio/client/latest.svg
[npm-version-href]: https://npmjs.com/package/@prismicio/client
[npm-downloads-src]: https://img.shields.io/npm/dm/@prismicio/client.svg
[npm-downloads-href]: https://npmjs.com/package/@prismicio/client
[github-actions-ci-src]: https://github.com/prismicio/prismic-client/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/prismicio/prismic-client/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio/prismic-client.svg
[codecov-href]: https://codecov.io/gh/prismicio/prismic-client
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/@prismicio/client.svg
[license-href]: https://npmjs.com/package/@prismicio/client
