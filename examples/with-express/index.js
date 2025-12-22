import * as prismic from "@prismicio/client"
import express from "express"
import fetch from "node-fetch"
import QuickLRU from "quick-lru"

const cache = new QuickLRU({
	maxSize: 1000, // 1000 entries
})

/**
 * This function returns a Prismic client for the repository. A new client
 * should be created for each Express request since a client can contain
 * request-specific settings, such as enabling Preview mode.
 *
 * The cache will be shared between all clients.
 */
const createClient = ({ req } = {}) => {
	const client = prismic.createClient("qwerty", {
		fetch: async (url, options) => {
			// The cache key contains the requested URL and headers
			const key = JSON.stringify({ url, options })

			if (cache.has(key)) {
				// If the cache contains a value for the key, return it
				return cache.get(key).clone()
			} else {
				// Otherwise, make the network request
				const res = await fetch(url, options)

				if (res.ok) {
					// If the request was successful, save it to the cache
					cache.set(key, res.clone())
				}

				return res
			}
		},
	})

	if (req) {
		client.enableAutoPreviewsFromReq(req)
	}

	return client
}

const app = express()

/**
 * This route will fetch all Article documents from the Prismic repository and
 * return a list of objects with formatted content.
 */
app.get("/articles", async (req, res) => {
	const client = createClient({ req })
	const articles = await client.getAllByType("article")

	const payload = articles.map((article) => ({
		title: prismic.asText(article.data.title),
		description: prismic.asText(article.data.shortlede),
		content: prismic.asHTML(article.data.content),
	}))

	res.json(payload)
})

app.listen(3000)

console.info(`Open http://localhost:3000/articles to see the response`)
console.info("Press CTRL+C to stop the server")
