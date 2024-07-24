import { LinkType } from "../../src"
import type { RichTextMapSerializer } from "../../src/richtext"

export const htmlRichTextMapSerializer: RichTextMapSerializer<string> = {
	heading1: ({ children }) => `<h1>${children.join("")}</h1>`,
	heading2: ({ children }) => `<h2>${children.join("")}</h2>`,
	heading3: ({ children }) => `<h3>${children.join("")}</h3>`,
	heading4: ({ children }) => `<h4>${children.join("")}</h4>`,
	heading5: ({ children }) => `<h5>${children.join("")}</h5>`,
	heading6: ({ children }) => `<h6>${children.join("")}</h6>`,
	paragraph: ({ children }) => `<p>${children.join("")}</p>`,
	preformatted: ({ children }) => `<pre>${children.join("")}</pre>`,
	strong: ({ children }) => `<strong>${children.join("")}</strong>`,
	em: ({ children }) => `<em>${children.join("")}</em>`,
	list: ({ children }) => `<ul>${children.join("")}</ul>`,
	oList: ({ children }) => `<ol>${children.join("")}</ol>`,
	listItem: ({ children }) => `<li>${children.join("")}</li>`,
	oListItem: ({ children }) => `<li>${children.join("")}</li>`,
	image: ({ node }) => `<img src="${node.url}" alt="${node.alt}" />`,
	embed: ({ node }) => node.oembed.html,
	hyperlink: ({ node, children }) => {
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
	},
	label: ({ node, children }) =>
		`<span class="${node.data.label}">${children.join("")}</span>`,
	span: ({ text }) => (text ? text.replace("\n", "<br/>") : ""),
}
