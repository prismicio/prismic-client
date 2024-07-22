import {
	BuildWidthSrcSetParams,
	buildURL,
	buildWidthSrcSet,
} from "imgix-url-builder";

import type { ImageFieldImage } from "../types/value/image";

import * as isFilled from "./isFilled";

/**
 * The default widths used to generate a `srcset` value.
 */
const DEFAULT_WIDTHS = [640, 828, 1200, 2048, 3840];

/**
 * The return type of `asImageWidthSrcSet()`.
 */
type AsImageWidthSrcSetReturnType<
	Field extends ImageFieldImage | null | undefined,
> = Field extends ImageFieldImage<"filled">
	? {
			/**
			 * The image field's image URL with Imgix URL parameters (if given).
			 */
			src: string;

			/**
			 * A width-based `srcset` attribute value for the image field's image with
			 * Imgix URL parameters (if given).
			 */
			srcset: string;
	  }
	: null;

/**
 * Configuration for `asImageWidthSrcSet()`.
 */
type AsImageWidthSrcSetConfig = Omit<BuildWidthSrcSetParams, "widths"> & {
	widths?: "thumbnails" | BuildWidthSrcSetParams["widths"];
};

/**
 * Creates a width-based `srcset` from an image field with optional image
 * transformations (via Imgix URL parameters).
 *
 * If a `widths` parameter is not given, the following widths will be used by
 * default: 640, 750, 828, 1080, 1200, 1920, 2048, 3840.
 *
 * If the image field contains responsive views, each responsive view can be
 * used as a width in the resulting `srcset` by passing `"thumbnails"` as the
 * `widths` parameter.
 *
 * @example
 *
 * ```ts
 * const srcset = asImageWidthSrcSet(document.data.imageField, {
 * 	widths: [400, 800, 1600],
 * 	sat: -100,
 * });
 * // => {
 * //   src:    'https://images.prismic.io/repo/image.png?sat=-100',
 * //   srcset: 'https://images.prismic.io/repo/image.png?sat=-100&width=400 400w, ' +
 * //           'https://images.prismic.io/repo/image.png?sat=-100&width=800 800w,' +
 * //           'https://images.prismic.io/repo/image.png?sat=-100&width=1600 1600w'
 * // }
 * ```
 *
 * @param field - Image field (or one of its responsive views) from which to get
 *   an image URL.
 * @param config - An object of Imgix URL API parameters. The `widths` parameter
 *   defines the resulting `srcset` widths. Pass `"thumbnails"` to automatically
 *   use the field's responsive views.
 *
 * @returns A `srcset` attribute value for the image field with Imgix URL
 *   parameters (if given). If the image field is empty, `null` is returned.
 *
 * @see Imgix URL parameters reference: https://docs.imgix.com/apis/rendering
 */
export const asImageWidthSrcSet = <
	Field extends ImageFieldImage | null | undefined,
>(
	field: Field,
	config: AsImageWidthSrcSetConfig = {},
): AsImageWidthSrcSetReturnType<Field> => {
	if (field && isFilled.imageThumbnail(field)) {
		// We are using destructuring to omit `widths` from the object
		// we will pass to `buildURL()`.
		let {
			widths = DEFAULT_WIDTHS,
			// eslint-disable-next-line prefer-const
			...imgixParams
		} = config;
		const {
			url,
			dimensions,
			id: _id,
			alt: _alt,
			copyright: _copyright,
			edit: _edit,
			...responsiveViews
		} = field;

		// The Prismic Rest API will always return thumbnail values if
		// the base size is filled.
		const responsiveViewObjects: ImageFieldImage<"filled">[] =
			Object.values(responsiveViews);

		// If this `asImageWidthSrcSet()` call is configured to use
		// thumbnail widths, but the field does not have thumbnails, we
		// fall back to the default set of widths.
		if (widths === "thumbnails" && responsiveViewObjects.length < 1) {
			widths = DEFAULT_WIDTHS;
		}

		return {
			src: buildURL(url, imgixParams),
			srcset:
				// By this point, we know `widths` can only be
				// `"thubmanils"` if the field has thumbnails.
				widths === "thumbnails"
					? [
							buildWidthSrcSet(url, {
								...imgixParams,
								widths: [dimensions.width],
							}),
							...responsiveViewObjects.map((thumbnail) => {
								return buildWidthSrcSet(thumbnail.url, {
									...imgixParams,
									widths: [thumbnail.dimensions.width],
								});
							}),
					  ].join(", ")
					: buildWidthSrcSet(field.url, {
							...imgixParams,
							widths,
					  }),
		} as AsImageWidthSrcSetReturnType<Field>;
	} else {
		return null as AsImageWidthSrcSetReturnType<Field>;
	}
};
