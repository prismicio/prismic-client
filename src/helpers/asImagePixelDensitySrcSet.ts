import {
	BuildPixelDensitySrcSetParams,
	buildPixelDensitySrcSet,
	buildURL,
} from "imgix-url-builder";

import type { ImageFieldImage } from "../types/value/image";

import { imageThumbnail as isImageThumbnailFilled } from "./isFilled";

/**
 * The default pixel densities used to generate a `srcset` value.
 */
const DEFAULT_PIXEL_DENSITIES = [1, 2, 3];

/**
 * Configuration for `asImagePixelDensitySrcSet()`.
 */
type AsImagePixelDensitySrcSetConfig = Omit<
	BuildPixelDensitySrcSetParams,
	"pixelDensities"
> &
	Partial<Pick<BuildPixelDensitySrcSetParams, "pixelDensities">>;

/**
 * The return type of `asImagePixelDensitySrcSet()`.
 */
type AsImagePixelDensitySrcSetReturnType<
	Field extends ImageFieldImage | null | undefined,
> = Field extends ImageFieldImage<"filled">
	? {
			/**
			 * The image field's image URL with Imgix URL parameters (if given).
			 */
			src: string;

			/**
			 * A pixel-densitye-based `srcset` attribute value for the image field's
			 * image with Imgix URL parameters (if given).
			 */
			srcset: string;
	  }
	: null;

/**
 * Creates a pixel-density-based `srcset` from an image field with optional
 * image transformations (via Imgix URL parameters).
 *
 * If a `pixelDensities` parameter is not given, the following pixel densities
 * will be used by default: 1, 2, 3.
 *
 * @example
 *
 * ```ts
 * const srcset = asImagePixelDensitySrcSet(document.data.imageField, {
 * 	pixelDensities: [1, 2],
 * 	sat: -100,
 * });
 * // => {
 * //   src:    'https://images.prismic.io/repo/image.png?sat=-100',
 * //   srcset: 'https://images.prismic.io/repo/image.png?sat=-100&dpr=1 1x, ' +
 * //           'https://images.prismic.io/repo/image.png?sat=-100&dpr=2 2x'
 * // }
 * ```
 *
 * @param field - Image field (or one of its responsive views) from which to get
 *   an image URL.
 * @param config - An object of Imgix URL API parameters. The `pixelDensities`
 *   parameter defines the resulting `srcset` widths.
 *
 * @returns A `srcset` attribute value for the image field with Imgix URL
 *   parameters (if given). If the image field is empty, `null` is returned.
 *
 * @see Imgix URL parameters reference: https://docs.imgix.com/apis/rendering
 */
export const asImagePixelDensitySrcSet = <
	Field extends ImageFieldImage | null | undefined,
>(
	field: Field,
	config: AsImagePixelDensitySrcSetConfig = {},
): AsImagePixelDensitySrcSetReturnType<Field> => {
	if (field && isImageThumbnailFilled(field)) {
		// We are using destructuring to omit `pixelDensities` from the
		// object we will pass to `buildURL()`.
		const { pixelDensities = DEFAULT_PIXEL_DENSITIES, ...imgixParams } = config;

		return {
			src: buildURL(field.url, imgixParams),
			srcset: buildPixelDensitySrcSet(field.url, {
				...imgixParams,
				pixelDensities,
			}),
		} as AsImagePixelDensitySrcSetReturnType<Field>;
	} else {
		return null as AsImagePixelDensitySrcSetReturnType<Field>;
	}
};
