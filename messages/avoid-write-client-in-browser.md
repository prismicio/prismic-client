# Avoid write client in browser

`@prismicio/client`'s write client uses credentials to authenticate write queries to a Prismic repository.

The repository write token and Migration API key must be provided when creating a `@prismicio/client` write client like the following:

```typescript
import * as prismic from "@prismicio/client";

const writeClient = prismic.createWriteClient("example-prismic-repo", {
	writeToken: "xxx"
})
```

If the write client is exposed to the browser, so are its tokens. Malicious actors will have write access to your repository.

Use the non-write client when write actions are not needed. The non-write client only has read access to the repository and can safely be used in the browser. Be aware the client's access token, if used, will be exposed in the browser.

```typescript
import * as prismic from "@prismicio/client";

const client = prismic.createClient("example-prismic-repo")
```
