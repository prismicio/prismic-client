import * as prismic from "@prismicio/client";
import fetch from "node-fetch";

const endpoint = prismic.getEndpoint("qwerty");
const client = prismic.createClient(endpoint, {
	fetch
});

// We can tell the client to make all queries point to a released called "My Release".
// We could also use `client.queryContentFromReleaseByID` if we have an ID instead.
await client.queryContentFromReleaseByLabel("My Release");

const homepage = await client.getByUID("page", "home");
console.info(homepage);
// => The `page` document with a UID of `home` with edits from "My Release"

// Now the client will point all queries to the latest published content.
await client.queryCurrentContent();

const aboutPage = await client.getByUID("page", "about");
console.info(aboutPage);
// => The `page` document with a UID of `about`

// At any point, we can override which "ref" the client uses to query for content.
// This will only affect this query.
const releases = await client.getReleases();
const contactPage = await client.getByUID("page", "contact", {
	ref: releases[0].ref
});
console.info(contactPage);
// => The `page` document with a UID of `contact` from the given ref.
