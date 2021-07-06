import * as prismicT from "@prismicio/types";
import * as prismicH from "@prismicio/helpers";

import { appendPredicates } from "./lib/appendPredicates";
import { getCookie } from "./lib/getCookie";

import {
	FetchLike,
	Form,
	HttpRequestLike,
	Query,
	Ref,
	Repository
	// TODO: Uncomment when the Authorization header can be used
	// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
	// RequestInitLike
} from "./types";
import { buildQueryURL, BuildQueryURLArgs } from "./buildQueryURL";
import { ForbiddenError, isForbiddenErrorAPIResponse } from "./ForbiddenError";
import { ParsingError, isParsingErrorAPIResponse } from "./ParsingError";
import { PrismicError } from "./PrismicError";
import * as cookie from "./cookie";
import * as predicate from "./predicate";

/**
 * A container for items in a SimpleTTLCache.
 */
type SimpleTTLCacheValueContainer<T = unknown> = {
	expiresAt: number;
	value: T;
};

/**
 * A simple time-to-live cache where items are only valid for a given number of milliseconds.
 */
interface SimpleTTLCache {
	get<T>(key: string): T | undefined;
	set<T>(key: string, value: T, ttl?: number): void;
}

/**
 * Creates a simple cache where each element has a given time to live (TTL). After the TTL has ellapsed, the value is considered stale and will not be returned if requested.
 */
const createSimpleTTLCache = (): SimpleTTLCache => {
	const cache = new Map<string, SimpleTTLCacheValueContainer>();

	return {
		/**
		 * Get a value from the cache. If the item's TTL has ellapsed, `undefined` will be returned.
		 *
		 * @param key Key for the item.
		 *
		 * @return The value for the key, if a value exists.
		 */
		get<T>(key: string): T | undefined {
			const cacheValue = cache.get(key);

			if (cacheValue) {
				if (new Date().getTime() < cacheValue.expiresAt) {
					return cacheValue.value as T;
				}
			}
		},

		/**
		 * Set a value in the cache for a given key and TTL.
		 *
		 * @param key Key to identify the item.
		 * @param value Value for the key.
		 * @param ttl Number of milliseconds to consider the value fresh.
		 */
		set<T>(key: string, value: T, ttl: number): void {
			cache.set(key, { expiresAt: new Date().getTime() + ttl, value });
		}
	};
};

/**
 * The largest page size allowed by the Prismic REST API V2. This value is used to minimize the number of requests required to query content.
 */
const MAX_PAGE_SIZE = 100;

/**
 * The number of milliseconds in which repository metadata is considered valid. A ref can be invalidated quickly depending on how frequently content is updated in the Prismic repository. As such, repository's metadata can only be considered valid for a short amount of time.
 */
export const REPOSITORY_CACHE_TTL = 5000;

/**
 * A ref or a function that returns a ref. If a static ref is known, one can be given. If the ref must be fetched on-demand, a function can be provided. This function can optionally be asynchronous.
 */
type RefStringOrFn =
	| string
	| (() => string | undefined | Promise<string | undefined>);

/**
 * State types for a client's ref strategy.
 */
const enum RefStateType {
	/** Use the repository's master ref. */
	Master,

	/** Use a given Release identified by its ID. */
	ReleaseByID,

	/** Use a given Release identified by its label. */
	ReleaseByLabel,

	/** Use a given ref. */
	Manual
}

/**
 * An object containing stateful information about a client's ref strategy.
 */
type RefState = {
	/** Determines if automatic preview support is enabled. */
	autoPreviewsEnabled: boolean;

	/** An optional HTTP server request object used during previews if automatic previews are enabled. */
	httpRequest?: HttpRequestLike;
} & (
	| {
			type: RefStateType.Master;
	  }
	| {
			type: RefStateType.ReleaseByID;
			payload: {
				/** The ID of the Release. */
				releaseId: string;
			};
	  }
	| {
			type: RefStateType.ReleaseByLabel;
			payload: {
				/** The label of the Release. */
				releaseLabel: string;
			};
	  }
	| {
			type: RefStateType.Manual;
			payload: {
				/** The user-provided ref or ref thunk. */
				refStringOrFn: RefStringOrFn;
			};
	  }
);

