import * as prismic from "@prismicio/client";
import fetch from "node-fetch";

const endpoint = prismic.getEndpoint("qwerty");
const client = prismic.createClient(endpoint, {
	// Here, we provide a way for the client to make network requests.
	// `node-fetch` is a Node.js fetch-compatible package.
	fetch,
});

const homepage = await client.getByUID("page", "home");
console.info(homepage);
// => The `page` document with a UID of `home`
