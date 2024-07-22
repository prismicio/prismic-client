import { appendFilters } from "./lib/appendFilters";
import { castThunk } from "./lib/castThunk";
import { devMsg } from "./lib/devMsg";
import { everyTagFilter } from "./lib/everyTagFilter";
import { findMasterRef } from "./lib/findMasterRef";
import { findRefByID } from "./lib/findRefByID";
import { findRefByLabel } from "./lib/findRefByLabel";
import { getPreviewCookie } from "./lib/getPreviewCookie";
import { minifyGraphQLQuery } from "./lib/minifyGraphQLQuery";
import { someTagsFilter } from "./lib/someTagsFilter";
import { typeFilter } from "./lib/typeFilter";

import type { Query } from "./types/api/query";
import type { Ref } from "./types/api/ref";
import type { Form, Repository } from "./types/api/repository";
import type { PrismicDocument } from "./types/value/document";

import { ForbiddenError } from "./errors/ForbiddenError";
import { NotFoundError } from "./errors/NotFoundError";
import { ParsingError } from "./errors/ParsingError";
import { PreviewTokenExpiredError } from "./errors/PreviewTokenExpired";
import { PrismicError } from "./errors/PrismicError";
import { RefExpiredError } from "./errors/RefExpiredError";
import { RefNotFoundError } from "./errors/RefNotFoundError";
import { RepositoryNotFoundError } from "./errors/RepositoryNotFoundError";

import { LinkResolverFunction, asLink } from "./helpers/asLink";

import { BuildQueryURLArgs, buildQueryURL } from "./buildQueryURL";
import { filter } from "./filter";
import { getRepositoryEndpoint } from "./getRepositoryEndpoint";
import { getRepositoryName } from "./getRepositoryName";
import { isRepositoryEndpoint } from "./isRepositoryEndpoint";

/**
 * The largest page size allowed by the Prismic REST API V2. This value is used
 * to minimize the number of requests required to query content.
 */
const MAX_PAGE_SIZE = 100;

/**
 * The number of milliseconds in which repository metadata is considered valid.
 * A ref can be invalidated quickly depending on how frequently content is
 * updated in the Prismic repository. As such, repository's metadata can only be
 * considered valid for a short amount of time.
 */
export const REPOSITORY_CACHE_TTL = 5000;

/**
 * The number of milliseconds in which a multi-page `getAll` (e.g. `getAll`,
 * `getAllByType`, `getAllByTag`) will wait between individual page requests.
 *
 * This is done to ensure API performance is sustainable and reduces the chance
 * of a failed API request due to overloading.
 */
export const GET_ALL_QUERY_DELAY = 500;

/**
 * The default number of milliseconds to wait before retrying a rate-limited
 * `fetch()` request (429 response code). The default value is only used if the
 * response does not include a `retry-after` header.
 *
 * The API allows up to 200 requests per second.
 */
const DEFUALT_RETRY_AFTER_MS = 1000;

/**
 * Extracts one or more Prismic document types that match a given Prismic
 * document type. If no matches are found, no extraction is performed and the
 * union of all provided Prismic document types are returned.
 *
 * @typeParam TDocuments - Prismic document types from which to extract.
 * @typeParam TDocumentType - Type(s) to match `TDocuments` against.
 */
type ExtractDocumentType<
	TDocuments extends PrismicDocument,
	TDocumentType extends TDocuments["type"],
> = Extract<TDocuments, { type: TDocumentType }> extends never
	? TDocuments
	: Extract<TDocuments, { type: TDocumentType }>;

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
 * A subset of RequestInit properties to configure a `fetch()` request.
 */
// Only options relevant to the client are included. Extending from the full
// RequestInit would cause issues, such as accepting Header objects.
//
// An interface is used to allow other libraries to augment the type with
// environment-specific types.
export interface RequestInitLike extends Pick<RequestInit, "cache"> {
	/**
	 * An object literal to set the `fetch()` request's headers.
	 */
	headers?: Record<string, string>;

	/**
	 * An AbortSignal to set the `fetch()` request's signal.
	 *
	 * See:
	 * [https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
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
	headers: HeadersLike;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	json(): Promise<any>;
}

/**
 * The minimum required properties from Headers.
 */
export interface HeadersLike {
	get(name: string): string | null;
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
 * Modes for client ref management.
 */
enum RefStateMode {
	/**
	 * Use the repository's master ref.
	 */
	Master = "Master",

	/**
	 * Use a given Release identified by its ID.
	 */
	ReleaseID = "ReleaseID",

	/**
	 * Use a given Release identified by its label.
	 */
	ReleaseLabel = "ReleaseLabel",

