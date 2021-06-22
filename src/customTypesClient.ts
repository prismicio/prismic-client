import {
	CustomTypeMetadata,
	FetchLike,
	RequestInitLike,
	SliceSchema
} from "./types";
import { MissingFetchError } from "./MissingFetchError";
import { PrismicError } from "./PrismicError";

const DEFAULT_CUSTOM_TYPES_API_ENDPOINT =
	"https://customtypes.prismic.io/customtypes";

export type CustomTypesClientConfig = {
	/**
	 * Name of the Prismic repository.
	 */
	repositoryName: string;

	/**
	 * The Prismic Custom Types API endpoint for the repository. The standard Custom Types API endpoint will be used if no value is provided.
	 */
	endpoint?: string;

	/**
	 * The secure token for accessing the Prismic Custom Types API. This is required to call any Custom Type API methods.
	 */
	token: string;

	/**
	 * The function used to make network requests to the Prismic Custom Types API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
	 */
	fetch?: FetchLike;
};

export type CustomTypesAPIParams = {
	/**
	 * Name of the Prismic repository.
	 */
	repositoryName?: string;

	/**
	 * The Prismic Custom Types API endpoint for the repository. The standard Custom Types API endpoint will be used if no value is provided.
	 */
	endpoint?: string;

	/**
	 * The secure token for accessing the Prismic Custom Types API. This is required to call any Custom Type API methods.
	 */
	token?: string;
};

export const createCustomTypesClient = (
	...args: ConstructorParameters<typeof CustomTypesClient>
): CustomTypesClient => new CustomTypesClient(...args);

export class CustomTypesClient {
	/**
	 * Name of the Prismic repository.
	 */
	repositoryName: string;

	/**
	 * The Prismic Custom Types API endpoint for the repository. The standard Custom Types API endpoint will be used if no value is provided.
	 */
	endpoint: string;

	/**
	 * The secure token for accessing the Prismic Custom Types API. This is required to call any Custom Type API methods.
	 */
	token: string;

	/**
	 * The function used to make network requests to the Prismic Custom Types API. In environments where a global `fetch` function does not exist, such as Node.js, this function must be provided.
	 */
	fetchFn: FetchLike;

	constructor(options: CustomTypesClientConfig) {
		this.repositoryName = options.repositoryName;
		this.endpoint = options.endpoint || DEFAULT_CUSTOM_TYPES_API_ENDPOINT;
		this.token = options.token;

		if (options.fetch) {
			this.fetchFn = options.fetch;
		} else if (typeof globalThis.fetch === "function") {
			this.fetchFn = globalThis.fetch;
		} else {
			throw new MissingFetchError();
		}
	}

	async getAll<TCustomType extends CustomTypeMetadata>(
		params: CustomTypesAPIParams = {}
	): Promise<TCustomType[]> {
		return await this.fetch<TCustomType[]>("", params);
	}

	async getByID<TCustomType extends CustomTypeMetadata>(
		id: string,
		params: CustomTypesAPIParams = {}
	): Promise<TCustomType> {
		return await this.fetch<TCustomType>(id, params);
	}

	async insert<TCustomType extends CustomTypeMetadata>(
		customType: TCustomType,
		params: CustomTypesAPIParams = {}
	): Promise<TCustomType> {
		return await this.fetch<TCustomType>("insert", params, {
			method: "post",
			body: JSON.stringify(customType)
		});
	}

	async update<TCustomType extends CustomTypeMetadata>(
		customType: TCustomType,
		params: CustomTypesAPIParams = {}
	): Promise<TCustomType> {
		return await this.fetch<TCustomType>("update", params, {
			method: "post",
			body: JSON.stringify(customType)
		});
	}

	async remove<TCustomType extends CustomTypeMetadata>(
		id: string,
		params: CustomTypesAPIParams = {}
	): Promise<TCustomType> {
		return await this.fetch<TCustomType>(id, params, { method: "delete" });
	}

	async getAllSharedSlices<TSlice extends SliceSchema>(
		params: CustomTypesAPIParams = {}
	): Promise<TSlice[]> {
		return await this.fetch<TSlice[]>("slices", params);
	}

	async getSharedSliceByID<TSlice extends SliceSchema>(
		id: string,
		params: CustomTypesAPIParams = {}
	): Promise<TSlice> {
		return await this.fetch<TSlice>(`slices/${id}`, params);
	}

	async insertSharedSlice<TSlice extends SliceSchema>(
		slice: TSlice,
		params: CustomTypesAPIParams = {}
	): Promise<TSlice> {
		return await this.fetch<TSlice>("slices/insert", params, {
			method: "post",
			body: JSON.stringify(slice)
		});
	}

	async updateSharedSlice<TSlice extends SliceSchema>(
		slice: TSlice,
		params: CustomTypesAPIParams = {}
	): Promise<TSlice> {
		return await this.fetch<TSlice>("slices/update", params, {
			method: "post",
			body: JSON.stringify(slice)
		});
	}

	async removeSharedSlice<TSlice extends SliceSchema>(
		id: string,
		params: CustomTypesAPIParams = {}
	): Promise<TSlice> {
		return await this.fetch<TSlice>(`slices/${id}`, params, {
			method: "delete"
		});
	}

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
		path: string,
		params: Partial<CustomTypesAPIParams> = {},
		requestOptions: RequestInitLike = {}
	): Promise<T> {
		const url = new URL(
			path,
			`${params.endpoint || this.endpoint}/`
		).toString();

		const res = await this.fetchFn(url.toString(), {
			headers: {
				"Content-Type": "application/json",
				repository: params.repositoryName || this.repositoryName,
				Authorization: `Bearer ${params.token || this.token}`
			},
			...requestOptions
		});

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
			case 200:
			case 201:
			case 204: {
				return json;
			}

			// // Bad Request
			// // - Invalid predicate syntax
			// // - Ref not provided (ignored)
			// case 400: {
			// 	break;
			// }

			// Forbidden
			// - Missing token
			// - Incorrect token
			case 403: {
				// TODO
			}

			// Conflict
			// - Insert a Custom Type with same ID as an existing Custom Type
			// - Insert a Shared Slice with same ID as an existing Shared Slice
			case 409: {
				// TODO
			}

			// Unprocessable Entity
			// - Update a Custom Type with same ID as an existing Custom Type
			// - Update a Shared Slice with same ID as an existing Shared Slice
			case 422: {
				// TODO
			}
		}

		throw new PrismicError(undefined, { url, response: json });
	}
}
