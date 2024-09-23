import * as prismic from "@prismicio/client"
import { htmlAsRichText } from "@prismicio/migrate"
import "dotenv/config"
// An hypothetical WordPress client
// @ts-expect-error - This is an hypothetical WordPress client
import { type WPDocument, createWordPressClient } from "wordpress"

import { repositoryName } from "./slicemachine.config.json"

// Prismic setup
const writeClient = prismic.createWriteClient(repositoryName, {
	writeToken: process.env.PRISMIC_WRITE_TOKEN!,
})

const migration = prismic.createMigration()

// Custom migration script logic

const convertWPDocument = (wpDocument: WPDocument) => {
	switch (wpDocument.type) {
		case "page":
			return convertWPPage(wpDocument)
		case "settings":
			return convertWPSettings(wpDocument)
	}

	throw new Error(`Unsupported document type: ${wpDocument.type}`)
}

const convertWPPage = (wpPage: WPDocument) => {
	return migration.createDocument(
		{
			type: "page",
			lang: wpPage.lang,
			uid: wpPage.slug,
			tags: ["wordpress"],
			data: {
				meta_title: wpPage.meta_title,
				meta_description: wpPage.meta_description,
				meta_image: migration.createAsset(
					wpPage.meta_image.url,
					wpPage.meta_image.name,
				),
				title: wpHTMLAsRichText(wpPage.title),
				body: wpHTMLAsRichText(wpPage.content),
			},
		},
		wpPage.name,
		{
			masterLanguageDocument: () =>
				migration.getByUID(
					wpPage.masterLanguageDocument.type,
					wpPage.masterLanguageDocument.uid,
				),
		},
	)
}

const convertWPSettings = (wpSettings: WPDocument) => {
	return migration.createDocument(
		{
			type: "settings",
			lang: wpSettings.lang,
			tags: ["wordpress"],
			data: {
				title: wpHTMLAsRichText(wpSettings.name),
			},
		},
		"Settings",
	)
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

// Fetching and converting WordPress documents
const wpClient = createWordPressClient("https://example.com/wp-json")

const wpDocuments = await wpClient.dangerouslyGetAllDocuments()

for (const wpDocument of wpDocuments) {
	convertWPDocument(wpDocument)
}

// Execute the prepared migration at the very end of the script
await writeClient.migrate(migration, {
	reporter: (event) => console.info(event),
})