	/**
	 * Use a given ref.
	 */
	Manual = "Manual",
}

/**
 * An object containing stateful information about a client's ref strategy.
 */
type RefState = {
	/**
	 * Determines if automatic preview support is enabled.
	 */
	autoPreviewsEnabled: boolean;

	/**
	 * An optional HTTP server request object used during previews if automatic
	 * previews are enabled.
	 */
	httpRequest?: HttpRequestLike;
} & (
	| {
			mode: RefStateMode.Master;
	  }
	| {
			mode: RefStateMode.ReleaseID;
			releaseID: string;
	  }
	| {
			mode: RefStateMode.ReleaseLabel;
			releaseLabel: string;
	  }
	| {
			mode: RefStateMode.Manual;
			ref: RefStringOrThunk;
	  }
);

/**
 * A ref or a function that returns a ref. If a static ref is known, one can be
 * given. If the ref must be fetched on-demand, a function can be provided. This
 * function can optionally be asynchronous.
 */
type RefStringOrThunk =
	| string
	| (() => string | undefined | Promise<string | undefined>);

/**
 * Configuration for clients that determine how content is queried.
 */
export type ClientConfig = {
	/**
	 * The secure token for accessing the Prismic repository. This is only
	 * required if the repository is set to private.
	 */
	accessToken?: string;

	/**
	 * A string representing a version of the Prismic repository's content. This
	 * may point to the latest version (called the "master ref"), or a preview
	 * with draft content.
	 */
	ref?: RefStringOrThunk;

	/**
	 * A list of route resolver objects that define how a document's `url`
	 * property is resolved.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	routes?: NonNullable<BuildQueryURLArgs["routes"]>;

	/**
	 * The `brokenRoute` option allows you to define the route populated in the
	 * `url` property for broken link or content relationship fields. A broken
	 * link is a link or content relationship field whose linked document has been
	 * unpublished or deleted.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	brokenRoute?: NonNullable<BuildQueryURLArgs["brokenRoute"]>;

	/**
	 * Default parameters that will be sent with each query. These parameters can
	 * be overridden on each query if needed.
	 */
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes" | "brokenRoute"
	>;

	/**
	 * The function used to make network requests to the Prismic REST API. In
	 * environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetch?: FetchLike;

	/**
	 * Options provided to the client's `fetch()` on all network requests. These
	 * options will be merged with internally required options. They can also be
	 * overriden on a per-query basis using the query's `fetchOptions` parameter.
	 */
	fetchOptions?: RequestInitLike;
};

/**
 * Parameters for any client method that use `fetch()`.
 */
type FetchParams = {
	/**
	 * Options provided to the client's `fetch()` on all network requests. These
	 * options will be merged with internally required options. They can also be
	 * overriden on a per-query basis using the query's `fetchOptions` parameter.
	 */
	fetchOptions?: RequestInitLike;

	/**
	 * An `AbortSignal` provided by an `AbortController`. This allows the network
	 * request to be cancelled if necessary.
	 *
	 * @deprecated Move the `signal` parameter into `fetchOptions.signal`:
	 *
	 * @see \<https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal\>
	 */
	signal?: AbortSignalLike;
};

/**
 * Parameters specific to client methods that fetch all documents. These methods
 * start with `getAll` (for example, `getAllByType`).
 */
type GetAllParams = {
	/**
	 * Limit the number of documents queried. If a number is not provided, there
	 * will be no limit and all matching documents will be returned.
	 */
	limit?: number;
};

/**
 * Arguments to determine how the URL for a preview session is resolved.
 */
type ResolvePreviewArgs<LinkResolverReturnType> = {
	/**
	 * A function that maps a Prismic document to a URL within your app.
	 */
	linkResolver?: LinkResolverFunction<LinkResolverReturnType>;

	/**
	 * A fallback URL if the link resolver does not return a value.
	 */
	defaultURL: string;

	/**
	 * The preview token (also known as a ref) that will be used to query preview
	 * content from the Prismic repository.
	 */
	previewToken?: string;

	/**
	 * The previewed document that will be used to determine the destination URL.
	 */
	documentID?: string;
};

/**
 * The result of a `fetch()` job.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FetchJobResult<TJSON = any> = {
	status: number;
	headers: HeadersLike;
	json: TJSON;
};

/**
 * Type definitions for the `createClient()` function. May be augmented by
 * third-party libraries.
 */
export interface CreateClient {
	<TDocuments extends PrismicDocument>(
		...args: ConstructorParameters<typeof Client>
	): Client<TDocuments>;
}

/**
 * Creates a Prismic client that can be used to query a repository.
 *
 * @example
 *
 * ```ts
 * // With a repository name.
 * createClient("qwerty");
 *
 * // Or with a full Prismic Rest API V2 endpoint.
 * createClient("https://qwerty.cdn.prismic.io/api/v2");
 * ```
 *
 * @typeParam TDocuments - A map of Prismic document type IDs mapped to their
 *   TypeScript type.
 *
 * @param repositoryNameOrEndpoint - The Prismic repository name or full Rest
 *   API V2 endpoint for the repository.
 * @param options - Configuration that determines how content will be queried
 *   from the Prismic repository.
 *
 * @returns A client that can query content from the repository.
 */
export const createClient: CreateClient = <TDocuments extends PrismicDocument>(
	repositoryNameOrEndpoint: string,
	options?: ClientConfig,
) => new Client<TDocuments>(repositoryNameOrEndpoint, options);

/**
 * A client that allows querying content from a Prismic repository.
 *
 * If used in an environment where a global `fetch` function is unavailable,
 * such as Node.js, the `fetch` option must be provided as part of the `options`
 * parameter.
 *
 * @typeParam TDocuments - Document types that are registered for the Prismic
 *   repository. Query methods will automatically be typed based on this type.
 */
export class Client<TDocuments extends PrismicDocument = PrismicDocument> {
	/**
	 * The Prismic REST API V2 endpoint for the repository (use
	 * `prismic.getRepositoryEndpoint` for the default endpoint).
	 */
	endpoint: string;

	/**
	 * The secure token for accessing the API (only needed if your repository is
	 * set to private).
	 *
	 * {@link https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token}
	 */
	accessToken?: string;

	/**
	 * A list of route resolver objects that define how a document's `url` field
	 * is resolved.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	routes?: NonNullable<BuildQueryURLArgs["routes"]>;

	/**
	 * The `brokenRoute` option allows you to define the route populated in the
	 * `url` property for broken link or content relationship fields. A broken
	 * link is a link or content relationship field whose linked document has been
	 * unpublished or deleted.
	 *
	 * {@link https://prismic.io/docs/route-resolver}
	 */
	brokenRoute?: NonNullable<BuildQueryURLArgs["brokenRoute"]>;

	/**
	 * The function used to make network requests to the Prismic REST API. In
	 * environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetchFn: FetchLike;

	fetchOptions?: RequestInitLike;

	/**
	 * Default parameters that will be sent with each query. These parameters can
	 * be overridden on each query if needed.
	 */
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>;

	/**
	 * The client's ref mode state. This determines which ref is used during
	 * queries.
	 */
	private refState: RefState = {
		mode: RefStateMode.Master,
		autoPreviewsEnabled: true,
	};