/**
 * Configuration for clients that determine how content is queried.
 */
export type ClientConfig = {
	/**
	 * The secure token for accessing the Prismic repository. This is only required if the repository is set to private.
	 */
	accessToken?: string;

	/**
	 * A string representing a version of the Prismic repository's content. This may point to the latest version (called the "master ref"), or a preview with draft content.
	 */
	ref?: RefStringOrFn;

	/**
	 * Default parameters that will be sent with each query. These parameters can be overridden on each query if needed.
	 */
	defaultParams?: Omit<BuildQueryURLArgs, "ref" | "accessToken">;

	/**
	 * The function used to make network requests to the Prismic REST API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
	 */
	fetch?: FetchLike;
};

/**
 * Parameters specific to client methods that fetch all documents. These methods start with `getAll` (for example, `getAllByType`).
 */
type GetAllParams = {
	/**
	 * Limit the number of documents queried. If a number is not provided, there will be no limit and all matching documents will be returned.
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
	linkResolver: prismicH.LinkResolverFunction;

	/**
	 * A fallback URL if the Link Resolver does not return a value.
	 */
	defaultURL: string;

	/**
	 * The preview token (also known as a ref) that will be used to query preview content from the Prismic repository.
	 */
	previewToken?: string;

	/**
	 * The previewed document that will be used to determine the destination URL.
	 */
	documentId?: string;
};

/**
 * Creates a predicate to filter content by document type.
 *
 * @param documentType The document type to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
const typePredicate = (documentType: string): string =>
	predicate.at("document.type", documentType);

/**
 * Creates a predicate to filter content by document tags.
 *
 * @param documentType Document tags to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
const tagsPredicate = (tags: string | string[]): string =>
	predicate.at("document.tags", tags);

/**
 * Returns the first ref from a list that passes a predicate (a function that returns true).
 *
 * @throws If a matching ref cannot be found.
 *
 * @param refs A list of refs to search.
 * @param predicate A function that determines if a ref from the list matches the criteria.
 *
 * @returns The first matching ref.
 */
const findRef = (refs: Ref[], predicate: (ref: Ref) => boolean): Ref => {
	const ref = refs.find(ref => predicate(ref));

	if (!ref) {
		throw new Error("Ref could not be found.");
	}

	return ref;
};

/**
 * Creates a Prismic client that can be used to query a repository.
 *
 * @param endpoint The Prismic REST API V2 endpoint for the repository (use `prismic.getEndpoint` for the default endpoint).
 * @param options Configuration that determines how content will be queried from the Prismic repository.
 *
 * @returns A client that can query content from the repository.
 */
export const createClient = (
	...args: ConstructorParameters<typeof Client>
): Client => new Client(...args);

/**
 * A client that allows querying content from a Prismic repository.
 *
 * If used in an environment where a global `fetch` function is unavailable, such as Node.js, the `fetch` option must be provided as part of the `options` parameter.
 */
export class Client {
	/**
	 * The Prismic REST API V2 endpoint for the repository (use `prismic.getEndpoint` for the default endpoint).
	 */
	endpoint: string;

	/**
	 * The secure token for accessing the API (only needed if your repository is set to private).
	 *
	 * {@link https://user-guides.prismic.io/en/articles/1036153-generating-an-access-token}
	 */
	accessToken?: string;

	/**
	 * The function used to make network requests to the Prismic REST API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
	 */
	fetchFn: FetchLike;

	/**
	 * Default parameters that will be sent with each query. These parameters can be overridden on each query if needed.
	 */
	defaultParams?: Omit<BuildQueryURLArgs, "ref">;

	/**
	 * The client's ref mode state. This determines which ref is used during queries.
	 */
	private refMode: RefState;

	/**
	 * Internal cache for low-level caching.
	 */
	private internalCache: SimpleTTLCache;

