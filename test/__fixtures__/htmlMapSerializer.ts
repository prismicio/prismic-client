import * as prismic from "../../src";

export const htmlMapSerializer: prismic.HTMLMapSerializer = {
	heading1: ({ children }) => `<h2>${children}</h2>`,
	// `undefined` serializers should be treated the same as not including it.
	heading2: undefined,
};
