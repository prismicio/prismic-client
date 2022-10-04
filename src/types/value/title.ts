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
 * Title Field
 *
 * @see Title field documentation: {@link https://prismic.io/docs/core-concepts/rich-text-title}
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
