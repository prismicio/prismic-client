import type { CustomTypeModelFieldType } from "./types";

/**
 * Dimension constraints for an Image Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/image}
 */
export interface CustomTypeModelImageConstraint {
	width?: number | null;
	height?: number | null;
}

/**
 * A thumbnail for an Image Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/image}
 */
export interface CustomTypeModelImageThumbnail<Name extends string = string>
	extends CustomTypeModelImageConstraint {
	name: Name;
}

/**
 * An Image Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/image}
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
