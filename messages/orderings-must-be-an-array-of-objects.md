# `orderings` must be an array of objects

Prismic's Rest API accepts an `orderings` parameter to determine the sort order of query results.

The `orderings` parameter can be provided to `@prismicio/client` queries like the following:

```typescript
import * as prismic from "@prismicio/client"

const client = prismic.createClient("my-repo-name")

const blogPosts = await client.getAllByType("blog_post", {
	orderings: [
		{ field: "my.blog_post.published_at", direction: "desc" },
		{ field: "blog_post.first_publication_date", direction: "desc" },
		{ field: "my.blog_post.title" },
	],
})
```

This query will fetch all `blog_post` documents sorted in the following order:

1. By the `published_at` field in descending order.
2. By the `first_publication_date` metadata in descending order.
3. By the `title` field in ascending order.

## Strings and arrays of strings are deprecated

In versions of `@prismicio/client` < v7.0, the `orderings` parameter could be provided as a string or an array of strings.

**Strings and arrays of strings as `orderings` values are deprecated**. Use the object syntax instead.

```typescript
// ✅ Correct
await client.getAllByType("blog_post", {
	orderings: [
		{ field: "my.blog_post.published_at", direction: "desc" },
		{ field: "blog_post.first_publication_date", direction: "desc" },
		{ field: "my.blog_post.title" },
	],
})

// ❌ Incorrect
await client.getAllByType("blog_post", {
	orderings: [
		"my.blog_post.published_at desc",
		"blog_post.first_publication_date desc",
		"my.blog_post.title",
	],
})

// ❌ Incorrect
await client.getAllByType("blog_post", {
	orderings:
		"my.blog_post.published_at desc,blog_post.first_publication_date desc,my.blog_post.title",
})
```
