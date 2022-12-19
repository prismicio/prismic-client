import { castArray } from "./lib/castArray";

import { ValueOf, Ordering, Route } from "./types";

/**
 * Parameters for the Prismic REST API V2.
 *
 * {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api}
 */
export interface QueryParams {
	/**
	 * The secure token for accessing the API (only needed if your repository is
	 * set to private).
	 *
	 * {@link https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token}
	 */
	accessToken?: string;

	/**
	 * The `pageSize` parameter defines the maximum number of documents that the
	 * API will return for your query.
	 *
	 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#pagesize}
	 */
	pageSize?: number;

	/**
	 * The `page` parameter defines the pagination for the result of your query.
	 *
	 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#page}
	 */
	page?: number;

	/**
	 * The `after` parameter can be used along with the orderings option. It will
	 * remove all the documents except for those after the specified document in
	 * the list.
	 *
	 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#after}
	 */
	after?: string;

	/**
	 * The `fetch` parameter is used to make queries faster by only retrieving the
	 * specified field(s).
	 *
	 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#fetch}
	 */
	fetch?: string | string[];

	/**
	 * The `fetchLinks` parameter allows you to retrieve a specific content field
	 * from a linked document and add it to the document response object.
	 *
	 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#fetchlinks}
	 */
	fetchLinks?: string | string[];

	/**
	 * The `graphQuery` parameter allows you to specify which fields to retrieve
	 * and what content to retrieve from Linked Documents / Content
	 * Relationships.
	 *
	 * {@link https://prismic.io/docs/technologies/graphquery-rest-api}
	 */
	graphQuery?: string;

	/**
	 * The `lang` option defines the language code for the results of your query.
	 *
	 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#lang}
	 */
	lang?: string;

	/**
	 * The `orderings` parameter orders the results by the specified field(s). You
	 * can specify as many fields as you want.
	 *
	 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#orderings}
	 */
	orderings?: Ordering | string | (Ordering | string)[];

	/**
	 * The `routes` option allows you to define how a document's `url` field is
	 * resolved.
	 *
	 * {@link https://prismic.io/docs/core-concepts/link-resolver-route-resolver#route-resolver}
	 */
	routes?: Route | string | (Route | string)[];

	/**
	 * The `brokenRoute` option allows you to define the route populated in the
	 * `url` property for broken Link or Content Relationship fields. A broken
	 * link is a Link or Content Relationship field whose linked document has been
	 * unpublished or deleted.
	 *
	 * {@link https://prismic.io/docs/core-concepts/link-resolver-route-resolver#route-resolver}
	 */
	brokenRoute?: string;
}

/**
 * Arguments for `buildQueryURL` to construct a Query URL.
 */
type BuildQueryURLParams = {
	/**
	 * Ref used to query documents.
	 *
	 * {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api#prismic-api-ref}
	 */
	ref: string;

	/**
	 * Ref used to populate Integration Fields with the latest content.
	 *
	 * {@link https://prismic.io/docs/core-concepts/integration-fields}
	 */
	integrationFieldsRef?: string;

	/**
	 * One or more predicates to filter documents for the query.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api}
	 */
	predicates?: string | string[];
};

/**
 * Parameters in this map have been renamed from the official Prismic REST API
 * V2 specification for better developer ergonomics.
 *
 * These parameters are renamed to their mapped value.
 */
const RENAMED_PARAMS = {
	accessToken: "access_token",
} as const;

/**
 * A valid parameter name for the Prismic REST API V2.
 */
type ValidParamName =
	| Exclude<
			keyof QueryParams,
			keyof typeof RENAMED_PARAMS | keyof BuildQueryURLParams
	  >
	| ValueOf<typeof RENAMED_PARAMS>;

/**
 * Converts an Ordering to a string that is compatible with Prismic's REST API.
 * If the value provided is already a string, no conversion is performed.
 *
 * @param ordering - Ordering to convert.
 *
 * @returns String representation of the Ordering.
 */
const castOrderingToString = (ordering: Ordering | string): string =>
	typeof ordering === "string"
		? ordering
		: [
				ordering.field,
				ordering.direction === "desc" ? ordering.direction : undefined,
		  ]
				.filter(Boolean)
				.join(" ");

export type BuildQueryURLArgs = QueryParams & BuildQueryURLParams;

/**
 * Build a Prismic REST API V2 URL to request documents from a repository. The
 * paginated response for this URL includes documents matching the parameters.
 *
 * A ref is required to make a request. Request the `endpoint` URL to retrieve a
 * list of available refs.
 *
 * Type the JSON response with `Query`.
 *
 * {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api#prismic-api-ref}
 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api}
 *
 * @param endpoint - URL to the repository's REST API V2.
 * @param args - Arguments to filter and scope the query.
 *
 * @returns URL that can be used to request documents from the repository.
 */
export const buildQueryURL = (
	endpoint: string,
	args: BuildQueryURLArgs,
): string => {
	const { predicates, ...params } = args;

	const url = new URL(`documents/search`, `${endpoint}/`);

	if (predicates) {
		for (const predicate of castArray(predicates)) {
			url.searchParams.append("q", `[${predicate}]`);
		}
	}

	// Iterate over each parameter and add it to the URL. In some cases, the
	// parameter value needs to be transformed to fit the REST API.
	for (const k in params) {
		const name = (RENAMED_PARAMS[k as keyof typeof RENAMED_PARAMS] ??
			k) as ValidParamName;

		let value = params[k as keyof typeof params];

		if (name === "orderings") {
			const scopedValue = params[name];

			if (scopedValue != null) {
				const v = castArray(scopedValue)
					.map((ordering) => castOrderingToString(ordering))
					.join(",");

				value = `[${v}]`;
			}
		} else if (name === "routes") {
			if (typeof params[name] === "object") {
				value = JSON.stringify(castArray(params[name]));
			}
		}

		if (value != null) {
			url.searchParams.set(name, castArray(value).join(","));
		}
	}

	return url.toString();
};
