import type { CustomTypeModelFieldType } from "./types";

import type { CustomTypeModelLinkSelectType } from "./link";

/**
 * A content relationship custom type field.
 *
 * More details: {@link https://prismic.io/docs/content-relationship}
 */
export interface CustomTypeModelContentRelationshipField<
	CustomTypeIDs extends string = string,
	Tags extends string = string,
> {
	type: typeof CustomTypeModelFieldType.Link;
	config?: {
		label?: string | null;
		placeholder?: string;
		select: typeof CustomTypeModelLinkSelectType.Document;
		customtypes?: readonly CustomTypeIDs[];
		tags?: readonly Tags[];
	};
}
