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

// We can get a list of all releases in a repository.
const releases = await client.getReleases();
console.info(releases);

// Or we can get a specific release by its label.
// If we have an ID instead, `client.getReleaseByID` can be used.
const release = await client.getReleaseByLabel("My Specific Release");
console.info(release);

// We can tell the client to make all queries point to a released called "My Release".
// We could also use `client.queryContentFromReleaseByID` if we have an ID instead.
client.queryContentFromReleaseByLabel("My Release");

// Now queries will fetch content from "My Release".
const aboutPage = await client.getByUID("page", "about");
console.info(aboutPage);

// We can also override the release on a per-query basis.
const otherRelease = await client.getReleaseByLabel("My Other Release");
const contactPage = await client.getByUID("page", "contact", {
	ref: otherRelease.ref,
});
console.info(contactPage);

// We can change back to fetching the latest content with the following function.
client.queryLatestContent();
