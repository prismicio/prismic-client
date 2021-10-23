import * as prismicT from "@prismicio/types";
import * as prismicH from "@prismicio/helpers";

import { appendPredicates } from "./lib/appendPredicates";
import { castThunk } from "./lib/castThunk";
import { findMasterRef } from "./lib/findMasterRef";
import { findRefByID } from "./lib/findRefByID";
import { findRefByLabel } from "./lib/findRefByLabel";
import { getCookie } from "./lib/getCookie";

import { FetchLike, HttpRequestLike } from "./types";
import { buildQueryURL, BuildQueryURLArgs } from "./buildQueryURL";
import { ForbiddenError } from "./ForbiddenError";
import { ParsingError } from "./ParsingError";
import { PrismicError } from "./PrismicError";
import { predicate } from "./predicate";
import * as cookie from "./cookie";

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
 * A ref or a function that returns a ref. If a static ref is known, one can be
 * given. If the ref must be fetched on-demand, a function can be provided. This
 * function can optionally be asynchronous.
 */
type RefStringOrThunk =
	| string
	| (() => string | undefined | Promise<string | undefined>);

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
			/**
			 * Use the repository's master ref.
			 */
			mode: "master";
	  }
	| {
			/**
			 * Use a given Release identified by its ID.
			 */
			mode: "releaseID";
			releaseID: string;
	  }
	| {
			/**
			 * Use a given Release identified by its label.
			 */
			mode: "releaseLabel";
			releaseLabel: string;
	  }
	| {
			/**
			 * Use a given ref.
			 */
			mode: "manual";
			ref: RefStringOrThunk;
	  }
);

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
	 * A list of Route Resolver objects that define how a document's `url` field
	 * is resolved.
	 *
	 * {@link https://prismic.io/docs/core-concepts/link-resolver-route-resolver#route-resolver}
	 */
	routes?: NonNullable<BuildQueryURLArgs["routes"]>;

	/**
	 * Default parameters that will be sent with each query. These parameters can
	 * be overridden on each query if needed.
	 */
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>;

	/**
	 * The function used to make network requests to the Prismic REST API. In
	 * environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetch?: FetchLike;
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
type ResolvePreviewArgs = {
	/**
	 * A function that maps a Prismic document to a URL within your app.
	 */
	linkResolver?: prismicH.LinkResolverFunction;

	/**
	 * A fallback URL if the Link Resolver does not return a value.
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
 * Creates a predicate to filter content by document type.
 *
 * @param documentType - The document type to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
const typePredicate = (documentType: string): string =>
	predicate.at("document.type", documentType);

/**
 * Creates a predicate to filter content by document tags. All tags are required
 * on the document.
 *
 * @param documentType - Document tags to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
const everyTagPredicate = (tags: string | string[]): string =>
	predicate.at("document.tags", tags);

/**
 * Creates a predicate to filter content by document tags. At least one matching
 * tag is required on the document.
 *
 * @param documentType - Document tags to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
const someTagsPredicate = (tags: string | string[]): string =>
	predicate.any("document.tags", tags);

/**
 * Creates a Prismic client that can be used to query a repository.
 *
 * @param endpoint - The Prismic REST API V2 endpoint for the repository (use
 *   `prismic.getEndpoint` for the default endpoint).
 * @param options - Configuration that determines how content will be queried
 *   from the Prismic repository.
 *
 * @returns A client that can query content from the repository.
 */
export const createClient = (
	...args: ConstructorParameters<typeof Client>
): Client => new Client(...args);

/**
 * A client that allows querying content from a Prismic repository.
 *
 * If used in an environment where a global `fetch` function is unavailable,
 * such as Node.js, the `fetch` option must be provided as part of the `options`
 * parameter.
 */
export class Client {
	/**
	 * The Prismic REST API V2 endpoint for the repository (use
	 * `prismic.getEndpoint` for the default endpoint).
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
	 * A list of Route Resolver objects that define how a document's `url` field
	 * is resolved.
	 *
	 * {@link https://prismic.io/docs/core-concepts/link-resolver-route-resolver#route-resolver}
	 */
	routes?: NonNullable<BuildQueryURLArgs["routes"]>;

	/**
	 * The function used to make network requests to the Prismic REST API. In
	 * environments where a global `fetch` function does not exist, such as
	 * Node.js, this function must be provided.
	 */
	fetchFn: FetchLike;

	/**
	 * Default parameters that will be sent with each query. These parameters can
	 * be overridden on each query if needed.
	 */
	defaultParams?: Omit<
		BuildQueryURLArgs,
		"ref" | "integrationFieldsRef" | "accessToken" | "routes"
	>;

	/**
	 * The client's ref mode state. This determines which ref is used during queries.
	 */
	private refState: RefState = {
		mode: "master",
		autoPreviewsEnabled: true,
	};

	/**
	 * Cached repository value.
	 */
	private cachedRepository: prismicT.Repository | undefined;

	/**
	 * Timestamp at which the cached repository data is considered stale.
	 */
	private cachedRepositoryExpiration = 0;

	/**
	 * Creates a Prismic client that can be used to query a repository.
	 *
	 * If used in an environment where a global `fetch` function is unavailable,
	 * such as Node.js, the `fetch` option must be provided as part of the
	 * `options` parameter.
	 *
	 * @param endpoint - The Prismic REST API V2 endpoint for the repository (use
	 *   `prismic.getEndpoint` to get the default endpoint).
	 * @param options - Configuration that determines how content will be queried
	 *   from the Prismic repository.
	 *
	 * @returns A client that can query content from the repository.
	 */
	constructor(endpoint: string, options: ClientConfig = {}) {
		this.endpoint = endpoint;
		this.accessToken = options.accessToken;
		this.routes = options.routes;
		this.defaultParams = options.defaultParams;

		if (options.ref) {
			this.queryContentFromRef(options.ref);
		}

		if (typeof options.fetch === "function") {
			this.fetchFn = options.fetch;
		} else if (typeof globalThis.fetch === "function") {
			this.fetchFn = globalThis.fetch;
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
	}

	/**
	 * Enables the client to automatically query content from a preview session if
	 * one is active in browser environments. This is enabled by default in the browser.
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
	 * one is active in server environments. This is disabled by default on the server.
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
	 * @param req - An HTTP server request object containing the request's cookies.
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
	 * @deprecated Use `get` instead.
	 * @example
	 *
	 * ```ts
	 * const response = await client.query(
	 * 	prismic.predicate.at("document.type", "page"),
	 * );
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param params - Parameters to filter, sort, and paginate results.
	 *
	 * @returns A paginated response containing the result of the query.
	 */
	async query<TDocument extends prismicT.PrismicDocument>(
		predicates: NonNullable<BuildQueryURLArgs["predicates"]>,
		params?: Partial<Omit<BuildQueryURLArgs, "predicates">>,
	): Promise<prismicT.Query<TDocument>> {
		const url = await this.buildQueryURL({ ...params, predicates });

		return await this.fetch<prismicT.Query<TDocument>>(url, params);
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
	 * @param params - Parameters to filter, sort, and paginate results.
	 *
	 * @returns A paginated response containing the result of the query.
	 */
	async get<TDocument extends prismicT.PrismicDocument>(
		params?: Partial<BuildQueryURLArgs>,
	): Promise<prismicT.Query<TDocument>> {
		const url = await this.buildQueryURL(params);

		return await this.fetch<prismicT.Query<TDocument>>(url, params);
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
	 * @param params - Parameters to filter, sort, and paginate results. @returns
	 *   The first result of the query, if any.
	 */
	async getFirst<TDocument extends prismicT.PrismicDocument>(
		params?: Partial<BuildQueryURLArgs>,
	): Promise<TDocument> {
		const url = await this.buildQueryURL(params);
		const result = await this.fetch<prismicT.Query<TDocument>>(url, params);

		const firstResult = result.results[0];

		if (firstResult) {
			return firstResult;
		}

		throw new PrismicError("No documents were returned", url, undefined);
	}

	/**
	 * Queries content from the Prismic repository and returns all matching
	 * content. If no predicates are provided, all documents will be fetched.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAll();
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned. @param params -
	 *   Parameters to filter, sort, and paginate results. @returns A list of
	 *   documents matching the query.
	 */
	async getAll<TDocument extends prismicT.PrismicDocument>(
		params: Partial<Omit<BuildQueryURLArgs, "page">> & GetAllParams = {},
	): Promise<TDocument[]> {
		const { limit = Infinity, ...actualParams } = params;
		const resolvedParams = {
			...actualParams,
			pageSize: actualParams.pageSize || MAX_PAGE_SIZE,
		};

		const result = await this.get<TDocument>(resolvedParams);

		let page = result.page;
		let documents = result.results;

		while (page < result.total_pages && documents.length < limit) {
			page += 1;
			const result = await this.get<TDocument>({ ...resolvedParams, page });
			documents = [...documents, ...result.results];
		}

		return documents.slice(0, limit);
	}

	/**
	 * Queries a document from the Prismic repository with a specific ID.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its Custom Type.
	 * @example
	 *
	 * ```ts
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 *
	 * @typeParam TDocument- Type of the Prismic document returned.
	 * @param id - ID of the document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The document with an ID matching the `id` parameter, if a matching
	 *   document exists.
	 */
	async getByID<TDocument extends prismicT.PrismicDocument>(
		id: string,
		params?: Partial<BuildQueryURLArgs>,
	): Promise<TDocument> {
		return await this.getFirst<TDocument>(
			appendPredicates(params, predicate.at("document.id", id)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific IDs.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its Custom Type.
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
	 * @param ids - A list of document IDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with IDs matching the
	 *   `ids` parameter.
	 */
	async getByIDs<TDocument extends prismicT.PrismicDocument>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs>,
	): Promise<prismicT.Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(params, predicate.in("document.id", ids)),
		);
	}

	/**
	 * Queries all documents from the Prismic repository with specific IDs.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its Custom Type.
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
	 * @param ids - A list of document IDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of documents with IDs matching the `ids` parameter.
	 */
	async getAllByIDs<TDocument extends prismicT.PrismicDocument>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs>,
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(params, predicate.in("document.id", ids)),
		);
	}

	/**
	 * Queries a document from the Prismic repository with a specific UID and Custom Type.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its Custom Type.
	 * @example
	 *
	 * ```ts
	 * const document = await client.getByUID("blog_post", "my-first-post");
	 * ```
	 *
	 * @typeParam TDocument - Type of the Prismic document returned.
	 * @param documentType - The API ID of the document's Custom Type.
	 * @param uid - UID of the document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The document with a UID matching the `uid` parameter, if a
	 *   matching document exists.
	 */
	async getByUID<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		uid: string,
		params?: Partial<BuildQueryURLArgs>,
	): Promise<TDocument> {
		return await this.getFirst<TDocument>(
			appendPredicates(params, [
				typePredicate(documentType),
				predicate.at(`my.${documentType}.uid`, uid),
			]),
		);
	}

	/**
	 * Queries document from the Prismic repository with specific UIDs and Custom Type.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its Custom Type.
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
	 * @param documentType - The API ID of the document's Custom Type.
	 * @param uids - A list of document UIDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with UIDs matching the
	 *   `uids` parameter.
	 */
	async getByUIDs<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		uids: string[],
		params?: Partial<BuildQueryURLArgs>,
	): Promise<prismicT.Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(params, [
				typePredicate(documentType),
				predicate.in(`my.${documentType}.uid`, uids),
			]),
		);
	}

	/**
	 * Queries all documents from the Prismic repository with specific UIDs and Custom Type.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @remarks
	 * A document's UID is different from its ID. An ID is automatically generated
	 * for all documents and is made available on its `id` property. A UID is
	 * provided in the Prismic editor and is unique among all documents of its Custom Type.
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
	 * @param documentType - The API ID of the document's Custom Type.
	 * @param uids - A list of document UIDs.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of documents with UIDs matching the `uids` parameter.
	 */
	async getAllByUIDs<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		uids: string[],
		params?: Partial<BuildQueryURLArgs>,
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(params, [
				typePredicate(documentType),
				predicate.in(`my.${documentType}.uid`, uids),
			]),
		);
	}

	/**
	 * Queries a singleton document from the Prismic repository for a specific Custom Type.
	 *
	 * @remarks
	 * A singleton document is one that is configured in Prismic to only allow one
	 * instance. For example, a repository may be configured to contain just one
	 * Settings document. This is in contrast to a repeatable Custom Type which
	 * allows multiple instances of itself.
	 * @example
	 *
	 * ```ts
	 * const document = await client.getSingle("settings");
	 * ```
	 *
	 * @typeParam TDocument - Type of the Prismic document returned.
	 * @param documentType - The API ID of the singleton Custom Type.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The singleton document for the Custom Type, if a matching document exists.
	 */
	async getSingle<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		params?: Partial<BuildQueryURLArgs>,
	): Promise<TDocument> {
		return await this.getFirst<TDocument>(
			appendPredicates(params, typePredicate(documentType)),
		);
	}

	/**
	 * Queries documents from the Prismic repository for a specific Custom Type.
	 *
	 * Use `getAllByType` instead if you need to query all documents for a
	 * specific Custom Type.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByType("blog_post");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param documentType - The API ID of the Custom Type.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents of the Custom Type.
	 */
	async getByType<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		params?: Partial<BuildQueryURLArgs>,
	): Promise<prismicT.Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(params, typePredicate(documentType)),
		);
	}

	/**
	 * Queries all documents from the Prismic repository for a specific Custom Type.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByType("blog_post");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param documentType - The API ID of the Custom Type.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents of the Custom Type.
	 */
	async getAllByType<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		params?: Partial<Omit<BuildQueryURLArgs, "page">>,
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(params, typePredicate(documentType)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with a specific tag.
	 *
	 * Use `getAllByTag` instead if you need to query all documents with a specific tag.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByTag("food");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param tag - The tag that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with the tag.
	 */
	async getByTag<TDocument extends prismicT.PrismicDocument>(
		tag: string,
		params?: Partial<BuildQueryURLArgs>,
	): Promise<prismicT.Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(params, everyTagPredicate(tag)),
		);
	}

	/**
	 * Queries all documents from the Prismic repository with a specific tag.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllByTag("food");
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param tag - The tag that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with the tag.
	 */
	async getAllByTag<TDocument extends prismicT.PrismicDocument>(
		tag: string,
		params?: Partial<Omit<BuildQueryURLArgs, "page">>,
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(params, everyTagPredicate(tag)),
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
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with the tags.
	 */
	async getByEveryTag<TDocument extends prismicT.PrismicDocument>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs>,
	): Promise<prismicT.Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(params, everyTagPredicate(tags)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific tags. A
	 * document must be tagged with all of the queried tags to be included.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllByEveryTag(["food", "fruit"]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with the tags.
	 */
	async getAllByEveryTag<TDocument extends prismicT.PrismicDocument>(
		tags: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">>,
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(params, everyTagPredicate(tags)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific tags. A
	 * document must be tagged with at least one of the queried tags to be included.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getByEveryTag(["food", "fruit"]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with at least one of the tags.
	 */
	async getBySomeTags<TDocument extends prismicT.PrismicDocument>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs>,
	): Promise<prismicT.Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(params, someTagsPredicate(tags)),
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific tags. A
	 * document must be tagged with at least one of the queried tags to be included.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @example
	 *
	 * ```ts
	 * const response = await client.getAllByEveryTag(["food", "fruit"]);
	 * ```
	 *
	 * @typeParam TDocument - Type of Prismic documents returned.
	 * @param tags - A list of tags that must be included on a document.
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with at least one of the tags.
	 */
	async getAllBySomeTags<TDocument extends prismicT.PrismicDocument>(
		tags: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">>,
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(params, someTagsPredicate(tags)),
		);
	}

	/**
	 * Returns metadata about the Prismic repository, such as its refs, releases,
	 * and custom types.
	 *
	 * @returns Repository metadata.
	 */
	async getRepository(): Promise<prismicT.Repository> {
		return await this.fetch<prismicT.Repository>(this.endpoint);
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
	async getRefs(): Promise<prismicT.Ref[]> {
		return (await this.getRepository()).refs;
	}

	/**
	 * Returns a ref for the Prismic repository with a matching ID.
	 *
	 * @param id - ID of the ref.
	 *
	 * @returns The ref with a matching ID, if it exists.
	 */
	async getRefByID(id: string): Promise<prismicT.Ref> {
		return findRefByID(await this.getRefs(), id);
	}

	/**
	 * Returns a ref for the Prismic repository with a matching label.
	 *
	 * @param label - Label of the ref.
	 *
	 * @returns The ref with a matching label, if it exists.
	 */
	async getRefByLabel(label: string): Promise<prismicT.Ref> {
		return findRefByLabel(await this.getRefs(), label);
	}

	/**
	 * Returns the master ref for the Prismic repository. The master ref points to
	 * the repository's latest published content.
	 *
	 * @returns The repository's master ref.
	 */
	async getMasterRef(): Promise<prismicT.Ref> {
		return findMasterRef(await this.getRefs());
	}

	/**
	 * Returns a list of all Releases for the Prismic repository. Releases are
	 * used to group content changes before publishing.
	 *
	 * @returns A list of all Releases for the Prismic repository.
	 */
	async getReleases(): Promise<prismicT.Ref[]> {
		const refs = await this.getRefs();

		return refs.filter((ref) => !ref.isMasterRef);
	}

	/**
	 * Returns a Release for the Prismic repository with a matching ID.
	 *
	 * @param id - ID of the Release.
	 *
	 * @returns The Release with a matching ID, if it exists.
	 */
	async getReleaseByID(id: string): Promise<prismicT.Ref> {
		return findRefByID(await this.getReleases(), id);
	}

	/**
	 * Returns a Release for the Prismic repository with a matching label.
	 *
	 * @param label - Label of the ref.
	 *
	 * @returns The ref with a matching label, if it exists.
	 */
	async getReleaseByLabel(label: string): Promise<prismicT.Ref> {
		return findRefByLabel(await this.getReleases(), label);
	}

	/**
	 * Returns a list of all tags used in the Prismic repository.
	 *
	 * @returns A list of all tags used in the repository.
	 */
	async getTags(): Promise<string[]> {
		try {
			const tagsForm = await this.getCachedRepositoryForm("tags");

			return await this.fetch<string[]>(tagsForm.action);
		} catch {
			return (await this.getRepository()).tags;
		}
	}

	/**
	 * Builds a URL used to query content from the Prismic repository.
	 *
	 * @param params - Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A URL string that can be requested to query content.
	 */
	async buildQueryURL(
		params: Partial<BuildQueryURLArgs> = {},
	): Promise<string> {
		return buildQueryURL(this.endpoint, {
			...this.defaultParams,
			...params,
			ref: params.ref || (await this.getResolvedRefString()),
			integrationFieldsRef:
				params.integrationFieldsRef ||
				(await this.getCachedRepository()).integrationFieldsRef ||
				undefined,
			routes: params.routes || this.routes,
			accessToken: undefined,
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
	async resolvePreviewURL(args: ResolvePreviewArgs): Promise<string> {
		let documentID = args.documentID;
		let previewToken = args.previewToken;

		if (typeof globalThis.location !== "undefined") {
			const searchParams = new URLSearchParams(globalThis.location.search);

			documentID = documentID || searchParams.get("documentId") || undefined;
			previewToken = previewToken || searchParams.get("token") || undefined;
		} else if (this.refState.httpRequest?.query) {
			documentID =
				documentID || (this.refState.httpRequest.query.documentId as string);
			previewToken =
				previewToken || (this.refState.httpRequest.query.token as string);
		}

		if (documentID != null) {
			const document = await this.getByID(documentID, {
				ref: previewToken,
			});

			// We know we have a valid field to resolve since we are using prismicH.documentToLinkField
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return prismicH.asLink(document, args.linkResolver)!;
		} else {
			return args.defaultURL;
		}
	}

	/**
	 * Configures the client to query the latest published content for all future queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for that query.
	 *
	 * @example
	 *
	 * ```ts
	 * await client.queryLatestContent();
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 */
	queryLatestContent(): void {
		this.refState.mode = "master";
	}

	/**
	 * Configures the client to query content from a specific Release identified
	 * by its ID for all future queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for that query.
	 *
	 * @example
	 *
	 * ```ts
	 * await client.queryContentFromReleaseByID("YLB7OBAAACMA7Cpa");
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 *
	 * @param id - The ID of the Release.
	 */
	queryContentFromReleaseByID(releaseID: string): void {
		this.refState = {
			...this.refState,
			mode: "releaseID",
			releaseID,
		};
	}

	/**
	 * Configures the client to query content from a specific Release identified
	 * by its label for all future queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for that query.
	 *
	 * @example
	 *
	 * ```ts
	 * await client.queryContentFromReleaseByLabel("My Release");
	 * const document = await client.getByID("WW4bKScAAMAqmluX");
	 * ```
	 *
	 * @param label - The label of the Release.
	 */
	queryContentFromReleaseByLabel(releaseLabel: string): void {
		this.refState = {
			...this.refState,
			mode: "releaseLabel",
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
	 * @param ref - The ref or a function that returns the ref from which to query content.
	 */
	queryContentFromRef(ref: RefStringOrThunk): void {
		this.refState = {
			...this.refState,
			mode: "manual",
			ref,
		};
	}

	/**
	 * Returns a cached version of `getRepository` with a TTL.
	 *
	 * @returns Cached repository metadata.
	 */
	private async getCachedRepository(): Promise<prismicT.Repository> {
		if (
			!this.cachedRepository ||
			Date.now() >= this.cachedRepositoryExpiration
		) {
			this.cachedRepositoryExpiration = Date.now() + REPOSITORY_CACHE_TTL;
			this.cachedRepository = await this.getRepository();
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
	 * @throws If a matching form cannot be found.
	 */
	private async getCachedRepositoryForm(name: string): Promise<prismicT.Form> {
		const cachedRepository = await this.getCachedRepository();
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
	 * method may make a network request to fetch a ref or resolve the user's ref thunk.
	 *
	 * If auto previews are enabled, the preview ref takes priority if available.
	 *
	 * The following strategies are used depending on the client's state:
	 *
	 * - If the user called `queryLatestContent`: Use the repository's master ref.
	 *   The ref is cached for 5 seconds. After 5 seconds, a new master ref is fetched.
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
	private async getResolvedRefString(): Promise<string> {
		if (this.refState.autoPreviewsEnabled) {
			let previewRef: string | undefined = undefined;

			if (globalThis.document?.cookie) {
				previewRef = getCookie(cookie.preview, globalThis.document.cookie);
			} else if (this.refState.httpRequest?.headers?.cookie) {
				previewRef = getCookie(
					cookie.preview,
					this.refState.httpRequest.headers.cookie,
				);
			}

			if (previewRef) {
				return previewRef;
			}
		}

		const cachedRepository = await this.getCachedRepository();

		const refModeType = this.refState.mode;
		if (refModeType === "releaseID") {
			return findRefByID(cachedRepository.refs, this.refState.releaseID).ref;
		} else if (refModeType === "releaseLabel") {
			return findRefByLabel(cachedRepository.refs, this.refState.releaseLabel)
				.ref;
		} else if (refModeType === "manual") {
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
	 * @param url - URL to the resource to fetch.
	 * @param params - Prismic REST API parameters for the network request.
	 *
	 * @returns The JSON response from the network request.
	 */
	private async fetch<T = unknown>(
		url: string,
		params?: Partial<BuildQueryURLArgs>,
	): Promise<T> {
		const accessToken = (params && params.accessToken) || this.accessToken;
		const options = accessToken
			? { headers: { Authorization: `Token ${accessToken}` } }
			: {};

		const res = await this.fetchFn(url, options);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let json: any;
		try {
			// We can assume Prismic REST API responses will have a `application/json`
			// Content Type. If not, this will throw, signaling an invalid response.
			json = await res.json();
		} catch {
			throw new PrismicError(undefined, url, undefined);
		}

		switch (res.status) {
			// Successful
			case 200: {
				return json;
			}

			// Bad Request
			// - Invalid predicate syntax
			// - Ref not provided (ignored)
			case 400: {
				throw new ParsingError(json.message, url, json);
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
					"error" in json ? json.error : json.message,
					url,
					json,
				);
			}
		}

		throw new PrismicError(undefined, url, json);
	}
}