	/**
	 * Creates a Prismic client that can be used to query a repository.
	 *
	 * If used in an environment where a global `fetch` function is unavailable, such as Node.js, the `fetch` option must be provided as part of the `options` parameter.
	 *
	 * @param endpoint The Prismic REST API V2 endpoint for the repository (use `prismic.getEndpoint` to get the default endpoint).
	 * @param options Configuration that determines how content will be queried from the Prismic repository.
	 *
	 * @returns A client that can query content from the repository.
	 */
	constructor(endpoint: string, options: ClientConfig = {}) {
		this.endpoint = endpoint;
		this.accessToken = options.accessToken;
		this.defaultParams = options.defaultParams;
		this.internalCache = createSimpleTTLCache();
		this.refMode = {
			type: RefStateType.Master,
			autoPreviewsEnabled: true
		};

		if (options.ref) {
			this.queryContentFromRef(options.ref);
		}

		if (typeof options.fetch === "function") {
			this.fetchFn = options.fetch;
		} else if (typeof globalThis.fetch === "function") {
			this.fetchFn = globalThis.fetch;
		} else {
			throw new Error(
				"A valid fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option."
			);
		}

		// If the global fetch function is used, we must bind it to the global scope.
		if (this.fetchFn === globalThis.fetch) {
			this.fetchFn = this.fetchFn.bind(globalThis);
		}
	}

	/**
	 * Enables the client to automatically query content from a preview session if one is active in browser environments. This is enabled by default in the browser.
	 *
	 * For server environments, use `enableAutoPreviewsFromReq`.
	 *
	 * @see enableAutoPreviewsFromReq
	 *
	 * @example
	 * ```ts
	 * client.enableAutoPreviews()
	 * ```
	 */
	enableAutoPreviews(): void {
		this.refMode.autoPreviewsEnabled = true;
	}

	/**
	 * Enables the client to automatically query content from a preview session if one is active in server environments. This is disabled by default on the server.
	 *
	 * For browser environments, use `enableAutoPreviews`.
	 *
	 * @param req An HTTP server request object containing the request's cookies.
	 *
	 * @example
	 * ```ts
	 * // In an express app
	 * app.get('/', function (req, res) {
	 *   client.enableAutoPreviewsFromReq(req)
	 * })
	 * ```
	 */
	enableAutoPreviewsFromReq<R extends HttpRequestLike>(req: R): void {
		this.refMode.httpRequest = req;
		this.refMode.autoPreviewsEnabled = true;
	}

	/**
	 * Disables the client from automatically querying content from a preview session if one is active.
	 *
	 * Automatic preview content querying is enabled by default unless this method is called.
	 *
	 * @example
	 * ```ts
	 * client.disableAutoPreviews()
	 * ```
	 */
	disableAutoPreviews(): void {
		this.refMode.autoPreviewsEnabled = false;
	}

	/**
	 * Queries content from the Prismic repository.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param params Parameters to filter, sort, and paginate results.
	 *
	 * @returns A paginated response containing the result of the query.
	 *
	 * ```ts
	 * const response = await client.get()
	 * ```
	 *
	 * @deprecated Use `get` instead.
	 */
	query = this.get.bind(this);

	/**
	 * Queries content from the Prismic repository.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param params Parameters to filter, sort, and paginate results.
	 *
	 * @returns A paginated response containing the result of the query.
	 *
	 * ```ts
	 * const response = await client.get()
	 * ```
	 */
	async get<TDocument extends prismicT.PrismicDocument>(
		params?: Partial<BuildQueryURLArgs>
	): Promise<Query<TDocument>> {
		const url = await this.buildQueryURL(params);

		// TODO: Uncomment when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		// return await this.fetch<Query<TDocument>>(url, params);
		return await this.fetch<Query<TDocument>>(url);
	}

	/**
	 * Queries content from the Prismic repository and returns only the first result, if any.
	 *
	 * @typeParam TDocument Type of the Prismic document returned.
	 * @param params Parameters to filter, sort, and paginate results.
	 *
	 * @returns The first result of the query, if any.
	 *
	 * @example
	 * ```ts
	 * const document = await client.getFirst()
	 * ```
	 */
	async getFirst<TDocument extends prismicT.PrismicDocument>(
		params?: Partial<BuildQueryURLArgs>
	): Promise<TDocument> {
		const result = await this.get<TDocument>(params);
		const firstResult = result.results[0];

		if (firstResult) {
			return firstResult;
		}

		throw new Error("No documents were returned");
	}

