import * as prismic from "@prismicio/client";
import * as prismicT from "@prismicio/types";
import fetch from "node-fetch";

/**
 * A Page document from Prismic.
 */
type PrismicDocumentPage = prismicT.PrismicDocument<
	{
		title: prismicT.KeyTextField;
		footnotes: prismicT.RichTextField;
	},
	"page",
	"en-us" | "fr-fr"
>;

/**
 * A Blog Post document from Prismic. This example contains Slices.
 */
type PrismicSliceBlogPostBodyText = prismicT.Slice<
	"text",
	never,
	{
		text: prismicT.RichTextField;
	}
>;
type PrismicSliceBlogPostBodyImageGallery = prismicT.Slice<
	"image_gallery",
	never,
	{
		image: prismicT.ImageField;
		caption: prismicT.KeyTextField;
	}
>;
type PrismicSliceBlogPostBodyQuote = prismicT.Slice<
	"quote",
	{
		quote: prismicT.RichTextField;
		quotee: prismicT.KeyTextField;
	}
>;
type PrismicDocumentBlogPost = prismicT.PrismicDocument<
	{
		title: prismicT.KeyTextField;
		description: prismicT.RichTextField;
		body: prismicT.SliceZone<
			| PrismicSliceBlogPostBodyText
			| PrismicSliceBlogPostBodyImageGallery
			| PrismicSliceBlogPostBodyQuote
		>;
	},
	"page",
	"en-us" | "fr-fr"
>;

const main = async () => {
	const endpoint = prismic.getEndpoint("qwerty");
	const client = prismic.createClient(endpoint, { fetch });

	// We can pass a type to client methods that return documents.
	// Here, we tell `client.getByUID` that the document type will be a `PrismicDocumentPage`.
	const homepage = await client.getByUID<PrismicDocumentPage>("page", "home");
	// => The Page document with a UID of `home`

	const type = homepage.type;
	// => Typed as `"page"`
	console.info("title: ", type);

	const lang = homepage.lang;
	// => Typed as `"en-us" | "fr-fr"`
	console.info("lang: ", lang);

	const title = homepage.data.title;
	// => Typed as `string | null`
	console.info("title: ", title);

	// @ts-expect-error - non_existant_field does not exist in `data`
	const nonExistantField = homepage.data.non_existant_field;
	// TypeScript Error: Property 'non_existant_field' does not exist on type '{ title: KeyTextField; }'
	console.info("nonExistantField: ", nonExistantField);

	const blogPosts = await client.getAllByType<PrismicDocumentBlogPost>(
		"blog_post",
	);
	// => All Blog Post documents.
	console.info("blogPosts: ", blogPosts);
};

main();
