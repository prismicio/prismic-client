/**
 * A universal API to make network requests. A subset of the `fetch()` API.
 */
export type FetchLike = (
	input: string,
	init?: RequestInitLike,
) => Promise<ResponseLike>;

/**
 * The minimum required properties from RequestInit.
 */
export interface RequestInitLike {
	headers?: Record<string, string>;
}

/**
 * The minimum required properties from Response.
 */
export interface ResponseLike {
	status: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any>;
}

/**
 * The minimum required properties to treat as an HTTP Request for automatic
 * Prismic preview support.
 */
export interface HttpRequestLike {
	headers?: {
		cookie?: string;
	};
	query?: Record<string, unknown>;
}

/**
 * An `orderings` parameter that orders the results by the specified field.
 *
 * {@link https://prismic.io/docs/technologies/search-parameters-reference-rest-api#orderings}
 */
export interface Ordering {
	field: string;
	direction?: "asc" | "desc";
}

/**
 * A `routes` parameter that determines how a document's URL field is resolved.
 *
 * {@link https://prismic.io/docs/core-concepts/link-resolver-route-resolver#route-resolver}
 */
export interface Route {
	/**
	 * The Custom Type of the document.
	 */
	type: string;
	/**
	 * The resolved path of the document with optional placeholders.
	 */
	path: string;
	/**
	 * An object that lists the API IDs of the Content Relationships in the route.
	 */
	resolvers?: Record<string, string>;
}
