import type { FieldState, Simplify } from "./types";

/**
 * An individual image within an Image field. The base image and each thumbnail
 * uses this type.
 *
 * @typeParam State - State of the field which determines its shape.
 * @see {@link ImageField} for a full Image field type.
 */
export type ImageFieldImage<State extends FieldState = FieldState> =
	State extends "empty" ? EmptyImageFieldImage : FilledImageFieldImage;

export interface FilledImageFieldImage {
	url: string;
	dimensions: {
		width: number;
		height: number;
	};
	alt: string | null;
	copyright: string | null;
}

export interface EmptyImageFieldImage {
	url?: null;
	dimensions?: null;
	alt?: null;
	copyright?: null;
}

/**
 * Image Field
 *
 * **Note**: Passing `null` to the `ThumbnailNames` parameter is deprecated and
 * will be removed in a future version. Use `never` instead.
 *
 * @typeParam ThumbnailNames - Names of thumbnails. If the field does not
 *   contain thumbnails, `never` can be used to "disable" thumbnail fields.
 * @typeParam State - State of the field which determines its shape.
 * @see Image field documentation: {@link https://prismic.io/docs/core-concepts/image}
 */
export type ImageField<
	// `null` is included for backwards compatibility with older versions of
	// this package. `null` should be treated as deprecated. `never` is
	// preferred.
	ThumbnailNames extends string | null = never,
	State extends FieldState = FieldState,
> = Simplify<
	ImageFieldImage<State> &
		Record<
			Exclude<Extract<ThumbnailNames, string>, keyof ImageFieldImage>,
			ImageFieldImage<State>
		>
>;
