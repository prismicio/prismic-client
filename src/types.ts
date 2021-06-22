import * as prismicT from "@prismicio/types";

export interface Ref {
	ref: string;
	label: string;
	isMasterRef: boolean;
	scheduledAt?: string;
	id: string;
}

export type Release = Ref;

export interface Language {
	id: string;
	name: string;
}

export interface Repository {
	refs: Ref[];
	bookmarks: Record<string, string>;
	languages: Language[];
	types: Record<string, string>;
	tags: string[];
	forms: Record<string, Form>;
	/**
	 * @deprecated
	 */
	experiments: unknown;
	oauth_initiate: string;
	oauth_token: string;
	version: string;
	license: string;
}

export interface Query<
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument
> {
	page: number;
	results_per_page: number;
	results_size: number;
	total_results_size: number;
	total_pages: number;
	next_page: string | null;
	prev_page: string | null;
	results: TDocument[];
}

export interface Form {
	method: "GET";
	enctype: string;
	action: string;
	name?: string;
	rel?: string;
	fields: Record<string, FormField>;
}

export interface FormField {
	type: "String" | "Integer";
	multiple: boolean;
	default?: string;
}

export type LinkResolver<
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument
> = (document: TDocument) => string;

/**
 * A universal API to make network requests. A subset of the `fetch()` API.
 */
export type FetchLike = (
	input: string,
	init?: RequestInitLike
) => Promise<ResponseLike>;

/**
 * The minimum required properties from RequestInit.
 */
export interface RequestInitLike {
	method?: string;
	body?: string;
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
 * The minimum required properties to treat as an HTTP Request for automatic Prismic preview support.
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

export interface CustomTypeMetadata {
	id: string;
	label: string;
	repeatable: boolean;
	json: Record<string, unknown>;
	status: boolean;
}

export type SliceSchema = Record<string, unknown>;
