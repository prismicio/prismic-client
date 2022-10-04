import { expectType, expectNever } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.Query): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value);
			}

			return true;
		}

		default: {
			return expectNever(value);
		}
	}
};

expectType<prismic.Query>({
	page: 0,
	results_per_page: 0,
	results_size: 0,
	total_results_size: 0,
	total_pages: 0,
	next_page: "string",
	prev_page: "string",
	results: [
		{
			id: "string",
			uid: "string",
			url: "string",
			type: "string",
			href: "string",
			tags: ["string"],
			first_publication_date: "string",
			last_publication_date: "string",
			slugs: ["string"],
			linked_documents: [],
			lang: "string",
			alternate_languages: [
				{
					id: "string",
					lang: "string",
					type: "string",
					uid: "string",
				},
			],
			data: {},
		},
	],
});

/**
 * Supports nullable `next_page` and `prev_page` properties.
 */
expectType<prismic.Query>({
	page: 0,
	results_per_page: 0,
	results_size: 0,
	total_results_size: 0,
	total_pages: 0,
	next_page: null,
	prev_page: null,
	results: [],
});

/**
 * Supports custom document type.
 */
expectType<
	prismic.Query<
		prismic.PrismicDocument<{
			foo: prismic.BooleanField;
		}>
	>
>({
	page: 0,
	results_per_page: 0,
	results_size: 0,
	total_results_size: 0,
	total_pages: 0,
	next_page: null,
	prev_page: null,
	results: [
		{
			id: "string",
			uid: "string",
			url: "string",
			type: "string",
			href: "string",
			tags: ["string"],
			first_publication_date: "string",
			last_publication_date: "string",
			slugs: ["string"],
			linked_documents: [],
			lang: "string",
			alternate_languages: [
				{
					id: "string",
					lang: "string",
					type: "string",
					uid: "string",
				},
			],
			data: {
				foo: true,
				// @ts-expect-error - Only given fields are valid.
				bar: false,
			},
		},
	],
});
