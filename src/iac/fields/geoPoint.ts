import type { CustomTypeModelGeoPointField } from "../../types/model/geoPoint"
import { CustomTypeModelFieldType } from "../../types/model/types"

/**
 * Configuration for a geo point field.
 */
export interface GeoPointFieldConfig {
	label?: string | null
}

/**
 * Creates a geo point field model.
 *
 * @example
 *
 * ```ts
 * model.geoPoint({ label: "Location" })
 * ```
 *
 * @param config - Configuration for the field.
 *
 * @returns A geo point field model.
 */
export const geoPoint = (
	config?: GeoPointFieldConfig,
): CustomTypeModelGeoPointField => {
	return {
		type: CustomTypeModelFieldType.GeoPoint,
		config: {
			label: config?.label ?? null,
		},
	}
}
