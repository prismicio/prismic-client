/**
 * List of tags returned from the Prismic Tags API. This data can be fetched by
 * sending a `GET` request to a repository's `/api/tags` endpoint.
 *
 * @typeParam Tag - Tags that are returned by the Tags API.
 * @see More details on the Tags API: {@link https://prismic.io/docs/technologies/tags-api-technical-reference}
 */
export type Tags<Tag extends string = string> = Tag[];
