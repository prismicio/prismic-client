import type { ImgixURLParams } from "imgix-url-builder"
import { buildURL } from "imgix-url-builder"

import type { ImageFieldImage } from "../types/value/image"

import { imageThumbnail as isImageThumbnailFilled } from "./isFilled"

/**
 * The return type of `asImageSrc()`.
 */
type AsImageSrcReturnType<Field extends ImageFieldImage | null | undefined> =
	Field extends ImageFieldImage<"filled"> ? string : null

/**
 * Returns the URL of an image field with optional image transformations via
 * imgix URL parameters.
 *
 * @example
 *
 * ```ts
 * const src = asImageSrc(document.data.photo, { sat: -100 })
 * // => "https://images.prismic.io/repo/image.png?sat=-100"
 * ```
 *
 * @param field - An image field (or one of its responsive views) from which to
 *   get an image URL.
 * @param config - An object of imgix URL API parameters to transform the image.
 *
 * @returns The image field's URL with transformations applied, or `null` if the
 *   field is empty.
 *
 * @see Learn how to optimize images with imgix: {@link https://prismic.io/docs/fields/image}
 * @see imgix URL parameters reference: {@link https://docs.imgix.com/apis/rendering}
 */
export const asImageSrc = <Field extends ImageFieldImage | null | undefined>(
	field: Field,
	config: ImgixURLParams = {},
): AsImageSrcReturnType<Field> => {
	if (field && isImageThumbnailFilled(field)) {
		return buildURL(field.url, config) as AsImageSrcReturnType<Field>
	} else {
		return null as AsImageSrcReturnType<Field>
	}
}
