import * as prismic from "@prismicio/client";
import fetch from "node-fetch";

const endpoint = prismic.getEndpoint("qwerty");
const client = prismic.createClient(endpoint, {
	fetch,
});

// By default, the client will fetch the latest published content from the repository.
// This means content is fetched from the "master ref".
const homepage = await client.getByUID("page", "home");
console.info(homepage);

// We can get a list of all refs in a repository.
const refs = await client.getRefs();
console.info(refs);

// Or we can get a specific ref by its label.
// If we have an ID instead, `client.getRefByID` can be used.
const ref = await client.getRefByLabel("My Specific Ref");

// If we want to query content from a specific ref, we can tell the client to
// make all future queries use that ref.
client.queryContentFromRef(ref.ref);

// Now queries will fetch content from the "My Specific Ref" ref.
const aboutPage = await client.getByUID("page", "about");
console.info(aboutPage);

// We can also override the ref on a per-query basis.
const otherRef = await client.getRefByLabel("My Other Ref");
const contactPage = await client.getByUID("page", "contact", {
	ref: otherRef.ref,
});
console.info(contactPage);

// We can change back to fetching the latest content with the following function.
client.queryLatestContent();
