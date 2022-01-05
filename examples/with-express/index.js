import * as prismic from "@prismicio/client";
import PrismicDOM from "prismic-dom";
import fetch from "node-fetch";
import express from "express";
import QuickLRU from "quick-lru";

const endpoint = prismic.getEndpoint("qwerty");
const cache = new QuickLRU({
	maxSize: 1000, // 1000 entries
});

const client = prismic.createClient(endpoint, {
	fetch: async (url, options) => {
		// The cache key contains the requested URL and headers
		const key = JSON.stringify({ url, options });

		if (cache.has(key)) {
			// If the cache contains a value for the key, return it
			return cache.get(key);
		} else {
			// Otherwise, make the network request
			const res = await fetch(url, options);

			if (res.ok) {
				// If the request was successful, save it to the cache
				cache.set(key, res);
			}

			return res;
		}
	},
});

/**
 * This Express middleware automatically enables the client to fetch draft
 * content during a Prismic preview session.
 */
const prismicAutoPreviewsMiddleware = (req, _res, next) => {
	client.enableAutoPreviewsFromReq(req);

	next();
};

const app = express();

app.use(prismicAutoPreviewsMiddleware);

/**
 * This route will fetch all Article documents from the Prismic repository and
 * return a list of objects with formatted content.
 */
app.get("/articles", async (_req, res) => {
	const articles = await client.getAllByType("article");

	const payload = articles.map((article) => ({
		title: PrismicDOM.RichText.asText(article.data.title),
		description: PrismicDOM.RichText.asText(article.data.shortlede),
		content: PrismicDOM.RichText.asHtml(article.data.content),
	}));

	res.json(payload);
});

app.listen(3000);

console.info(`Open http://localhost:3000/articles to see the response`);
console.info("Press CTRL+C to stop the server");
