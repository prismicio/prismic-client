/**
 * Create a union of the given object's values, and optionally specify which
 * keys to get the values from.
 *
 * Taken from the `type-fest` package.
 *
 * See:
 * https://github.com/sindresorhus/type-fest/blob/61c35052f09caa23de5eef96d95196375d8ed498/source/value-of.d.ts
 */
export type ValueOf<
	ObjectType,
	ValueType extends keyof ObjectType = keyof ObjectType,
> = ObjectType[ValueType];

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
	// `null` is included to match TypeScript's `fetch()` type in `lib.dom.d.ts`.
	// See: https://github.com/microsoft/TypeScript/blob/3328feb7991f358e245088d48b64ad9da8f015e2/lib/lib.dom.d.ts#L1515-L1518
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