	/**
	 * Queries content from the Prismic repository and returns all matching content. If no predicates are provided, all documents will be fetched.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param params Parameters to filter, sort, and paginate results.
	 *
	 * @returns A list of documents matching the query.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getAll()
	 * ```
	 */
	async getAll<TDocument extends prismicT.PrismicDocument>(
		params: Partial<Omit<BuildQueryURLArgs, "page">> & GetAllParams = {}
	): Promise<TDocument[]> {
		const { limit = Infinity, ...actualParams } = params;
		const resolvedParams = { pageSize: MAX_PAGE_SIZE, ...actualParams };

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
	 *
	 * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
	 *
	 * @typeParam TDocument Type of the Prismic document returned.
	 * @param id ID of the document.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The document with an ID matching the `id` parameter, if a matching document exists.
	 *
	 * @example
	 * ```ts
	 * const document = await client.getByID('WW4bKScAAMAqmluX')
	 * ```
	 */
	async getByID<TDocument extends prismicT.PrismicDocument>(
		id: string,
		params?: Partial<BuildQueryURLArgs>
	): Promise<TDocument> {
		return await this.getFirst<TDocument>(
			appendPredicates(predicate.at("document.id", id))(params)
		);
	}

	/**
	 * Queries documents from the Prismic repository with specific IDs.
	 *
	 * @remarks
	 *
	 * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param ids A list of document IDs.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with IDs matching the `ids` parameter.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getByIDs(['WW4bKScAAMAqmluX', 'U1kTRgEAAC8A5ldS'])
	 * ```
	 */
	async getByIDs<TDocument extends prismicT.PrismicDocument>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs>
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(predicate.in("document.id", ids))(params)
		);
	}

	/**
	 * Queries all documents from the Prismic repository with specific IDs.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @remarks
	 *
	 * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param ids A list of document IDs.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of documents with IDs matching the `ids` parameter, if a matching document exists.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getAllByIDs(['WW4bKScAAMAqmluX', 'U1kTRgEAAC8A5ldS'])
	 * ```
	 */
	async getAllByIDs<TDocument extends prismicT.PrismicDocument>(
		ids: string[],
		params?: Partial<BuildQueryURLArgs>
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(predicate.in("document.id", ids))(params)
		);
	}

	/**
	 * Queries a document from the Prismic repository with a specific UID and Custom Type.
	 *
	 * @remarks
	 *
	 * A document's UID is different from its ID. An ID is automatically generated for all documents and is made available on its `id` property. A UID is provided in the Prismic editor and is unique among all documents of its Custom Type.
	 *
	 * @typeParam TDocument Type of the Prismic document returned.
	 * @param documentType The API ID of the document's Custom Type.
	 * @param uid UID of the document.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The document with a UID matching the `uid` parameter, if a matching document exists.
	 *
	 * @example
	 * ```ts
	 * const document = await client.getByUID('blog_post', 'my-first-post')
	 * ```
	 */
	async getByUID<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		uid: string,
		params?: Partial<BuildQueryURLArgs>
	): Promise<TDocument> {
		return await this.getFirst<TDocument>(
			appendPredicates(
				typePredicate(documentType),
				predicate.at(`my.${documentType}.uid`, uid)
			)(params)
		);
	}

	/**
	 * Queries a singleton document from the Prismic repository for a specific Custom Type.
	 *
	 * @remarks
	 *
	 * A singleton document is one that is configured in Prismic to only allow one instance. For example, a repository may be configured to contain just one Settings document. This is in contrast to a repeatable Custom Type which allows multiple instances of itself.
	 *
	 * @typeParam TDocument Type of the Prismic document returned.
	 * @param documentType The API ID of the singleton Custom Type.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns The singleton document for the Custom Type, if a matching document exists.
	 *
	 * @example
	 * ```ts
	 * const document = await client.getSingle('settings')
	 * ```
	 */
	async getSingle<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		params?: Partial<BuildQueryURLArgs>
	): Promise<TDocument> {
		return await this.getFirst<TDocument>(
			appendPredicates(typePredicate(documentType))(params)
		);
	}

	/**
	 * Queries documents from the Prismic repository for a specific Custom Type.
	 *
	 * Use `getAllByType` instead if you need to query all documents for a specific Custom Type.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param documentType The API ID of the Custom Type.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents of the Custom Type.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getByType('blog_post')
	 * ```
	 */
	async getByType<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		params?: Partial<BuildQueryURLArgs>
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(typePredicate(documentType))(params)
		);
	}

	/**
	 * Queries all documents from the Prismic repository for a specific Custom Type.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param documentType The API ID of the Custom Type.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents of the Custom Type.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getByType('blog_post')
	 * ```
	 */
	async getAllByType<TDocument extends prismicT.PrismicDocument>(
		documentType: string,
		params?: Partial<Omit<BuildQueryURLArgs, "page">>
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(typePredicate(documentType))(params)
		);
	}

	/**
	 * Queries documents from the Prismic repository with a specific tag.
	 *
	 * Use `getAllByTag` instead if you need to query all documents with a specific tag.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param tag The tag that must be included on a document.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with the tag.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getByTag('food')
	 * ```
	 */
	async getByTag<TDocument extends prismicT.PrismicDocument>(
		tag: string,
		params?: Partial<BuildQueryURLArgs>
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(tagsPredicate(tag))(params)
		);
	}

	/**
	 * Queries all documents from the Prismic repository with a specific tag.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param tag The tag that must be included on a document.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with the tag.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getAllByTag('food')
	 * ```
	 */
	async getAllByTag<TDocument extends prismicT.PrismicDocument>(
		tag: string,
		params?: Partial<Omit<BuildQueryURLArgs, "page">>
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(tagsPredicate(tag))(params)
		);
	}

	/**
	 * Queries documents from the Prismic repository with a specific tag.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param tags A list of tags that must be included on a document.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A paginated response containing documents with the tag.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getAllByTag('food')
	 * ```
	 */
	async getByTags<TDocument extends prismicT.PrismicDocument>(
		tags: string[],
		params?: Partial<BuildQueryURLArgs>
	): Promise<Query<TDocument>> {
		return await this.get<TDocument>(
			appendPredicates(tagsPredicate(tags))(params)
		);
	}

	/**
	 * Queries all documents from the Prismic repository with a specific tag.
	 *
	 * This method may make multiple network requests to query all matching content.
	 *
	 * @typeParam TDocument Type of Prismic documents returned.
	 * @param tags A list of tags that must be included on a document.
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A list of all documents with the tag.
	 *
	 * @example
	 * ```ts
	 * const response = await client.getAllByTag('food')
	 * ```
	 */
	async getAllByTags<TDocument extends prismicT.PrismicDocument>(
		tags: string[],
		params?: Partial<Omit<BuildQueryURLArgs, "page">>
	): Promise<TDocument[]> {
		return await this.getAll<TDocument>(
			appendPredicates(tagsPredicate(tags))(params)
		);
	}

	/**
	 * Returns metadata about the Prismic repository, such as its refs, releases, and custom types.
	 *
	 * @returns Repository metadata.
	 */
	async getRepository(): Promise<Repository> {
		// TODO: Uncomment when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		// return await this.fetch<Repository>(this.endpoint);

		const url = new URL(this.endpoint);

		if (this.accessToken) {
			url.searchParams.set("access_token", this.accessToken);
		}

		return await this.fetch<Repository>(url.toString());
	}

	/**
	 * Returns a list of all refs for the Prismic repository.
	 *
	 * Refs are used to identify which version of the repository's content should be queried. All repositories will have at least one ref pointing to the latest published content called the "master ref".
	 *
	 * @returns A list of all refs for the Prismic repository.
	 */
	async getRefs(): Promise<Ref[]> {
		const res = await this.getRepository();

		return res.refs;
	}

	/**
	 * Returns a ref for the Prismic repository with a matching ID.
	 *
	 * @param id ID of the ref.
	 *
	 * @returns The ref with a matching ID, if it exists.
	 */
	async getRefById(id: string): Promise<Ref> {
		const refs = await this.getRefs();

		return findRef(refs, ref => ref.id === id);
	}

	/**
	 * Returns a ref for the Prismic repository with a matching label.
	 *
	 * @param label Label of the ref.
	 *
	 * @returns The ref with a matching label, if it exists.
	 */
	async getRefByLabel(label: string): Promise<Ref> {
		const refs = await this.getRefs();

		return findRef(refs, ref => ref.label === label);
	}

	/**
	 * Returns the master ref for the Prismic repository. The master ref points to the repository's latest published content.
	 *
	 * @returns The repository's master ref.
	 */
	async getMasterRef(): Promise<Ref> {
		const refs = await this.getRefs();

		return findRef(refs, ref => ref.isMasterRef);
	}

	/**
	 * Returns a list of all Releases for the Prismic repository. Releases are used to group content changes before publishing.
	 *
	 * @returns A list of all Releases for the Prismic repository.
	 */
	async getReleases(): Promise<Ref[]> {
		const refs = await this.getRefs();

		return refs.filter(ref => !ref.isMasterRef);
	}

	/**
	 * Returns a Release for the Prismic repository with a matching ID.
	 *
	 * @param id ID of the Release.
	 *
	 * @returns The Release with a matching ID, if it exists.
	 */
	async getReleaseByID(id: string): Promise<Ref> {
		const releases = await this.getReleases();

		return findRef(releases, ref => ref.id === id);
	}

	/**
	 * Returns a Release for the Prismic repository with a matching label.
	 *
	 * @param label Label of the ref.
	 *
	 * @returns The ref with a matching label, if it exists.
	 */
	async getReleaseByLabel(label: string): Promise<Ref> {
		const releases = await this.getReleases();

		return findRef(releases, ref => ref.label === label);
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
			const res = await this.getRepository();

			return res.tags;
		}
	}

	/**
	 * Builds a URL used to query content from the Prismic repository.
	 *
	 * @param params Parameters to filter, sort, and paginate the results.
	 *
	 * @returns A URL string that can be requested to query content.
	 */
	async buildQueryURL(
		params: Partial<BuildQueryURLArgs> = {}
	): Promise<string> {
		// TODO: Uncomment when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		// const {
		// 	ref = await this.getResolvedRefString(),
		// 	accessToken: _accessToken,
		// 	...actualParams
		// } = params;
		const {
			ref = await this.getResolvedRefString(),
			accessToken = this.accessToken,
			...actualParams
		} = params;

		return buildQueryURL(this.endpoint, {
			...this.defaultParams,
			...actualParams,
			accessToken,
			ref
		});
	}

	/**
	 * Determines the URL for a previewed document during an active preview session. The result of this method should be used to redirect the user to the document's URL.
	 *
	 * @param args Arguments to configure the URL resolving.
	 *
	 * @returns The URL for the previewed document during an active preview session. The user should be redirected to this URL.
	 *
	 * @example
	 * ```ts
	 * const url = client.resolvePreviewURL({
	 *   linkResolver: (document) => `/${document.uid}`
	 *   defaultURL: '/'
	 * })
	 * ```
	 */
	async resolvePreviewURL(args: ResolvePreviewArgs): Promise<string> {
		let documentId = args.documentId;
		let previewToken = args.previewToken;

		if (typeof globalThis.location !== "undefined") {
			const searchParams = new URLSearchParams(globalThis.location.search);
			documentId = documentId || searchParams.get("documentId") || undefined;
			previewToken = previewToken || searchParams.get("token") || undefined;
		} else if (this.refMode.httpRequest?.query) {
			if (typeof this.refMode.httpRequest.query.documentId === "string") {
				documentId = documentId || this.refMode.httpRequest.query.documentId;
			}
			if (typeof this.refMode.httpRequest.query.token === "string") {
				previewToken = previewToken || this.refMode.httpRequest.query.token;
			}
		}

		if (documentId != null) {
			const document = await this.getByID(documentId, {
				ref: previewToken
			});

			// We know we have a valid field to resolve since we are using prismicH.documentToLinkField
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return prismicH.asLink(
				prismicH.documentToLinkField(document),
				args.linkResolver
			)!;
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
	 * ```ts
	 * await client.queryLatestContent()
	 * const document = await client.getByID('WW4bKScAAMAqmluX')
	 * ```
	 */
	queryLatestContent(): void {
		this.refMode = {
			...this.refMode,
			type: RefStateType.Master
		};
	}

	/**
	 * Configures the client to query content from a specific Release identified by its ID for all future queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for that query.
	 *
	 * @param id The ID of the Release.
	 *
	 * @example
	 * ```ts
	 * await client.queryContentFromReleaseByID('YLB7OBAAACMA7Cpa')
	 * const document = await client.getByID('WW4bKScAAMAqmluX')
	 * ```
	 */
	queryContentFromReleaseByID(releaseId: string): void {
		this.refMode = {
			...this.refMode,
			type: RefStateType.ReleaseByID,
			payload: { releaseId }
		};
	}

	/**
	 * Configures the client to query content from a specific Release identified by its label for all future queries.
	 *
	 * If the `ref` parameter is provided during a query, it takes priority for that query.
	 *
	 * @param label The label of the Release.
	 *
	 * @example
	 * ```ts
	 * await client.queryContentFromReleaseByLabel('My Release')
	 * const document = await client.getByID('WW4bKScAAMAqmluX')
	 * ```
	 */
	queryContentFromReleaseByLabel(releaseLabel: string): void {
		this.refMode = {
			...this.refMode,
			type: RefStateType.ReleaseByLabel,
			payload: { releaseLabel }
		};
	}

	/**
	 * Configures the client to query content from a specific ref. The ref can be provided as a string or a function.
	 *
	 * If a function is provided, the ref is fetched lazily before each query. The function may also be asynchronous.
	 *
	 * @param ref The ref or a function that returns the ref from which to query content.
	 *
	 * @example
	 * ```ts
	 * await client.queryContentFromRef('my-ref')
	 * const document = await client.getByID('WW4bKScAAMAqmluX')
	 * ```
	 */
	queryContentFromRef(ref: RefStringOrFn): void {
		this.refMode = {
			...this.refMode,
			type: RefStateType.Manual,
			payload: { refStringOrFn: ref }
		};
	}

	/**
	 * Returns a cached version of `getRepository` with a TTL.
	 *
	 * @returns Cached repository metadata.
	 */
	private async getCachedRepository(): Promise<Repository> {
		const cacheKey = this.endpoint;

		const cachedRepository = this.internalCache.get<Repository>(cacheKey);

		if (cachedRepository) {
			return cachedRepository;
		}

		const repository = await this.getRepository();

		this.internalCache.set(cacheKey, repository, REPOSITORY_CACHE_TTL);

		return repository;
	}

	/**
	 * Returns a cached Prismic repository form. Forms are used to determine API endpoints for types of repository data.
	 *
	 * @throws If a matching form cannot be found.
	 *
	 * @param name Name of the form.
	 *
	 * @returns The repository form.
	 */
	private async getCachedRepositoryForm(name: string): Promise<Form> {
		const cachedRepository = await this.getCachedRepository();
		const form = cachedRepository.forms[name];

		if (!form) {
			throw new Error(`Form with name "${name}" could not be found`);
		}

		return form;
	}

	/**
	 * Returns the preview ref for the client, if one exists.
	 *
	 * If this method is used in the browser, the browser's cookies will be read. If this method is used on the server, the cookies from the saved HTTP Request will be read, if an HTTP Request was given.
	 *
	 * @returns The preview ref as a string, if one exists.
	 */
	private getPreviewRefString(): string | undefined {
		if (globalThis.document?.cookie) {
			return getCookie(cookie.preview, globalThis.document.cookie);
		} else if (this.refMode.httpRequest?.headers?.cookie) {
			return getCookie(cookie.preview, this.refMode.httpRequest.headers.cookie);
		}
	}

	/**
	 * Returns the ref needed to query based on the client's current state. This method may make a network request to fetch a ref or resolve the users's ref thunk.
	 *
	 * If auto previews are enabled, the preview ref takes priority if available.
	 *
	 * The following strategies are used depending on the client's state:
	 *
	 * - If the user called `queryLatestContent`: Use the repository's master ref. The ref is cached for 5 seconds. After 5 seconds, a new master ref is fetched.
	 *
	 * - If the user called `queryContentFromReleaseByID`: Use the release's ref. The ref is cached for 5 seconds. After 5 seconds, a new ref for the release is fetched.
	 *
	 * - If the user called `queryContentFromReleaseByLabel`: Use the release's ref. The ref is cached for 5 seconds. After 5 seconds, a new ref for the release is fetched.
	 *
	 * - If the user called `queryContentFromRef`: Use the provided ref. Fall back to the master ref if the ref is not a string.
	 *
	 * @returns The ref to use during a query.
	 */
	private async getResolvedRefString(): Promise<string> {
		if (this.refMode.autoPreviewsEnabled) {
			const previewRef = this.getPreviewRefString();

			if (previewRef) {
				return previewRef;
			}
		}

		switch (this.refMode.type) {
			case RefStateType.ReleaseByID: {
				const releaseId = this.refMode.payload.releaseId;
				const repository = await this.getCachedRepository();
				const ref = findRef(repository.refs, ref => ref.id === releaseId);

				return ref.ref;
			}

			case RefStateType.ReleaseByLabel: {
				const releaseLabel = this.refMode.payload.releaseLabel;
				const repository = await this.getCachedRepository();
				const ref = findRef(repository.refs, ref => ref.label === releaseLabel);

				return ref.ref;
			}

			case RefStateType.Manual: {
				const thisRefStringOrFn = this.refMode.payload.refStringOrFn;

				if (typeof thisRefStringOrFn === "function") {
					const res = await thisRefStringOrFn();

					if (typeof res === "string") {
						return res;
					}
				} else if (thisRefStringOrFn) {
					return thisRefStringOrFn;
				}
			}

			case RefStateType.Master:
			default: {
				const repository = await this.getCachedRepository();
				const ref = findRef(repository.refs, ref => ref.isMasterRef);

				return ref.ref;
			}
		}
	}

	/**
	 * Returns the network request options required by the Prismic repository.
	 *
	 * It currently only includes an Authorization header if an access token is provided.
	 *
	 * @param params Parameters for the query, including an access token.
	 *
	 * @returns Request options that can be used to make a network request to query the repository.
	 */
	// TODO: Uncomment when the Authorization header can be used
	// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
	// private buildRequestOptions(
	// 	params?: Partial<BuildQueryURLArgs>
	// ): RequestInitLike {
	// 	const accessToken = params?.accessToken || this.accessToken;

	// 	return accessToken
	// 		? { headers: { Authorization: `Token ${accessToken}` } }
	// 		: {};
	// }

	/**
	 * Performs a network request using the configured `fetch` function. It assumes all successful responses will have a JSON content type. It also normalizes unsuccessful network requests.
	 *
	 * @typeParam T The JSON response.
	 * @param url URL to the resource to fetch.
	 * @param params Prismic REST API parameters for the network request.
	 *
	 * @returns The JSON response from the network request.
	 */
	private async fetch<T = unknown>(
		url: string
		// TODO: Uncomment when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		// params?: Partial<BuildQueryURLArgs>
	): Promise<T> {
		// TODO: Uncomment when the Authorization header can be used
		// @see Related issue - {@link https://github.com/prismicio/issue-tracker-wroom/issues/351}
		// const options = this.buildRequestOptions(params);
		// const res = await this.fetchFn(url, options);
		const res = await this.fetchFn(url);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let json: any;
		try {
			// We can assume Prismic REST API responses will have a `application/json`
			// Content Type. If not, this will throw, signaling an invalid response.
			json = await res.json();
		} catch {
			throw new PrismicError(undefined, { url });
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
				if (isParsingErrorAPIResponse(json)) {
					throw new ParsingError(json.message, {
						url,
						response: json
					});
				}

				break;
			}

			// Unauthorized
			// - Missing access token for repository endpoint
			// - Incorrect access token for repository endpoint
			case 401:
			// Forbidden
			// - Missing access token for query endpoint
			// - Incorrect access token for query endpoint
			case 403: {
				if (isForbiddenErrorAPIResponse(json)) {
					throw new ForbiddenError(
						"error" in json ? json.error : json.message,
						{
							url,
							response: json
						}
					);
				}
			}
		}

		throw new PrismicError(undefined, { url, response: json });
	}
}
