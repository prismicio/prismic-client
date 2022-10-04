import type { CustomTypeModelFieldType } from "./types";

/**
 * A Rich Text Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/rich-text-title}
 */
export type CustomTypeModelRichTextField =
	| CustomTypeModelRichTextMultiField
	| CustomTypeModelRichTextSingleField;

/**
 * A Rich Text Custom Type field which supports multiple blocks of content.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/rich-text-title}
 */
export interface CustomTypeModelRichTextMultiField {
	type: typeof CustomTypeModelFieldType.StructuredText;
	config?: {
		label?: string | null;
		placeholder?: string;
		allowTargetBlank?: boolean;
		multi?: string;
	};
}

/**
 * A Rich Text Custom Type field which supports one block of content.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/rich-text-title}
 */
export interface CustomTypeModelRichTextSingleField {
	type: typeof CustomTypeModelFieldType.StructuredText;
	config?: {
		label?: string | null;
		placeholder?: string;
		allowTargetBlank?: boolean;
		single?: string;
	};
}
