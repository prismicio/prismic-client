import { castArray } from "./lib/castArray";
import { devMsg } from "./lib/devMsg";

/**
 * Create a union of the given object's values, and optionally specify which
 * keys to get the values from.
 *
 * Taken from the `type-fest` package.
 *
 * See:
 * https://github.com/sindresorhus/type-fest/blob/61c35052f09caa23de5eef96d95196375d8ed498/source/value-of.d.ts
 */
type ValueOf<
	ObjectType,
	ValueType extends keyof ObjectType = keyof ObjectType,
> = ObjectType[ValueType];

/**
 * An `orderings` parameter that orders the results by the specified field.
 *
 * {@link https://prismic.io/docs/rest-api-technical-reference#orderings}
 */
export interface Ordering {
	field: string;
	direction?: "asc" | "desc";
}

/**
 * A `routes` parameter that determines how a document's URL field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver}
 *
 * @example With a document's UID field.
 *
 * ```ts
 * {
 * 	"type": "page",
 * 	"path": "/:uid"
 * }
 * ```
 *
 * @example With a Content Relationship `parent` field.
 *
 * ```ts
 * {
 * 	"type": "page",
 * 	"path": "/:parent?/:uid",
 * 	"resolvers": {
 * 		"parent": "parent"
 * 	}
 * }
 * ```
 */
export interface Route {
	/**
	 * The custom type of the document.
	 */
	type: string;

	/**
	 * A specific UID to which this route definition is scoped. The route is only
	 * defined for the document whose UID matches the given UID.
	 */
	uid?: string;

	/**
	 * A specific language to which this route definition is scoped. The route is
	 * only defined for documents whose language matches the given language.
	 */
	lang?: string;

	/**
	 * The resolved path of the document with optional placeholders.
	 */
	path: string;

	/**
	 * An object that lists the API IDs of the Content Relationships in the route.
	 */
	resolvers?: Record<string, string>;
}

/**
 * Parameters for the Prismic REST API V2.
 *
 * {@link https://prismic.io/docs/api}
 */
export interface QueryParams {
	/**
	 * The secure token for accessing the API (only needed if your repository is
	 * set to private).
	 *
	 * {@link https://prismic.io/docs/access-token}
	 */
	accessToken?: string;

	/**
	 * The `pageSize` parameter defines the maximum number of documents that the
	 * API will return for your query.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#pagesize}
	 */
	pageSize?: number;

	/**
	 * The `page` parameter defines the pagination for the result of your query.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#page}
	 */
	page?: number;

	/**
	 * The `after` parameter can be used along with the orderings option. It will
	 * remove all the documents except for those after the specified document in
	 * the list.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#after}
	 */
	after?: string;

	/**
	 * The `fetch` parameter is used to make queries faster by only retrieving the
	 * specified field(s).
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#fetch}
	 */
	fetch?: string | string[];

	/**
	 * The `fetchLinks` parameter allows you to retrieve a specific content field
	 * from a linked document and add it to the document response object.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#fetchlinks}
	 */
	fetchLinks?: string | string[];

	/**
	 * The `graphQuery` parameter allows you to specify which fields to retrieve
	 * and what content to retrieve from Linked Documents / Content
	 * Relationships.
	 *
	 * {@link https://prismic.io/docs/graphquery-rest-api}
	 */
	graphQuery?: string;

	/**
	 * The `lang` option defines the language code for the results of your query.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#lang}
	 */
	lang?: string;

	/**
	 * The `orderings` parameter orders the results by the specified field(s). You
	 * can specify as many fields as you want.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#orderings}
	 *
	 * @remarks
	 * Strings and arrays of strings are deprecated as of
	 * `@prismicio/client@7.0.0`. Please migrate to the more explicit array of
	 * objects.
	 *
	 * @example
	 *
	 * ```typescript
	 * buildQueryURL(endpoint, {
	 * 	orderings: [
	 * 		{ field: "my.product.price", direction: "desc" },
	 * 		{ field: "my.product.title" },
	 * 	],
	 * });
	 * ```
	 */
	// TODO: Update TSDoc with deprecated API removal in v8
	orderings?: string | Ordering | (string | Ordering)[];

