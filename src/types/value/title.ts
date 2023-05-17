import type { FieldState } from "./types";

import type {
	RTHeading1Node,
	RTHeading2Node,
	RTHeading3Node,
	RTHeading4Node,
	RTHeading5Node,
	RTHeading6Node,
} from "./richText";

/**
 * A title field.
 *
 * @see Title field documentation: {@link https://prismic.io/docs/rich-text-title}
 */
export type TitleField<State extends FieldState = FieldState> =
	State extends "empty"
		? []
		: [
				Omit<
					| RTHeading1Node
					| RTHeading2Node
					| RTHeading3Node
					| RTHeading4Node
					| RTHeading5Node
					| RTHeading6Node,
					"spans"
				> & {
					spans: [];
				},
		  ];
