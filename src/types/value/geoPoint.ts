import type { EmptyObjectField, FieldState } from "./types";

/**
 * A geopoint field.
 *
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/geopoint}
 */
export type GeoPointField<State extends FieldState = FieldState> =
	State extends "empty"
		? EmptyObjectField
		: {
				latitude: number;
				longitude: number;
		  };
