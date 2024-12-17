import type { LinkType, OptionalLinkProperties } from "../value/link"

export type MaybeLink<T> =
	| Exclude<T, { link_type: (typeof LinkType)[keyof typeof LinkType] }>
	| (Extract<T, { link_type: (typeof LinkType)[keyof typeof LinkType] }> &
			OptionalLinkProperties)
