import type { CustomTypeModelFieldType } from "./types";

/**
 * A GeoPoint Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/geopoint}
 */
export interface CustomTypeModelGeoPointField {
	type: typeof CustomTypeModelFieldType.GeoPoint;
	config?: {
		label?: string | null;
	};
}
