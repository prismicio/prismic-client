import type { RichTextField } from "./richText";
import type { TitleField } from "./title";
import type { ImageField } from "./image";
import type { ContentRelationshipField } from "./contentRelationship";
import type { LinkField } from "./link";
import type { LinkToMediaField } from "./linkToMedia";
import type { EmbedField } from "./embed";

import type { BooleanField } from "./boolean";
import type { ColorField } from "./color";
import type { DateField } from "./date";
import type { KeyTextField } from "./keyText";
import type { NumberField } from "./number";
import type { SelectField } from "./select";
import type { TimestampField } from "./timestamp";
import type { GeoPointField } from "./geoPoint";

import type { IntegrationFields } from "./integrationFields";

/**
 * Empty state for object-shaped fields.
 */
export type EmptyObjectField = Record<string, never>;

/**
 * Valid states for fields. Not all fields use this type (e.g. BooleanField).
 */
export type FieldState = "empty" | "filled";

/**
 * Any regular field that can be nested in a group-like field.
 */
export type AnyRegularField =
	| TitleField
	| RichTextField
	| ImageField
	| ContentRelationshipField
	| LinkField
	| LinkToMediaField
	| EmbedField
	| DateField
	| TimestampField
	| ColorField
	| NumberField
	| KeyTextField
	| SelectField
	| BooleanField
	| GeoPointField
	| IntegrationFields;

/**
 * Useful to flatten the type output to improve type hints shown in editors. And
 * also to transform an interface into a type to aide with assignability.
 *
 * Taken from the `type-fest` package.
 *
 * @typeParam T - The type to simplify.
 * @see https://github.com/sindresorhus/type-fest/blob/cbd7ec510bd136ac045bbc74e391ee686b8a9a2f/source/simplify.d.ts
 */
export type Simplify<T> = { [P in keyof T]: T[P] };
