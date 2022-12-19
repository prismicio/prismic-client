import * as prismicT from "@prismicio/types";

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
 * Functions like TypeScript's native `Extract` utility type with added support
 * to fall back to a value if the resulting union is `never`.
 *
 * @example
 *
 * ```ts
 * ExtractOrFallback<"a" | "b", "a">; // => "a"
 * ExtractOrFallback<"a" | "b", "c">; // => "a" | "b"
 * ExtractOrFallback<"a" | "b", "c", "foo">; // => "foo"
 * ```
 *
 * @typeParam T - The union from which values will be extracted.
 * @typeParam U - The extraction condition.
 * @typeParam Fallback - The value to return if the resulting union is `never`.
 *   Defaults to `T`.
 */
type ExtractOrFallback<T, U, Fallback = T> = Extract<T, U> extends never
	? Fallback
	: Extract<T, U>;

/**
 * Extracts one or more Prismic document types that match a given Prismic
 * document type. If no matches are found, no extraction is performed and the
 * union of all provided Prismic document types are returned.
 *
 * @typeParam TDocuments - Prismic document types from which to extract.
 * @typeParam TDocumentType - Type(s) to match `TDocuments` against.
 */
export type ExtractDocumentType<
	TDocuments extends prismicT.PrismicDocument,
	TDocumentType extends TDocuments["type"],
> = ExtractOrFallback<TDocuments, { type: TDocumentType }>;

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
// `any` is used often here to ensure this type is universally valid among
// different AbortSignal implementations. The types of each property are not
// important to validate since it is blindly passed to a given `fetch()`
// function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbortSignalLike = any;

/**
 * The minimum required properties from RequestInit.
 */
export interface RequestInitLike {
	headers?: Record<string, string>;

	/**
	 * An object that allows you to abort a `fetch()` request if needed via an
	 * `AbortController` object
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal}
	 */
	// NOTE: `AbortSignalLike` is `any`! It is left as `AbortSignalLike`
	// for backwards compatibility (the type is exported) and to signal to
	// other readers that this should be an AbortSignal-like object.
	signal?: AbortSignalLike;
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
export type HttpRequestLike =
	| /**
	 * Web API Request
	 *
	 * @see http://developer.mozilla.org/en-US/docs/Web/API/Request
	 */
	{
			headers?: {
				get(name: string): string | null;
			};
			url?: string;
	  }

	/**
	 * Express-style Request
	 */
	| {
			headers?: {
				cookie?: string;
			};
			query?: Record<string, unknown>;
	  };

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
 *
 * {@link https://prismic.io/docs/core-concepts/link-resolver-route-resolver#route-resolver}
 */
export interface Route {
	/**
	 * The Custom Type of the document.
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
