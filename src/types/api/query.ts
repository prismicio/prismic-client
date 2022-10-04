import { PrismicDocument } from "../value/document";

/**
 * A query response from the Prismic REST API V2. The response contains
 * paginated metadata and a list of matching results for the query.
 *
 * @typeParam Document - The type(s) of Prismic document that can be returned.
 * @see More details on querying: {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api}
 */
export interface Query<Document extends PrismicDocument = PrismicDocument> {
	/**
	 * The page number for this page of results.
	 */
	page: number;

	/**
	 * Maximum number of results per page.
	 */
	results_per_page: number;

	/**
	 * Number of results in this page.
	 */
	results_size: number;

	/**
	 * Total number of results within all pages.
	 */
	total_results_size: number;

	/**
	 * Total number of pages.
	 */
	total_pages: number;

	/**
	 * The Prismic REST API V2 URL to the next page, if one exists.
	 */
	next_page: string | null;

	/**
	 * The Prismic REST API V2 URL to the previous page, if one exists.
	 */
	prev_page: string | null;

	/**
	 * A paginated list of documents matching the query.
	 */
	results: Document[];
}
