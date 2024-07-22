import type { FieldState, Simplify } from "./types";

/**
 * An individual image within an image field. The base image and each thumbnail
 * uses this type.
 *
 * @typeParam State - State of the field which determines its shape.
 *
 * @see {@link ImageField} for a full image field type.
 */
export type ImageFieldImage<State extends FieldState = FieldState> =
	State extends "empty" ? EmptyImageFieldImage : FilledImageFieldImage;

export interface FilledImageFieldImage {
	id: string;
	url: string;
	dimensions: {
		width: number;
		height: number;
	};
	edit: {
		x: number;
		y: number;
		zoom: number;
		background: string;
	};
	alt: string | null;
	copyright: string | null;
}

export interface EmptyImageFieldImage {
	id?: null;
	url?: null;
	dimensions?: null;
	edit?: null;
	alt?: null;
	copyright?: null;
}

/**
 * An image field.
 *
 * **Note**: Passing `null` to the `ThumbnailNames` parameter is deprecated and
 * will be removed in a future version. Use `never` instead.
 *
 * @typeParam ThumbnailNames - Names of thumbnails. If the field does not
 *   contain thumbnails, `never` can be used to "disable" thumbnail fields.
 * @typeParam State - State of the field which determines its shape.
 *
 * @see Image field documentation: {@link https://prismic.io/docs/image}
 */
export type ImageField<
	// `null` is included for backwards compatibility with older versions of
	// this package. `null` should be treated as deprecated. `never` is
	// preferred.
	ThumbnailNames extends string | null = never,
	State extends FieldState = FieldState,
> =
	// Simplify is necessary. Without it, group and Slice types break for
	// unknown reasons. If you know why, please update this comment with an
	// explanation. :)
	Simplify<
		// This `extends` and duplicated type is necessary. Without it,
		// TypeScript cannot correct narrow "filled" and "empty" types with the
		// `isFilled.image()` helper.
		//
		// Futhermore, duplicating rather than abstracting the type to
		// a secondary "_ImageFieldImage"-like type is preferred. If the
		// type was abstracted, TypeScript's language server would
		// return the abstracted type's name rather than the clearer
		// version written below. This version leads to a better code
		// editor experience.
		State extends "filled"
			? ImageFieldImage<State> &
					Record<Extract<ThumbnailNames, string>, ImageFieldImage<State>>
			: ImageFieldImage<State> &
					Record<Extract<ThumbnailNames, string>, ImageFieldImage<State>>
	>;
