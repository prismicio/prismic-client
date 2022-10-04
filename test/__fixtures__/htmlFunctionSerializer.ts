import { Element } from "@prismicio/richtext";

import * as prismic from "../../src";

export const htmlFunctionSerializer: prismic.HTMLFunctionSerializer = (
	_type,
	node,
	_text,
	children,
) => {
	switch (node.type) {
		case Element.heading1: {
			return `<h2>${children}</h2>`;
		}
	}

	return null;
};
