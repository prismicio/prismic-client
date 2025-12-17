import * as prismic from "@prismicio/client"
import { htmlAsRichText } from "@prismicio/migrate"
import wpFetch from "@wordpress/api-fetch"
import "dotenv/config"
import type {
	WP_REST_API_Page,
	WP_REST_API_Pages,
	WP_REST_API_Post,
	WP_REST_API_Posts,
	WP_REST_API_Settings,
} from "wp-types"

import { repositoryName } from "./slicemachine.config.json"

// WordPress setup
wpFetch.use(wpFetch.createRootURLMiddleware("https://example.com/wp-json"))
const wpClient = {
	getPages: () => wpFetch<WP_REST_API_Pages>({ path: "/wp/v2/pages?_embed" }),
	getPosts: () => wpFetch<WP_REST_API_Posts>({ path: "/wp/v2/posts?_embed" }),
	getSettings: () =>
		wpFetch<WP_REST_API_Settings>({ path: "/wp/v2/settings?_embed" }),
}

// Prismic setup
const writeClient = prismic.createWriteClient(repositoryName, {
	writeToken: process.env.PRISMIC_WRITE_TOKEN!,
})
const migration = prismic.createMigration()

// Transformation helpers
const transformWPPage = (wpPage: WP_REST_API_Page) => {
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

const transformWPPost = (wpPost: WP_REST_API_Post) => {
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

const transformWPSettings = (wpSettings: WP_REST_API_Settings) => {
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

const transformWPMeta = (meta: WP_REST_API_Page["meta"]) => {
	if (!meta || Array.isArray(meta)) {
		return {}
	}

	return {
		meta_title: meta.jetpack_seo_html_title,
		meta_description: meta.jetpack_seo_html_description,
		meta_image: migration.createAsset(
			meta.jetpack_seo_image_url as string,
			meta.jetpack_seo_image_name as string,
		),
	}
}

const wpHTMLAsRichText = (html: string) => {
	return htmlAsRichText(html, {
		serializer: {
			img: ({ node }) => {
				const src = node.properties.src as string
				const filename = src.split("/").pop()!
				const alt = node.properties.alt as string

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
