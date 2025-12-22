import type * as prismic from "@prismicio/client"

/**
 * A union of all possible Prismic Document types.
 */
export type AllDocumentTypes = PageDocument | BlogPostDocument

/**
 * A Page document from Prismic.
 */
export type PageDocument = prismic.PrismicDocument<
	{
		title: prismic.KeyTextField
		footnotes: prismic.RichTextField
	},
	"page",
	"en-us" | "fr-fr"
>

/**
 * A Blog Post document from Prismic. This example contains Slices.
 */
export type BlogPostDocument = prismic.PrismicDocument<
	{
		title: prismic.KeyTextField
		description: prismic.RichTextField
		body: prismic.SliceZone<
			| PrismicSliceBlogPostBodyText
			| PrismicSliceBlogPostBodyImageGallery
			| PrismicSliceBlogPostBodyQuote
		>
	},
	"blog_post",
	"en-us" | "fr-fr"
>
type PrismicSliceBlogPostBodyText = prismic.Slice<
	"text",
	never,
	{
		text: prismic.RichTextField
	}
>
type PrismicSliceBlogPostBodyImageGallery = prismic.Slice<
	"image_gallery",
	never,
	{
		image: prismic.ImageField
		caption: prismic.KeyTextField
	}
>
type PrismicSliceBlogPostBodyQuote = prismic.Slice<
	"quote",
	{
		quote: prismic.RichTextField
		quotee: prismic.KeyTextField
	}
>