	/**
	 * Cached repository value.
	 */
	private cachedRepository: Repository | undefined;

	/**
	 * Timestamp at which the cached repository data is considered stale.
	 */
	private cachedRepositoryExpiration = 0;

	/**
	 * Active `fetch()` jobs keyed by URL and AbortSignal (if it exists).
	 */
	private fetchJobs: Record<
		string,
		Map<AbortSignalLike | undefined, Promise<FetchJobResult>>
	> = {};

	/**
	 * Creates a Prismic client that can be used to query a repository.
	 *
	 * If used in an environment where a global `fetch` function is unavailable,
	 * such as Node.js, the `fetch` option must be provided as part of the
	 * `options` parameter.
	 *
	 * @param repositoryNameOrEndpoint - The Prismic repository name or full Rest
	 *   API V2 endpoint for the repository.
	 * @param options - Configuration that determines how content will be queried
	 *   from the Prismic repository.
	 *
	 * @returns A client that can query content from the repository.
	 */
	constructor(repositoryNameOrEndpoint: string, options: ClientConfig = {}) {
		if (isRepositoryEndpoint(repositoryNameOrEndpoint)) {
			if (process.env.NODE_ENV === "development") {
				// Matches non-API v2 `.prismic.io` endpoints, see: https://regex101.com/r/xRsavu/1
				if (/\.prismic\.io\/(?!api\/v2\/?)/i.test(repositoryNameOrEndpoint)) {
					throw new PrismicError(
						"@prismicio/client only supports Prismic Rest API V2. Please provide only the repository name to the first createClient() parameter or use the getRepositoryEndpoint() helper to generate a valid Rest API V2 endpoint URL.",
						undefined,
						undefined,
					);
				}

				const hostname = new URL(
					repositoryNameOrEndpoint,
				).hostname.toLowerCase();

				// Matches non-.cdn `.prismic.io` endpoints
				if (
					hostname.endsWith(".prismic.io") &&
					!hostname.endsWith(".cdn.prismic.io")
				) {
					const repositoryName = getRepositoryName(repositoryNameOrEndpoint);
					const dotCDNEndpoint = getRepositoryEndpoint(repositoryName);
					console.warn(
						`[@prismicio/client] A non-.cdn endpoint was provided to create a client with (\`${repositoryNameOrEndpoint}\`). Non-.cdn endpoints can have unexpected side-effects and cause performance issues when querying Prismic. Please convert it to the \`.cdn\` alternative (\`${dotCDNEndpoint}\`) or use the repository name directly instead (\`${repositoryName}\`). For more details, see ${devMsg(
							"endpoint-must-use-cdn",
						)}`,
					);
				}
			}

			this.endpoint = repositoryNameOrEndpoint;
		} else {
			this.endpoint = getRepositoryEndpoint(repositoryNameOrEndpoint);
		}

		this.accessToken = options.accessToken;
		this.routes = options.routes;
		this.brokenRoute = options.brokenRoute;
		this.fetchOptions = options.fetchOptions;
		this.defaultParams = options.defaultParams;

		if (options.ref) {
			this.queryContentFromRef(options.ref);
		}

		if (typeof options.fetch === "function") {
			this.fetchFn = options.fetch;
		} else if (typeof globalThis.fetch === "function") {
			this.fetchFn = globalThis.fetch as FetchLike;
		} else {
			throw new PrismicError(
				"A valid fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option.",
				undefined,
				undefined,
			);
		}

		// If the global fetch function is used, we must bind it to the global scope.
		if (this.fetchFn === globalThis.fetch) {
			this.fetchFn = this.fetchFn.bind(globalThis);
		}

		this.graphQLFetch = this.graphQLFetch.bind(this);
	}

	/**
	 * Enables the client to automatically query content from a preview session if
	 * one is active in browser environments. This is enabled by default in the
	 * browser.
	 *
	 * For server environments, use `enableAutoPreviewsFromReq`.
	 *
	 * @example
	 *
	 * ```ts
	 * client.enableAutoPreviews();
	 * ```
	 *
	 * @see enableAutoPreviewsFromReq
	 */
	enableAutoPreviews(): void {
		this.refState.autoPreviewsEnabled = true;
	}

	/**
	 * Enables the client to automatically query content from a preview session if
	 * one is active in server environments. This is disabled by default on the
	 * server.
	 *
	 * For browser environments, use `enableAutoPreviews`.
	 *
	 * @example
	 *
	 * ```ts
	 * // In an express app
	 * app.get("/", function (req, res) {
	 * 	client.enableAutoPreviewsFromReq(req);
	 * });
	 * ```
	 *
	 * @param req - An HTTP server request object containing the request's
	 *   cookies.
	 */
	enableAutoPreviewsFromReq<R extends HttpRequestLike>(req: R): void {
		this.refState.httpRequest = req;
		this.refState.autoPreviewsEnabled = true;
	}

	/**
	 * Disables the client from automatically querying content from a preview
	 * session if one is active.
	 *
	 * Automatic preview content querying is enabled by default unless this method
	 * is called.
	 *
	 * @example
	 *
	 * ```ts
	 * client.disableAutoPreviews();
	 * ```
	 */
	disableAutoPreviews(): void {
		this.refState.autoPreviewsEnabled = false;
	}

	/**
	 * Queries content from the Prismic repository.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.get();
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param params - Parameters to filter, sort, and paginate results.
	 *
	 * @returns A paginated response containing the result of the query.
	 */
	async get<TDocument extends TDocuments>(
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		const url = await this.buildQueryURL(params);

		return await this.fetch<Query<TDocument>>(url, params);
	}

