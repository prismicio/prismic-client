import { LinkType } from "../../src"
import type { RichTextFunctionSerializer } from "../../src/richtext"
import { Element } from "../../src/richtext"

export const htmlRichTextFunctionSerializer: RichTextFunctionSerializer<
	string
> = (_type, node, text, children) => {
	switch (node.type) {
		case Element.heading1: {
			return `<h1>${children.join("")}</h1>`
		}

		case Element.heading2: {
			return `<h2>${children.join("")}</h2>`
		}

		case Element.heading3: {
			return `<h3>${children.join("")}</h3>`
		}

		case Element.heading4: {
			return `<h4>${children.join("")}</h4>`
		}

		case Element.heading5: {
			return `<h5>${children.join("")}</h5>`
		}

		case Element.heading6: {
			return `<h6>${children.join("")}</h6>`
		}

		case Element.paragraph: {
			return `<p>${children.join("")}</p>`
		}

		case Element.preformatted: {
			return `<pre>${children.join("")}</pre>`
		}

		case Element.strong: {
			return `<strong>${children.join("")}</strong>`
		}

		case Element.em: {
			return `<em>${children.join("")}</em>`
		}

		case Element.list: {
			return `<ul>${children.join("")}</ul>`
		}

		case Element.oList: {
			return `<ol>${children.join("")}</ol>`
		}

		case Element.listItem:
		case Element.oListItem: {
			return `<li>${children.join("")}</li>`
		}

		case Element.image: {
			return `<img src="${node.url}" alt="${node.alt}" />`
		}

		case Element.embed: {
			return node.oembed.html
		}

		case Element.hyperlink: {
			switch (node.data.link_type) {
				case LinkType.Web: {
					return `<a href="${node.data.url}" target="${
						node.data.target
					}">${children.join("")}</a>`
				}

				case LinkType.Document: {
					return `<a href="linkResolver(${node.data.id})">${children.join(
						"",
					)}</a>`
				}

				case LinkType.Media: {
					return `<a href="${node.data.url}">${children.join("")}</a>`
				}
			}
		}

		case Element.label: {
			return `<span class="${node.data.label}">${children.join("")}</span>`
		}

		default: {
			return text ? text.replace("\n", "<br/>") : ""
		}
	}
}
