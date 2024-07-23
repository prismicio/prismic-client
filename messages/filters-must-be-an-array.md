# `filters` must be an array

Prismic queries can be filtered using the `filters` query parameter.

The `filters` parameter accepts an array of filters like the following:

```typescript
import * as prismic from "@prismicio/client"

const client = prismic.createClient("my-repo-name")

const blogPosts = await client.getAllByType("blog_post", {
	filters: [
		prismic.filter.not("my.document.uid", "hidden"),
		prismic.filter.dateBefore(
			"document.first_publication_date",
			new Date("1991-03-07"),
		),
	],
})
```

This query will fetch all `blog_post` documents _except_ those that:

1. Have a UID of `"hidden"`.
2. Were first published before March 7, 1991.

## Non-array values are deprecated

In versions of `@prismicio/client` < v7.0, the `filters` parameter (previously called the `predicates` parameter) could be provided as a single string.

**Strings as `filters` values are deprecated**. Use an array instead.

```typescript
// ✅ Correct
await client.getAllByType("blog_post", {
	filters: [
		prismic.filter.not("my.document.uid", "hidden"),
		prismic.filter.dateBefore(
			"document.first_publication_date",
			new Date("1991-03-07"),
		),
	],
})

// ❌ Incorrect
await client.getAllByType("blog_post", {
	filters: prismic.filter.not("my.document.uid", "hidden"),
})
```
