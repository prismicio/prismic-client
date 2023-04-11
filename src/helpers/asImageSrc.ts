import { ImgixURLParams, buildURL } from "imgix-url-builder";

import type { ImageFieldImage } from "../types/value/image";

import { imageThumbnail as isImageThumbnailFilled } from "./isFilled";

/**
 * The return type of `asImageSrc()`.
 */
type AsImageSrcReturnType<Field extends ImageFieldImage | null | undefined> =
	Field extends ImageFieldImage<"filled"> ? string : null;

/**
 * Returns the URL of an Image field with optional image transformations (via
 * Imgix URL parameters).
 *
 * @example
 *
 * ```ts
 * const src = asImageSrc(document.data.imageField, { sat: -100 });
 * // => https://images.prismic.io/repo/image.png?sat=-100
 * ```
 *
 * @param field - Image field (or one of its responsive views) from which to get
 *   an image URL.
 * @param params - An object of Imgix URL API parameters to transform the image.
 *
 * @returns The Image field's image URL with transformations applied (if given).
 *   If the Image field is empty, `null` is returned.
 * @see Imgix URL parameters reference: https://docs.imgix.com/apis/rendering
 */
export const asImageSrc = <Field extends ImageFieldImage | null | undefined>(
	field: Field,
	params: ImgixURLParams = {},
): AsImageSrcReturnType<Field> => {
	if (field && isImageThumbnailFilled(field)) {
		return buildURL(field.url, params) as AsImageSrcReturnType<Field>;
	} else {
		return null as AsImageSrcReturnType<Field>;
	}
};
