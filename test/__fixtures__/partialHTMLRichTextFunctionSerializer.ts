import * as prismic from "../../src"

export const partialHTMLRichTextFunctionSerializer: prismic.HTMLRichTextFunctionSerializer =
	(_type, node, _text, children) => {
		switch (node.type) {
			case prismic.RichTextNodeType.heading1: {
				return `<h2>${children}</h2>`
			}
		}

		return null
	}
