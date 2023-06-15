import { Ref } from "./ref";

/**
 * Repository metadata returned from the Prismic REST API V2. This data can be
 * fetched by sending a `GET` a request to a repository's `/api/v2` endpoint.
 *
 * @see More details on the `/api/v2` endpoint: {@link https://prismic.io/docs/api#refs-and-the-entry-api}
 */
export interface Repository {
	/**
	 * A list of refs for the repository.
	 *
	 * @see {@link Ref}
	 */
	refs: Ref[];

	/**
	 * An identifier used to query content with the latest integration fields
	 * data.
	 */
	integrationFieldsRef: string | null;

	/**
	 * A list of languages for the repository.
	 *
	 * @see {@link Language}
	 */
	languages: Language[];

	/**
	 * A list of the repository's custom type API IDs mapped to their
	 * human-readable name.
	 */
	types: Record<string, string>;

	/**
	 * @deprecated Tags are only available in the forms object.
	 *
	 * @see More details in the blog post "A change to how the Prismic API handles tags": {@link https://prismic.io/blog/a-change-to-how-the-prismic-api-handles-tags}
	 */
	tags: string[];

	/**
	 * An internally-used list of REST API features for the repository.
	 *
	 * @internal
	 */
	forms: Record<string, Form>;

	/**
	 * The URL used to begin the OAuth process for the repository.
	 */
	oauth_initiate: string;

	/**
	 * The token used for the OAuth process for the repository.
	 */
	oauth_token: string;

	/**
	 * The version of the API.
	 */
	version: string;

	/**
	 * Licensing information for the repository content.
	 */
	license: string;

	/**
	 * @deprecated Experiments are no longer part of Prismic.
	 */
	experiments: unknown;

	/**
	 * @deprecated Bookmarks are not longer part of Prismic.
	 */
	bookmarks: Record<string, string>;
}

/**
 * Metadata for a language that has been configured for a repository.
 */
export interface Language {
	/**
	 * A unique identifier for the language.
	 */
	id: string;

	/**
	 * The name of the language.
	 */
	name: string;
}

/**
 * A Prismic REST API V2 feature supported by the repository. It contains
 * metadata about the feature and how to interact with it via the API.
 *
 * @internal
 */
export interface Form {
	method: "GET";
	enctype: string;
	action: string;
	name?: string;
	rel?: string;
	fields: Record<string, FormField>;
}

/**
 * A field for a feature of the Prismic REST API V2. It contains metadata about
 * the feature's field and how to interact with it via the API.
 *
 * @internal
 */
export interface FormField {
	type: "String" | "Integer";
	multiple: boolean;
	default?: string;
}
