/**
 * Infrastructure as Code (IaC) factories for Prismic models.
 *
 * Provides type-safe factory functions to programmatically create
 * Custom Types and Shared Slices.
 *
 * @example
 *
 * ```ts
 * import { model } from "@prismicio/client/iac"
 *
 * const blogPost = model.customType({
 *   id: "blog_post",
 *   label: "Blog Post",
 *   repeatable: true,
 *   json: {
 *     Main: {
 *       uid: model.uid({ label: "UID" }),
 *       title: model.richText({ label: "Title", single: "heading1" }),
 *       body: model.sliceZone({
 *         choices: {
 *           hero: { type: "SharedSlice" }
 *         }
 *       })
 *     }
 *   }
 * })
 * ```
 */

// Field factories
import { boolean } from "./fields/boolean"
import { color } from "./fields/color"
import { date } from "./fields/date"
import { timestamp } from "./fields/timestamp"
import { number } from "./fields/number"
import { geoPoint } from "./fields/geoPoint"
import { embed } from "./fields/embed"
import { table } from "./fields/table"
import { text } from "./fields/text"
import { richText } from "./fields/richText"
import { image } from "./fields/image"
import { linkToMedia } from "./fields/linkToMedia"
import { link } from "./fields/link"
import { contentRelationship } from "./fields/contentRelationship"
import { select } from "./fields/select"
import { uid } from "./fields/uid"
import { integration } from "./fields/integration"
import { group } from "./fields/group"
import { sliceZone } from "./fields/sliceZone"

// Structure factories
import { customType } from "./customType"
import { sharedSlice } from "./sharedSlice"
import { variation } from "./variation"

/**
 * Model factory namespace.
 *
 * Contains all factory functions for creating Prismic model definitions.
 */
export const model = {
	// Simple fields
	boolean,
	color,
	date,
	timestamp,
	number,
	geoPoint,
	embed,
	table,

	// Text fields
	text,
	richText,

	// Media fields
	image,
	linkToMedia,

	// Link fields
	link,
	contentRelationship,

	// Special fields
	select,
	uid,
	integration,

	// Structural fields
	group,
	sliceZone,

	// Structure factories
	customType,
	sharedSlice,
	variation,
} as const

// Re-export types for convenience
export type { BooleanFieldConfig } from "./fields/boolean"
export type { ColorFieldConfig } from "./fields/color"
export type { DateFieldConfig } from "./fields/date"
export type { TimestampFieldConfig } from "./fields/timestamp"
export type { NumberFieldConfig } from "./fields/number"
export type { GeoPointFieldConfig } from "./fields/geoPoint"
export type { EmbedFieldConfig } from "./fields/embed"
export type { TableFieldConfig } from "./fields/table"
export type { TextFieldConfig } from "./fields/text"
export type { RichTextFieldConfig } from "./fields/richText"
export type { ImageFieldConfig } from "./fields/image"
export type { LinkToMediaFieldConfig } from "./fields/linkToMedia"
export type { LinkFieldConfig } from "./fields/link"
export type { ContentRelationshipFieldConfig } from "./fields/contentRelationship"
export type { SelectFieldConfig } from "./fields/select"
export type { UIDFieldConfig } from "./fields/uid"
export type { IntegrationFieldConfig } from "./fields/integration"
export type { GroupFieldConfig } from "./fields/group"
export type { SliceZoneFieldConfig } from "./fields/sliceZone"
export type { CustomTypeConfig } from "./customType"
export type { SharedSliceConfig } from "./sharedSlice"
export type { VariationConfig } from "./variation"