	/**
	 * The `routes` option allows you to define how a document's `url` field is
	 * resolved.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	routes?: Route | string | (Route | string)[];

	/**
	 * The `brokenRoute` option allows you to define the route populated in the
	 * `url` property for broken link or content relationship fields. A broken
	 * link is a link or content relationship field whose linked document has been
	 * unpublished or deleted.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
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
	 * {@link https://prismic.io/docs/api#refs-and-the-entry-api}
	 */
	ref: string;

	/**
	 * Ref used to populate integration fields with the latest content.
	 *
	 * {@link https://prismic.io/docs/integration-fields}
	 */
	integrationFieldsRef?: string;

	/**
	 * One or more filters to filter documents for the query.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#q}
	 */
	filters?: string | string[];

	/**
	 * @deprecated Renamed to `filters`. Ensure the value is an array of filters,
	 *   not a single, non-array filter.
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
const castOrderingToString = (ordering: Ordering | string): string => {
	// TODO: Remove the following when `orderings` strings are no longer supported.
	if (typeof ordering === "string") {
		if (process.env.NODE_ENV === "development") {
			const [field, direction] = ordering.split(" ");

			const objectForm =
				direction === "desc"
					? `{ field: "${field}", direction: "desc" }`
					: `{ field: "${field}" }`;

			console.warn(
				`[@prismicio/client] A string value was provided to the \`orderings\` query parameter. Strings are deprecated. Please convert it to the object form: ${objectForm}. For more details, see ${devMsg(
					"orderings-must-be-an-array-of-objects",
				)}`,
			);
		}

		return ordering;
	}

	return ordering.direction === "desc"
		? `${ordering.field} desc`
		: ordering.field;
};

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
 * {@link https://prismic.io/docs/api#refs-and-the-entry-api}
 * {@link https://prismic.io/docs/rest-api-technical-reference}
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
	const { filters, predicates, ...params } = args;

	const url = new URL(`documents/search`, `${endpoint}/`);

	if (filters) {
		// TODO: Remove warning when we remove support for string `filters` values.
		if (process.env.NODE_ENV === "development" && !Array.isArray(filters)) {
			console.warn(
				`[@prismicio/client] A non-array value was provided to the \`filters\` query parameter (\`${filters}\`). Non-array values are deprecated. Please convert it to an array. For more details, see ${devMsg(
					"filters-must-be-an-array",
				)}`,
			);
		}

		// TODO: Remove `castArray` when we remove support for string `filters` values.
		for (const filter of castArray(filters)) {
			url.searchParams.append("q", `[${filter}]`);
		}
	}

	// TODO: Remove when we remove support for deprecated `predicates` argument.
	if (predicates) {
		for (const predicate of castArray(predicates)) {
			url.searchParams.append("q", `[${predicate}]`);
		}
	}

	// Iterate over each parameter and add it to the URL. In some cases, the
	// parameter value needs to be transformed to fit the REST API.
	for (const k in params) {
		const name = (RENAMED_PARAMS[k as keyof typeof RENAMED_PARAMS] ||
			k) as ValidParamName;

		let value = params[k as keyof typeof params];

		if (name === "orderings") {
			const scopedValue = params[name];

			if (scopedValue != null) {
				// TODO: Remove the following warning when `orderings` strings are no longer supported.
				if (
					process.env.NODE_ENV === "development" &&
					typeof scopedValue === "string"
				) {
					console.warn(
						`[@prismicio/client] A string value was provided to the \`orderings\` query parameter. Strings are deprecated. Please convert it to an array of objects. For more details, see ${devMsg(
							"orderings-must-be-an-array-of-objects",
						)}`,
					);
				}

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
			url.searchParams.set(
				name,
				castArray<string | number | Route | Ordering>(value).join(","),
			);
		}
	}

	return url.toString();
};
