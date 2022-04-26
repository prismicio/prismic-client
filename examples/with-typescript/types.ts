import * as prismicT from "@prismicio/types";

/**
 * A union of all possible Prismic Document types.
 */
export type AllDocumentTypes = PageDocument | BlogPostDocument;

/**
 * A Page document from Prismic.
 */
export type PageDocument = prismicT.PrismicDocument<
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
export type BlogPostDocument = prismicT.PrismicDocument<
	{
		title: prismicT.KeyTextField;
		description: prismicT.RichTextField;
		body: prismicT.SliceZone<
			| PrismicSliceBlogPostBodyText
			| PrismicSliceBlogPostBodyImageGallery
			| PrismicSliceBlogPostBodyQuote
		>;
	},
	"blog_post",
	"en-us" | "fr-fr"
>;
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
