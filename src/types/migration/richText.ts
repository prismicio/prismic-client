import type { RTImageNode, RTLinkNode } from "../value/richText"

import type { MigrationImageField, MigrationLinkField } from "./fields"

/**
 * An alternate version of {@link RTLinkNode} that supports
 * {@link MigrationLinkField} for use with the migration API.
 */
export type MigrationRTLinkNode = Omit<RTLinkNode, "data"> & {
	data: MigrationLinkField
}

/**
 * An alternate version of {@link RTImageNode} that supports
 * {@link MigrationImageField} for use with the migration API.
 */
export type MigrationRTImageNode = MigrationImageField & {
	linkTo?: RTImageNode["linkTo"] | MigrationLinkField
}
