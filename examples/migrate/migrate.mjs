import * as prismic from "@prismicio/client"
import { htmlAsRichText } from "@prismicio/migrate"
import wpFetch from "@wordpress/api-fetch"
import "dotenv/config"

import { repositoryName } from "./slicemachine.config.json"

// WordPress setup
wpFetch.use(wpFetch.createRootURLMiddleware("https://example.com/wp-json"))
const wpClient = {
	getPages: () => wpFetch({ path: "/wp/v2/pages?_embed" }),
	getPosts: () => wpFetch({ path: "/wp/v2/posts?_embed" }),
	getSettings: () => wpFetch({ path: "/wp/v2/settings?_embed" }),
}

// Prismic setup
const writeClient = prismic.createWriteClient(repositoryName, {
	writeToken: process.env.PRISMIC_WRITE_TOKEN,
})
const migration = prismic.createMigration()

// Transformation helpers
const transformWPPage = (wpPage) => {
	return migration.createDocument(
		{
			type: "page",
			lang: "en-us",
			uid: wpPage.slug,
			tags: ["wordpress"],
			data: {
				...transformWPMeta(wpPage.meta),
				title: wpHTMLAsRichText(wpPage.title.rendered),
				body: wpHTMLAsRichText(wpPage.content.rendered),
			},
		},
		wpPage.title.rendered,
	)
}

const transformWPPost = (wpPost) => {
	return migration.createDocument(
		{
			type: "post",
			lang: "en-us",
			uid: wpPost.slug,
			tags: ["wordpress"],
			data: {
				...transformWPMeta(wpPost.meta),
				title: wpHTMLAsRichText(wpPost.title.rendered),
				body: wpHTMLAsRichText(wpPost.content.rendered),
			},
		},
		wpPost.title.rendered,
	)
}

const transformWPSettings = (wpSettings) => {
	return migration.createDocument(
		{
			type: "settings",
			lang: "en-us",
			tags: ["wordpress"],
			data: {
				title: wpHTMLAsRichText(wpSettings.title),
				description: wpHTMLAsRichText(wpSettings.description),
			},
		},
		"Settings",
	)
}

const transformWPMeta = (meta) => {
	if (!meta || Array.isArray(meta)) {
		return {}
	}

	return {
		meta_title: meta.jetpack_seo_html_title,
		meta_description: meta.jetpack_seo_html_description,
		meta_image: migration.createAsset(
			meta.jetpack_seo_image_url,
			meta.jetpack_seo_image_name,
		),
	}
}

const wpHTMLAsRichText = (html) => {
	return htmlAsRichText(html, {
		serializer: {
			img: ({ node }) => {
				const src = node.properties.src
				const filename = src.split("/").pop()
				const alt = node.properties.alt

				return {
					type: "image",
					id: migration.createAsset(src, filename, { alt }),
				}
			},
		},
	}).result
}

// Extract data from WordPress
const [wpPages, wpPosts, wpSettings] = await Promise.all([
	wpClient.getPages(),
	wpClient.getPosts(),
	wpClient.getSettings(),
])

// Transform content to match Prismic model
for (const wpPost of wpPosts) {
	transformWPPost(wpPost)
}
for (const wpPage of wpPages) {
	transformWPPage(wpPage)
}
transformWPSettings(wpSettings)

// Upload content to Prismic
await writeClient.migrate(migration, {
	reporter: (event) => console.info(event),
})