	/**
	 * Queries content from the Prismic repository and returns only the first
	 * result, if any.
	 *
	 * @example
	 *
	 * ```ts
	 * const document = await client.getFirst();
	 * ```
	 *
	 * @typeParam TDocument - Type of the Prismic document returned.
	 *
	 * @param params - Parameters to filter, sort, and paginate results. @returns
	 *   The first result of the query, if any.
	 */
	async getFirst<TDocument extends TDocuments>(
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<TDocument> {
		const actualParams = { ...params };
		if (!(params && params.page) && !params?.pageSize) {
			actualParams.pageSize = this.defaultParams?.pageSize ?? 1;
		}
		const url = await this.buildQueryURL(actualParams);
		const result = await this.fetch<Query<TDocument>>(url, params);

		const firstResult = result.results[0];

		if (firstResult) {
			return firstResult;
		}

		throw new NotFoundError("No documents were returned", url, undefined);
	}

	/**
	 * **IMPORTANT**: Avoid using `dangerouslyGetAll` as it may be slower and
	 * require more resources than other methods. Prefer using other methods that
	 * filter by filters such as `getAllByType`.
	 *
	 * Queries content from the Prismic repository and returns all matching
	 * content. If no filters are provided, all documents will be fetched.
	 *
	 * This method may make multiple network requests to query all matching
	 * content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.dangerouslyGetAll();
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param params - Parameters to filter, sort, and paginate results.
	 *
	 * @returns A list of documents matching the query.
	 */
	async dangerouslyGetAll<TDocument extends TDocuments>(
		params: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams = {},
	): Promise<TDocument[]> {
		const { limit = Infinity, ...actualParams } = params;
		const resolvedParams = {
			...actualParams,
			pageSize: Math.min(
				limit,
				actualParams.pageSize || this.defaultParams?.pageSize || MAX_PAGE_SIZE,
			),
		};

		const documents: TDocument[] = [];
		let latestResult: Query<TDocument> | undefined;

		while (
			(!latestResult || latestResult.next_page) &&
			documents.length < limit
		) {
			const page = latestResult ? latestResult.page + 1 : undefined;

			latestResult = await this.get<TDocument>({ ...resolvedParams, page });
			documents.push(...latestResult.results);

			if (latestResult.next_page) {
				await new Promise((res) => setTimeout(res, GET_ALL_QUERY_DELAY));
			}
		}

		return documents.slice(0, limit);
	}

	/**
	 * Queries a document from the Prismic repository with a specific ID.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 *
	 * @typeParam TDocument- Type of the Prismic document returned.
	 *
	 * @param id - ID of the document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The document with an ID matching the `id` parameter, if a matching
	 *   document exists.
	 */
	async getByID<TDocument extends TDocuments>(
		id: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<TDocument> {
		return await this.getFirst<TDocument>(
			appendFilters(params, filter.at("document.id", id)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific IDs.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByIDs([
	 * 	"WW4bKScAAMAqmluX",
	 * 	"U1kTRgEAAC8A5ldS",
	 * ]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param ids - A list of document IDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with IDs matching the
	 *   `ids` parameter.
	 */
	async getByIDs<TDocument extends TDocuments>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendFilters(params, filter.in("document.id", ids)),
		);
	}

	/**
	 * Queries all documents from the Prismic repository with specific IDs.
	 *
	 * This method may make multiple network requests to query all matching
	 * content.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllByIDs([
	 * 	"WW4bKScAAMAqmluX",
	 * 	"U1kTRgEAAC8A5ldS",
	 * ]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param ids - A list of document IDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of documents with IDs matching the `ids` parameter.
	 */
	async getAllByIDs<TDocument extends TDocuments>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
			appendFilters(params, filter.in("document.id", ids)),
		);
	}

	/**
	 * Queries a document from the Prismic repository with a specific UID and
	 * custom type.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const document = await client.getByUID("blog_post", "my-first-post");
	 * ```
	 *
	 * @typeParam TDocument - Type of the Prismic document returned.
	 *
	 * @param documentType - The API ID of the document's custom type.
	 * @param uid - UID of the document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The document with a UID matching the `uid` parameter, if a
	 *   matching document exists.
	 */
	async getByUID<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		documentType: TDocumentType,
		uid: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return await this.getFirst<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, [
				typeFilter(documentType),
				filter.at(`my.${documentType}.uid`, uid),
			]),
		);
	}

