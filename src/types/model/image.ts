import type { CustomTypeModelFieldType } from "./types";

/**
 * Dimension constraints for an image custom type field.
 *
 * More details: {@link https://prismic.io/docs/image}
 */
export interface CustomTypeModelImageConstraint {
	width?: number | null;
	height?: number | null;
}

/**
 * A thumbnail for an image custom type field.
 *
 * More details: {@link https://prismic.io/docs/image}
 */
export interface CustomTypeModelImageThumbnail<Name extends string = string>
	extends CustomTypeModelImageConstraint {
	name: Name;
}

/**
 * An image custom type field.
 *
 * More details: {@link https://prismic.io/docs/image}
 */
export interface CustomTypeModelImageField<
	ThumbnailNames extends string = string,
> {
	type: typeof CustomTypeModelFieldType.Image;
	config?: {
		label?: string | null;
		constraint?: CustomTypeModelImageConstraint;
		thumbnails?: readonly CustomTypeModelImageThumbnail<ThumbnailNames>[];
	};
}
