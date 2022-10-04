import { AnyRegularField } from "./types";
import { GroupField } from "./group";
import { SliceZone } from "./sliceZone";

/**
 * Document metadata for a translation of a Prismic document.
 */
export interface AlternateLanguage<TypeEnum = string, LangEnum = string> {
	id: string;
	uid?: string;
	type: TypeEnum;
	lang: LangEnum;
}

/**
 * Metadata for Prismic Document
 */
export interface PrismicDocumentHeader<TypeEnum = string, LangEnum = string> {
	/**
	 * The unique identifier for the document. Guaranteed to be unique among all
	 * documents in the Prismic repository.
	 */
	id: string;
	/**
	 * The unique identifier for the document. Guaranteed to be unique among all
	 * Prismic documents of the same type.
	 */
	uid: string | null;
	/**
	 * Url that refers to document.
	 */
	url: string | null;
	/**
	 * Type of the document.
	 */
	type: TypeEnum;
	/**
	 * Href for document.
	 */
	href: string;
	/**
	 * Tags associated with document.
	 */
	tags: string[];
	/**
	 * The timestamp at which the document was first published.
	 */
	first_publication_date: string;
	/**
	 * The timestamp at which the document was last published.
	 */
	last_publication_date: string;
	/**
	 * Slugs associated with document.
	 *
	 * @deprecated Slugs are a deprecated feature used before the UID field was
	 *   introduced. Migrate to the UID field. For more details, see
	 *   https://community.prismic.io/t/what-are-slugs/6493
	 */
	slugs: string[];
	/**
	 * Documents that are related to this document.
	 */
	linked_documents: unknown[]; // TODO: Not sure of the type for this one
	/**
	 * Language of document.
	 */
	lang: LangEnum;
	/**
	 * Array to access alternate language versions for document.
	 */
	alternate_languages: AlternateLanguage<TypeEnum, LangEnum>[];
}

/**
 * A Prismic document served through REST API v2.
 *
 * @see More details on Custom Types: {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api}
 */
export interface PrismicDocument<
	DataInterface extends Record<
		string,
		AnyRegularField | GroupField | SliceZone
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	> = Record<string, any>,
	TypeEnum = string,
	LangEnum = string,
> extends PrismicDocumentHeader<TypeEnum, LangEnum> {
	/**
	 * Data contained in the document.
	 */
	data: DataInterface;
}

/**
 * A Prismic document served through REST API v2. Does not contain a UID (a
 * unique identifier).
 *
 * @see More details on Custom Types: {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api}
 * @see More details on the UID field: {@link https://prismic.io/docs/core-concepts/uid}
 */
export interface PrismicDocumentWithoutUID<
	DataInterface extends Record<
		string,
		AnyRegularField | GroupField | SliceZone
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	> = Record<string, any>,
	TypeEnum = string,
	LangEnum = string,
> extends PrismicDocument<DataInterface, TypeEnum, LangEnum> {
	/**
	 * This document does not have a UID field. This property will always be
	 * `null`.
	 *
	 * The unique identifier for the document. Guaranteed to be unique among all
	 * Prismic documents of the same type.
	 */
	uid: null;
}

/**
 * A Prismic document served through REST API v2. Contains a UID (a unique
 * identifier).
 *
 * @see More details on Custom Types: {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api}
 * @see More details on the UID field: {@link https://prismic.io/docs/core-concepts/uid}
 */
export interface PrismicDocumentWithUID<
	DataInterface extends Record<
		string,
		AnyRegularField | GroupField | SliceZone
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	> = Record<string, any>,
	TypeEnum = string,
	LangEnum = string,
> extends PrismicDocument<DataInterface, TypeEnum, LangEnum> {
	/**
	 * The unique identifier for the document. Guaranteed to be unique among all
	 * Prismic documents of the same type.
	 */
	uid: string;
}
