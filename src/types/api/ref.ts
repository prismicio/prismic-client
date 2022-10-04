/**
 * Metadata for a reference to a version of a repository's content.
 *
 * @see More details on refs: {@link https://prismic.io/docs/technologies/introduction-to-the-content-query-api#prismic-api-ref}
 */
export interface Ref {
	/**
	 * The unique identifier for the ref.
	 */
	id: string;

	/**
	 * The identifier that should be provided to the API to select a content
	 * version.
	 */
	ref: string;

	/**
	 * A human-readable name for the ref. The master ref is always named "Master".
	 */
	label: string;

	/**
	 * Determines if the ref is the master ref. The master ref contains the latest
	 * published content.
	 */
	isMasterRef: boolean;

	/**
	 * If the ref is associated with a Release, this field contains the timestamp
	 * at which the Release will be automatically published, if set.
	 *
	 * @see More details on Releases: {@link https://prismic.io/docs/core-concepts/draft-plan-and-schedule-content#releases}
	 */
	scheduledAt?: string;
}
