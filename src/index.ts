// Primary library API.
import { getRepositoryEndpoint } from "./getRepositoryEndpoint";
export { getRepositoryEndpoint };
/**
 * @deprecated Renamed to `getRepositoryEndpoint`.
 */
// TODO: Remove in v3.
export const getEndpoint = getRepositoryEndpoint;
export { getRepositoryName } from "./getRepositoryName";
export { getGraphQLEndpoint } from "./getGraphQLEndpoint";
export { isRepositoryName } from "./isRepositoryName";
export { isRepositoryEndpoint } from "./isRepositoryEndpoint";
export { buildQueryURL } from "./buildQueryURL";
export { createClient, Client } from "./client";

// Predicates API.
import { predicate } from "./predicate";
export { predicate };
/**
 * @deprecated Renamed to `predicate` (without an "s").
 */
// TODO: Remove in v3.
export const predicates = predicate;
/**
 * @deprecated Renamed to `predicate` (lowercase and without an "s").
 */
// TODO: Remove in v3.
export const Predicates = predicate;

// Custom errors used by Client.
export { PrismicError } from "./PrismicError";
export { ForbiddenError } from "./ForbiddenError";
export { ParsingError } from "./ParsingError";
export { NotFoundError } from "./NotFoundError";

// A collection of well-known cookie names shared between Prismic libraries and systems.
export * as cookie from "./cookie";

// General types used throughout the project. These are made public to allow users to better type their projects.
export type { CreateClient, ClientConfig } from "./client";
export type { QueryParams, BuildQueryURLArgs } from "./buildQueryURL";
export type {
	AbortSignalLike,
	FetchLike,
	HttpRequestLike,
	Ordering,
	RequestInitLike,
	ResponseLike,
	Route,
} from "./types";
