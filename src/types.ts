/**
 * A universal API to make network requests. A subset of the `fetch()` API.
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/fetch}
 */
export type FetchLike = (
	input: string,
	init?: RequestInitLike,
) => Promise<ResponseLike>;

/**
 * An object that allows you to abort a `fetch()` request if needed via an
 * `AbortController` object
 *
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal}
 */
// `any` is used often here to ensure this type is universally valid amond
// different AbortSignal implementations. The types of each property are not
// important to validate since it is blindly passed to a given `fetch()`
// function.
export type AbortSignalLike = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	aborted: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	addEventListener: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	removeEventListener: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dispatchEvent: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onabort: any;
};

/**
 * The minimum required properties from RequestInit.
 */
export interface RequestInitLike {
	headers?: Record<string, string>;
	signal?: AbortSignalLike | null;
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
