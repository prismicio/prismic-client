import type { RTImageNode, RTLinkNode } from "../value/richText"

import type { ImageMigrationField, LinkMigrationField } from "./fields"

/**
 * An alternate version of {@link RTLinkNode} that supports
 * {@link LinkMigrationField} for use with the Migration API.
 */
export type RTLinkMigrationNode = Omit<RTLinkNode, "data"> & {
	data: LinkMigrationField
}

/**
 * An alternate version of {@link RTImageNode} that supports
 * {@link ImageMigrationField} for use with the Migration API.
 */
export type RTImageMigrationNode = ImageMigrationField & {
	linkTo?: RTImageNode["linkTo"] | LinkMigrationField
}
