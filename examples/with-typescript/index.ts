import * as prismic from "@prismicio/client"
import fetch from "node-fetch"

// See `./types.ts` for the document types.
import type { AllDocumentTypes } from "./types"

const main = async () => {
	// You can pass a union of document types to `createClient()`.
	// All query methods will now be typed appropriately. Methods that
	// accept a document type, for example, will return the correct type
	// for that document type.
	const client = prismic.createClient<AllDocumentTypes>("qwerty", { fetch })

	const homepage = await client.getByUID("page", "home")
	//    ^ Typed as PageDocument

	const type = homepage.type
	//                    ^ Typed as "page"
	console.info("title: ", type)

	const lang = homepage.lang
	//                    ^ Typed as `"en-us" | "fr-fr"`
	console.info("lang: ", lang)

	const title = homepage.data.title
	//                          ^ Typed as `string | null`
	console.info("title: ", title)

	// @ts-expect-error - non_existent_field does not exist in `data`
	const nonExistentField = homepage.data.non_existent_field
	// TypeScript Error: Property 'non_existent_field' does not exist on type 'PageDocument['data']'.
	console.info("nonExistentField: ", nonExistentField)

	const blogPosts = await client.getAllByType("blog_post")
	//    ^ Typed as BlogPostDocument[]
	console.info("blogPosts: ", blogPosts)

	// @ts-expect-error - "settings" is a not a valid document type.
	await client.getAllByType("settings")
	// TypeScript Error: Argument of type '"settings"' is not assignable to parameter of type '"page" | "blog_post"'.
}

main()
