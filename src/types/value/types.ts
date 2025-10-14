import type { BooleanField } from "./boolean.ts"
import type { ColorField } from "./color.ts"
import type { ContentRelationshipField } from "./contentRelationship.ts"
import type { DateField } from "./date.ts"
import type { EmbedField } from "./embed.ts"
import type { GeoPointField } from "./geoPoint.ts"
import type { GroupField } from "./group.ts"
import type { ImageField } from "./image.ts"
import type { IntegrationField } from "./integration.ts"
import type { KeyTextField } from "./keyText.ts"
import type { LinkField } from "./link.ts"
import type { LinkToMediaField } from "./linkToMedia.ts"
import type { NumberField } from "./number.ts"
import type { RichTextField } from "./richText.ts"
import type { SelectField } from "./select.ts"
import type { TableField } from "./table.ts"
import type { TimestampField } from "./timestamp.ts"
import type { TitleField } from "./title.ts"

/**
 * Empty state for object-shaped fields.
 */
export type EmptyObjectField = Record<string, never>

/**
 * Valid states for fields. Not all fields use this type (e.g. BooleanField).
 */
export type FieldState = "empty" | "filled"

/**
 * Any regular field that can be nested in a group-like field.
 */
export type AnyRegularField =
	| TitleField
	| RichTextField
	| ImageField
	| ContentRelationshipField
	| LinkField
	| Repeatable<LinkField>
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
	| IntegrationField
	| TableField

/**
 * Any field that can be used in a slice's primary section.
 */
export type AnySlicePrimaryField = GroupField | AnyRegularField

/**
 * A list of repeatable fields.
 */
export type Repeatable<
	Field extends LinkField,
	State extends FieldState = FieldState,
> = State extends "empty" ? [] : [WithKey<Field>, ...WithKey<Field>[]]

/**
 * Wrapper to add a key to a field when inside a repeatable.
 */
type WithKey<Field extends LinkField> = Field & { key: string }

/**
 * Useful to flatten the type output to improve type hints shown in editors. And
 * also to transform an interface into a type to aide with assignability.
 *
 * Taken from the `type-fest` package.
 *
 * @typeParam T - The type to simplify.
 *
 * @see https://github.com/sindresorhus/type-fest/blob/cbd7ec510bd136ac045bbc74e391ee686b8a9a2f/source/simplify.d.ts
 */
export type Simplify<T> = { [P in keyof T]: T[P] }
