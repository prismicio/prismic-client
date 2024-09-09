# Avoid write client in browser

`@prismicio/client`'s write client uses credentials to authenticate write queries to a Prismic repository.

The repository write token and migration API key must be provided when creating a `@prismicio/client` write client like the following:

```typescript
import * as prismic from "@prismicio/client";

const writeClient = prismic.createWriteClient("example-prismic-repo", {
	writeToken: "xxx"
})
```

If the write client gets exposed to the browser, its credentials also do. This potentially exposes them to malicious actors.

When no write actions are to be performed, using a `@prismicio/client` regular client should be preferred. This client only has read access to a Prismic repository.

```typescript
import * as prismic from "@prismicio/client";

const client = prismic.createClient("example-prismic-repo")
```
