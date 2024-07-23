import type * as prismic from "../../src"

export const partialHTMLRichTextMapSerializer: prismic.HTMLRichTextMapSerializer =
	{
		heading1: ({ children }) => `<h2>${children}</h2>`,
		// `undefined` serializers should be treated the same as not including it.
		heading2: undefined,
		// `undefined` returning serializers should fallback to default serializer.
		heading3: () => undefined,
	}
