import type {
	CustomTypeModelImageConstraint,
	CustomTypeModelImageField,
	CustomTypeModelImageThumbnail,
} from "../../types/model/image"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for an image field.
 */
export interface ImageFieldConfig<ThumbnailNames extends string = string> {
	label?: string | null
	/**
	 * Dimension constraints for the image.
	 */
	constraint?: CustomTypeModelImageConstraint
	/**
	 * Thumbnails (responsive views) for the image.
	 */
	thumbnails?: readonly CustomTypeModelImageThumbnail<ThumbnailNames>[]
}

/**
 * Creates an image field model.
 *
 * @example
 *
 * ```ts
 * // Simple image
 * model.image({ label: "Hero Image" })
 *
 * // With constraints
 * model.image({
 *   label: "Banner",
 *   constraint: { width: 1920, height: 1080 }
 * })
 *
 * // With thumbnails (type-safe names)
 * model.image({
 *   label: "Photo",
 *   thumbnails: [
 *     { name: "mobile", width: 640, height: 360 },
 *     { name: "tablet", width: 1024, height: 576 }
 *   ] as const
 * })
 * ```
 *
 * @typeParam ThumbnailNames - Thumbnail name literals for type inference.
 *
 * @param config - Configuration for the field.
 *
 * @returns An image field model.
 */
export const image = <ThumbnailNames extends string = string>(
	config?: ImageFieldConfig<ThumbnailNames>,
): CustomTypeModelImageField<ThumbnailNames> => {
	return {
		type: CustomTypeModelFieldType.Image,
		config: {
			label: config?.label ?? null,
			constraint: config?.constraint,
			thumbnails: config?.thumbnails,
		},
	}
}