	/**
	 * Queries document from the Prismic repository with specific UIDs and Custom
	 * Type.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const document = await client.getByUIDs("blog_post", [
	 * 	"my-first-post",
	 * 	"my-second-post",
	 * ]);
	 * ```
	 *
	 * @typeParam TDocument - Type of the Prismic document returned.
	 *
	 * @param documentType - The API ID of the document's custom type.
	 * @param uids - A list of document UIDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with UIDs matching the
	 *   `uids` parameter.
	 */
	async getByUIDs<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		documentType: TDocumentType,
		uids: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return await this.get<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, [
				typeFilter(documentType),
				filter.in(`my.${documentType}.uid`, uids),
			]),
		);
	}

	/**
	 * Queries all documents from the Prismic repository with specific UIDs and
	 * custom type.
	 *
	 * This method may make multiple network requests to query all matching
	 * content.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its
	 * custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllByUIDs([
	 * 	"my-first-post",
	 * 	"my-second-post",
	 * ]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param documentType - The API ID of the document's custom type.
	 * @param uids - A list of document UIDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of documents with UIDs matching the `uids` parameter.
	 */
	async getAllByUIDs<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		documentType: TDocumentType,
		uids: string[],
		params?: Partial<BuildQueryURLArgs> & GetAllParams & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return await this.dangerouslyGetAll<
			ExtractDocumentType<TDocument, TDocumentType>
		>(
			appendFilters(params, [
				typeFilter(documentType),
				filter.in(`my.${documentType}.uid`, uids),
			]),
		);
	}

	/**
	 * Queries a singleton document from the Prismic repository for a specific
	 * custom type.
	 *
	 * @remarks
	 * A singleton document is one that is configured in Prismic to only allow one
	 * instance. For example, a repository may be configured to contain just one
	 * Settings document. This is in contrast to a repeatable custom type which
	 * allows multiple instances of itself.
	 *
	 * @example
	 *
	 * ```ts
	 * const document = await client.getSingle("settings");
	 * ```
	 *
	 * @typeParam TDocument - Type of the Prismic document returned.
	 *
	 * @param documentType - The API ID of the singleton custom type.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The singleton document for the custom type, if a matching document
	 *   exists.
	 */
	async getSingle<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		documentType: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>> {
		return await this.getFirst<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, typeFilter(documentType)),
		);
	}

	/**
	 * Queries documents from the Prismic repository for a specific custom type.
	 *
	 * Use `getAllByType` instead if you need to query all documents for a
	 * specific custom type.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByType("blog_post");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param documentType - The API ID of the custom type.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents of the custom type.
	 */
	async getByType<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		documentType: TDocumentType,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<ExtractDocumentType<TDocument, TDocumentType>>> {
		return await this.get<ExtractDocumentType<TDocument, TDocumentType>>(
			appendFilters(params, typeFilter(documentType)),
		);
	}

	/**
	 * Queries all documents from the Prismic repository for a specific Custom
	 * Type.
	 *
	 * This method may make multiple network requests to query all matching
	 * content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByType("blog_post");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param documentType - The API ID of the custom type.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents of the custom type.
	 */
	async getAllByType<
		TDocument extends TDocuments,
		TDocumentType extends TDocument["type"] = TDocument["type"],
	>(
		documentType: TDocumentType,
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<ExtractDocumentType<TDocument, TDocumentType>[]> {
		return await this.dangerouslyGetAll<
			ExtractDocumentType<TDocument, TDocumentType>
		>(appendFilters(params, typeFilter(documentType)));
	}

	/**
	 * Queries documents from the Prismic repository with a specific tag.
	 *
	 * Use `getAllByTag` instead if you need to query all documents with a
	 * specific tag.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByTag("food");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param tag - The tag that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with the tag.
	 */
	async getByTag<TDocument extends TDocuments>(
		tag: string,
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendFilters(params, someTagsFilter(tag)),
		);
	}

	/**
	 * Queries all documents from the Prismic repository with a specific tag.
	 *
	 * This method may make multiple network requests to query all matching
	 * content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllByTag("food");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param tag - The tag that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with the tag.
	 */
	async getAllByTag<TDocument extends TDocuments>(
		tag: string,
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
			appendFilters(params, someTagsFilter(tag)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific tags. A
	 * document must be tagged with all of the queried tags to be included.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByEveryTag(["food", "fruit"]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with the tags.
	 */
	async getByEveryTag<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendFilters(params, everyTagFilter(tags)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific tags. A
	 * document must be tagged with all of the queried tags to be included.
	 *
	 * This method may make multiple network requests to query all matching
	 * content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllByEveryTag(["food", "fruit"]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with the tags.
	 */
	async getAllByEveryTag<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
			appendFilters(params, everyTagFilter(tags)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific tags. A
	 * document must be tagged with at least one of the queried tags to be
	 * included.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByEveryTag(["food", "fruit"]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with at least one of the
	 *   tags.
	 */
	async getBySomeTags<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs> & FetchParams,
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendFilters(params, someTagsFilter(tags)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific tags. A
	 * document must be tagged with at least one of the queried tags to be
	 * included.
	 *
	 * This method may make multiple network requests to query all matching
	 * content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllBySomeTags(["food", "fruit"]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 *
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with at least one of the tags.
	 */
	async getAllBySomeTags<TDocument extends TDocuments>(
		tags: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">> &
			GetAllParams &
			FetchParams,
	): Promise<TDocument[]> {
		return await this.dangerouslyGetAll<TDocument>(
			appendFilters(params, someTagsFilter(tags)),
		);
	}

	/**
	 * Returns metadata about the Prismic repository, such as its refs, releases,
	 * and custom types.
	 *
	 * @returns Repository metadata.
	 */
	async getRepository(params?: FetchParams): Promise<Repository> {
		// TODO: Restore when Authorization header support works in browsers with CORS.
		// return await this.fetch<Repository>(this.endpoint);

		const url = new URL(this.endpoint);

		if (this.accessToken) {
			url.searchParams.set("access_token", this.accessToken);
		}

		return await this.fetch<Repository>(url.toString(), params);
	}

	/**
	 * Returns a list of all refs for the Prismic repository.
	 *
	 * Refs are used to identify which version of the repository's content should
	 * be queried. All repositories will have at least one ref pointing to the
	 * latest published content called the "master ref".
	 *
	 * @returns A list of all refs for the Prismic repository.
	 */
	async getRefs(params?: FetchParams): Promise<Ref[]> {
		const repository = await this.getRepository(params);

		return repository.refs;
	}

	/**
	 * Returns a ref for the Prismic repository with a matching ID.
	 *
	 * @param id - ID of the ref.
	 *
	 * @returns The ref with a matching ID, if it exists.
	 */
	async getRefByID(id: string, params?: FetchParams): Promise<Ref> {
		const refs = await this.getRefs(params);

		return findRefByID(refs, id);
	}

	/**
	 * Returns a ref for the Prismic repository with a matching label.
	 *
	 * @param label - Label of the ref.
	 *
	 * @returns The ref with a matching label, if it exists.
	 */
	async getRefByLabel(label: string, params?: FetchParams): Promise<Ref> {
		const refs = await this.getRefs(params);

		return findRefByLabel(refs, label);
	}

	/**
	 * Returns the master ref for the Prismic repository. The master ref points to
	 * the repository's latest published content.
	 *
	 * @returns The repository's master ref.
	 */
	async getMasterRef(params?: FetchParams): Promise<Ref> {
		const refs = await this.getRefs(params);

		return findMasterRef(refs);
	}

	/**
	 * Returns a list of all Releases for the Prismic repository. Releases are
	 * used to group content changes before publishing.
	 *
	 * @returns A list of all Releases for the Prismic repository.
	 */
	async getReleases(params?: FetchParams): Promise<Ref[]> {
		const refs = await this.getRefs(params);

		return refs.filter((ref) => !ref.isMasterRef);
	}

	/**
	 * Returns a Release for the Prismic repository with a matching ID.
	 *
	 * @param id - ID of the Release.
	 *
	 * @returns The Release with a matching ID, if it exists.
	 */
	async getReleaseByID(id: string, params?: FetchParams): Promise<Ref> {
		const releases = await this.getReleases(params);

		return findRefByID(releases, id);
	}

	/**
	 * Returns a Release for the Prismic repository with a matching label.
	 *
	 * @param label - Label of the ref.
	 *
	 * @returns The ref with a matching label, if it exists.
	 */
	async getReleaseByLabel(label: string, params?: FetchParams): Promise<Ref> {
		const releases = await this.getReleases(params);

		return findRefByLabel(releases, label);
	}

	/**
	 * Returns a list of all tags used in the Prismic repository.
	 *
	 * @returns A list of all tags used in the repository.
	 */
	async getTags(params?: FetchParams): Promise<string[]> {
		try {
			const tagsForm = await this.getCachedRepositoryForm("tags", params);

			const url = new URL(tagsForm.action);

			if (this.accessToken) {
				url.searchParams.set("access_token", this.accessToken);
			}

			return await this.fetch<string[]>(url.toString(), params);
		} catch {
			const repository = await this.getRepository(params);

			return repository.tags;
		}
	}

	/**
	 * Builds a URL used to query content from the Prismic repository.
	 *
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A URL string that can be requested to query content.
	 */
	async buildQueryURL({
		signal,
		fetchOptions,
		...params
	}: Partial<BuildQueryURLArgs> & FetchParams = {}): Promise<string> {
		const ref =
			params.ref || (await this.getResolvedRefString({ signal, fetchOptions }));
		const integrationFieldsRef =
			params.integrationFieldsRef ||
			(await this.getCachedRepository({ signal, fetchOptions }))
				.integrationFieldsRef ||
			undefined;

		return buildQueryURL(this.endpoint, {
			...this.defaultParams,
			...params,
			ref,
			integrationFieldsRef,
			routes: params.routes || this.routes,
			brokenRoute: params.brokenRoute || this.brokenRoute,
			accessToken: params.accessToken || this.accessToken,
		});
	}

	/**
	 * Determines the URL for a previewed document during an active preview
	 * session. The result of this method should be used to redirect the user to
	 * the document's URL.
	 *
	 * @example
	 *
	 * ```ts
	 * 	const url = client.resolvePreviewURL({
	 * 	linkResolver: (document) => `/${document.uid}`
	 * 	defaultURL: '/'
	 * 	})
	 * ```
	 *
	 * @param args - Arguments to configure the URL resolving.
	 *
	 * @returns The URL for the previewed document during an active preview
	 *   session. The user should be redirected to this URL.
	 */
	async resolvePreviewURL<LinkResolverReturnType>(
		args: ResolvePreviewArgs<LinkResolverReturnType> & FetchParams,
	): Promise<string> {
		let documentID: string | undefined | null = args.documentID;
		let previewToken: string | undefined | null = args.previewToken;

		if (typeof globalThis.location !== "undefined") {
			const searchParams = new URLSearchParams(globalThis.location.search);

			documentID = documentID || searchParams.get("documentId");
			previewToken = previewToken || searchParams.get("token");
		} else if (this.refState.httpRequest) {
			if ("query" in this.refState.httpRequest) {
				documentID =
					documentID || (this.refState.httpRequest.query?.documentId as string);
				previewToken =
					previewToken || (this.refState.httpRequest.query?.token as string);
			} else if (
				"url" in this.refState.httpRequest &&
				this.refState.httpRequest.url
			) {
				// Including "missing-host://" by default
				// handles a case where Next.js Route Handlers
				// only provide the pathname and search
				// parameters in the `url` property
				// (e.g. `/api/preview?foo=bar`).
				const searchParams = new URL(
					this.refState.httpRequest.url,
					"missing-host://",
				).searchParams;

				documentID = documentID || searchParams.get("documentId");
				previewToken = previewToken || searchParams.get("token");
			}
		}

		if (documentID != null && previewToken != null) {
			const document = await this.getByID(documentID, {
				ref: previewToken,
				lang: "*",
				signal: args.signal,
				fetchOptions: args.fetchOptions,
			});

			const url = asLink(document, { linkResolver: args.linkResolver });

			if (typeof url === "string") {
				return url;
			}
		}

		return args.defaultURL;
	}

	/**
	 * Configures the client to query the latest published content for all future
	 * queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for
	 * that query.
	 *
	 * @example
	 *
	 * ```ts
	 * await client.queryLatestContent();
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 */
	queryLatestContent(): void {
		this.refState.mode = RefStateMode.Master;
	}

	/**
	 * Configures the client to query content from a specific Release identified
	 * by its ID for all future queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for
	 * that query.
	 *
	 * @example
	 *
	 * ```ts
	 * await client.queryContentFromReleaseByID("YLB7OBAAACMA7Cpa");
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 *
	 * @param releaseID - The ID of the Release.
	 */
	queryContentFromReleaseByID(releaseID: string): void {
		this.refState = {
			...this.refState,
			mode: RefStateMode.ReleaseID,
			releaseID,
		};
	}

	/**
	 * Configures the client to query content from a specific Release identified
	 * by its label for all future queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for
	 * that query.
	 *
	 * @example
	 *
	 * ```ts
	 * await client.queryContentFromReleaseByLabel("My Release");
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 *
	 * @param releaseLabel - The label of the Release.
	 */
	queryContentFromReleaseByLabel(releaseLabel: string): void {
		this.refState = {
			...this.refState,
			mode: RefStateMode.ReleaseLabel,
			releaseLabel,
		};
	}

	/**
	 * Configures the client to query content from a specific ref. The ref can be
	 * provided as a string or a function.
	 *
	 * If a function is provided, the ref is fetched lazily before each query. The
	 * function may also be asynchronous.
	 *
	 * @example
	 *
	 * ```ts
	 * await client.queryContentFromRef("my-ref");
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 *
	 * @param ref - The ref or a function that returns the ref from which to query
	 *   content.
	 */
	queryContentFromRef(ref: RefStringOrThunk): void {
		this.refState = {
			...this.refState,
			mode: RefStateMode.Manual,
			ref,
		};
	}

	/**
	 * A `fetch()` function to be used with GraphQL clients configured for
	 * Prismic's GraphQL API. It automatically applies the necessary `prismic-ref`
	 * and Authorization headers. Queries will automatically be minified by
	 * removing whitespace where possible.
	 *
	 * @example
	 *
	 * ```ts
	 * const graphQLClient = new ApolloClient({
	 * 	link: new HttpLink({
	 * 		uri: prismic.getGraphQLEndpoint(repositoryName),
	 * 		// Provide `client.graphQLFetch` as the fetch implementation.
	 * 		fetch: client.graphQLFetch,
	 * 		// Using GET is required.
	 * 		useGETForQueries: true,
	 * 	}),
	 * 	cache: new InMemoryCache(),
	 * });
	 * ```
	 *
	 * @param input - The `fetch()` `input` parameter. Only strings are supported.
	 * @param init - The `fetch()` `init` parameter. Only plain objects are
	 *   supported.
	 *
	 * @returns The `fetch()` Response for the request.
	 *
	 * @experimental
	 */
	async graphQLFetch(
		input: RequestInfo,
		init?: Omit<RequestInit, "signal"> & { signal?: AbortSignalLike },
	): Promise<Response> {
		const cachedRepository = await this.getCachedRepository();
		const ref = await this.getResolvedRefString();

		const unsanitizedHeaders: Record<string, string> = {
			"Prismic-ref": ref,
			Authorization: this.accessToken ? `Token ${this.accessToken}` : "",
			// Asserting `init.headers` is a Record since popular GraphQL
			// libraries pass this as a Record. Header objects as input
			// are unsupported.
			...(init ? (init.headers as Record<string, string>) : {}),
		};

		if (cachedRepository.integrationFieldsRef) {
			unsanitizedHeaders["Prismic-integration-field-ref"] =
				cachedRepository.integrationFieldsRef;
		}

		// Normalize header keys to lowercase. This prevents header
		// conflicts between the Prismic client and the GraphQL
		// client.
		const headers: Record<string, string> = {};
		for (const key in unsanitizedHeaders) {
			if (unsanitizedHeaders[key]) {
				headers[key.toLowerCase()] =
					unsanitizedHeaders[key as keyof typeof unsanitizedHeaders];
			}
		}

		const url = new URL(
			// Asserting `input` is a string since popular GraphQL
			// libraries pass this as a string. Request objects as
			// input are unsupported.
			input as string,
		);

		// This prevents the request from being cached unnecessarily.
		// Without adding this `ref` param, re-running a query
		// could return a locally cached response, even if the
		// `ref` changed. This happens because the URL is
		// identical when the `ref` is not included. Caches may ignore
		// headers.
		//
		// The Prismic GraphQL API ignores the `ref` param.
		url.searchParams.set("ref", ref);

		const query = url.searchParams.get("query");
		if (query) {
			url.searchParams.set(
				"query",
				// Compress the GraphQL query (if it exists) by
				// removing whitespace. This is done to
				// optimize the query size and avoid
				// hitting the upper limit of GET requests
				// (2048 characters).
				minifyGraphQLQuery(query),
			);
		}

		return (await this.fetchFn(url.toString(), {
			...init,
			headers,
		})) as Response;
	}

	/**
	 * Returns a cached version of `getRepository` with a TTL.
	 *
	 * @returns Cached repository metadata.
	 */
	private async getCachedRepository(params?: FetchParams): Promise<Repository> {
		if (
			!this.cachedRepository ||
			Date.now() >= this.cachedRepositoryExpiration
		) {
			this.cachedRepositoryExpiration = Date.now() + REPOSITORY_CACHE_TTL;
			this.cachedRepository = await this.getRepository(params);
		}

		return this.cachedRepository;
	}

	/**
	 * Returns a cached Prismic repository form. Forms are used to determine API
	 * endpoints for types of repository data.
	 *
	 * @param name - Name of the form.
	 *
	 * @returns The repository form.
	 *
	 * @throws If a matching form cannot be found.
	 */
	private async getCachedRepositoryForm(
		name: string,
		params?: FetchParams,
	): Promise<Form> {
		const cachedRepository = await this.getCachedRepository(params);
		const form = cachedRepository.forms[name];

		if (!form) {
			throw new PrismicError(
				`Form with name "${name}" could not be found`,
				undefined,
				undefined,
			);
		}

		return form;
	}

	/**
	 * Returns the ref needed to query based on the client's current state. This
	 * method may make a network request to fetch a ref or resolve the user's ref
	 * thunk.
	 *
	 * If auto previews are enabled, the preview ref takes priority if available.
	 *
	 * The following strategies are used depending on the client's state:
	 *
	 * - If the user called `queryLatestContent`: Use the repository's master ref.
	 *   The ref is cached for 5 seconds. After 5 seconds, a new master ref is
	 *   fetched.
	 * - If the user called `queryContentFromReleaseByID`: Use the release's ref.
	 *   The ref is cached for 5 seconds. After 5 seconds, a new ref for the
	 *   release is fetched.
	 * - If the user called `queryContentFromReleaseByLabel`: Use the release's ref.
	 *   The ref is cached for 5 seconds. After 5 seconds, a new ref for the
	 *   release is fetched.
	 * - If the user called `queryContentFromRef`: Use the provided ref. Fall back
	 *   to the master ref if the ref is not a string.
	 *
	 * @returns The ref to use during a query.
	 */
	private async getResolvedRefString(params?: FetchParams): Promise<string> {
		if (this.refState.autoPreviewsEnabled) {
			let previewRef: string | undefined;

			let cookieJar: string | null | undefined;

			if (this.refState.httpRequest?.headers) {
				if (
					"get" in this.refState.httpRequest.headers &&
					typeof this.refState.httpRequest.headers.get === "function"
				) {
					// Web API Headers
					cookieJar = this.refState.httpRequest.headers.get("cookie");
				} else if ("cookie" in this.refState.httpRequest.headers) {
					// Express-style headers
					cookieJar = this.refState.httpRequest.headers.cookie;
				}
			} else if (globalThis.document?.cookie) {
				cookieJar = globalThis.document.cookie;
			}

			if (cookieJar) {
				previewRef = getPreviewCookie(cookieJar);
			}

			if (previewRef) {
				return previewRef;
			}
		}

		const cachedRepository = await this.getCachedRepository(params);

		const refModeType = this.refState.mode;
		if (refModeType === RefStateMode.ReleaseID) {
			return findRefByID(cachedRepository.refs, this.refState.releaseID).ref;
		} else if (refModeType === RefStateMode.ReleaseLabel) {
			return findRefByLabel(cachedRepository.refs, this.refState.releaseLabel)
				.ref;
		} else if (refModeType === RefStateMode.Manual) {
			const res = await castThunk(this.refState.ref)();

			if (typeof res === "string") {
				return res;
			}
		}

		return findMasterRef(cachedRepository.refs).ref;
	}

	/**
	 * Performs a network request using the configured `fetch` function. It
	 * assumes all successful responses will have a JSON content type. It also
	 * normalizes unsuccessful network requests.
	 *
	 * @typeParam T - The JSON response.
	 *
	 * @param url - URL to the resource to fetch.
	 * @param params - Prismic REST API parameters for the network request.
	 *
	 * @returns The JSON response from the network request.
	 */
	private async fetch<T = unknown>(
		url: string,
		params: FetchParams = {},
	): Promise<T> {
		const requestInit: RequestInitLike = {
			...this.fetchOptions,
			...params.fetchOptions,
			headers: {
				...this.fetchOptions?.headers,
				...params.fetchOptions?.headers,
			},
			signal:
				params.fetchOptions?.signal ||
				params.signal ||
				this.fetchOptions?.signal,
		};

		let job: Promise<FetchJobResult>;

		// `fetchJobs` is keyed twice: first by the URL and again by is
		// signal, if one exists.
		//
		// Using two keys allows us to reuse fetch requests for
		// equivalent URLs, but eject when we detect unique signals.
		if (this.fetchJobs[url] && this.fetchJobs[url].has(requestInit.signal)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			job = this.fetchJobs[url].get(requestInit.signal)!;
		} else {
			this.fetchJobs[url] = this.fetchJobs[url] || new Map();

			job = this.fetchFn(url, requestInit)
				.then(async (res) => {
					// We can assume Prismic REST API responses
					// will have a `application/json`
					// Content Type. If not, this will
					// throw, signaling an invalid
					// response.
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					let json: any = undefined;
					try {
						json = await res.json();
					} catch {
						// noop
					}

					return {
						status: res.status,
						headers: res.headers,
						json,
					};
				})
				.finally(() => {
					this.fetchJobs[url].delete(requestInit.signal);

					if (this.fetchJobs[url].size === 0) {
						delete this.fetchJobs[url];
					}
				});

			this.fetchJobs[url].set(requestInit.signal, job);
		}

		const res = await job;

		if (res.status !== 404 && res.json == null) {
			throw new PrismicError(undefined, url, res.json);
		}

		switch (res.status) {
			// Successful
			case 200: {
				return res.json;
			}

			// Bad Request
			// - Invalid filter syntax
			// - Ref not provided (ignored)
			case 400: {
				throw new ParsingError(res.json.message, url, res.json);
			}

			// Unauthorized
			// - Missing access token for repository endpoint
			// - Incorrect access token for repository endpoint
			case 401:
			// Forbidden
			// - Missing access token for query endpoint
			// - Incorrect access token for query endpoint
			case 403: {
				throw new ForbiddenError(
					res.json.error || res.json.message,
					url,
					res.json,
				);
			}

			// Not Found
			// - Incorrect repository name (this response has an empty body)
			// - Ref does not exist
			// - Preview token is expired
			case 404: {
				if (res.json === undefined) {
					throw new RepositoryNotFoundError(
						`Prismic repository not found. Check that "${this.endpoint}" is pointing to the correct repository.`,
						url,
						undefined,
					);
				}

				if (res.json.type === "api_notfound_error") {
					throw new RefNotFoundError(res.json.message, url, res.json);
				}

				if (
					res.json.type === "api_security_error" &&
					/preview token.*expired/i.test(res.json.message)
				) {
					throw new PreviewTokenExpiredError(res.json.message, url, res.json);
				}

				throw new NotFoundError(res.json.message, url, res.json);
			}

			// Gone
			// - Ref is expired
			case 410: {
				throw new RefExpiredError(res.json.message, url, res.json);
			}

			// Too Many Requests
			// - Exceeded the maximum number of requests per second
			case 429: {
				const parsedRetryAfter = Number(res.headers.get("retry-after"));
				const delay = Number.isNaN(parsedRetryAfter)
					? DEFUALT_RETRY_AFTER_MS
					: parsedRetryAfter;

				return await new Promise((resolve, reject) => {
					setTimeout(async () => {
						try {
							resolve(await this.fetch(url, params));
						} catch (error) {
							reject(error);
						}
					}, delay);
				});
			}
		}

		throw new PrismicError(undefined, url, res.json);
	}
}
