import type { RTImageNode, RTLinkNode } from "../value/richText"

import type { MigrationImageField, MigrationLinkField } from "./fields"

export type MigrationRTLinkNode = Omit<RTLinkNode, "data"> & {
	data: MigrationLinkField
}

export type MigrationRTImageNode = MigrationImageField & {
	linkTo?: RTImageNode["linkTo"] | MigrationLinkField
}
