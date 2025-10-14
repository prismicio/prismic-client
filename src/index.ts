// Imports are used for deprecations.
import type { CustomTypeModelIntegrationField } from "./types/model/integration.ts"
import type { IntegrationField } from "./types/value/integration.ts"
import { RichTextNodeType } from "./types/value/richText.ts"

import type {
	HTMLRichTextFunctionSerializer,
	HTMLRichTextMapSerializer,
} from "./helpers/asHTML"
import { mapSliceZone } from "./helpers/mapSliceZone.ts"

import { filter } from "./filter.ts"

//=============================================================================
// Client - Query content from Prismic.
//=============================================================================

// Primary Client API.
export { createClient } from "./createClient.ts"
export { Client } from "./Client.ts"

// Write Client API.
export { createWriteClient } from "./createWriteClient.ts"
export { WriteClient } from "./WriteClient.ts"

// Migration helper.
export { createMigration } from "./createMigration.ts"
export { Migration } from "./Migration.ts"

// API endpoint helpers.
export { getRepositoryEndpoint } from "./getRepositoryEndpoint.ts"
export { getRepositoryName } from "./getRepositoryName.ts"
export { getGraphQLEndpoint } from "./getGraphQLEndpoint.ts"
export { isRepositoryName } from "./isRepositoryName.ts"
export { isRepositoryEndpoint } from "./isRepositoryEndpoint.ts"
export { buildQueryURL } from "./buildQueryURL.ts"

// Toolbar helpers.
export { getToolbarSrc } from "./getToolbarSrc.ts"

// Query filters API.
/**
 * @deprecated Renamed to `filter`
 */
// TODO: Remove when we remove support for deprecated `predicate` export.
const predicate = filter
export { filter, predicate }

// A collection of well-known cookie names shared between Prismic libraries and systems.
export * as cookie from "./cookie.ts"

// General types used to query content from Prismic. These are made public to allow users to better type their projects.
export type { CreateClient } from "./createClient.ts"
export type { ClientConfig, HttpRequestLike } from "./Client.ts"
export type { CreateWriteClient } from "./createWriteClient.ts"
export type { WriteClientConfig, MigrateReporterEvents } from "./WriteClient.ts"
export type {
	BuildQueryURLArgs,
	Ordering,
	QueryParams,
	Route,
} from "./buildQueryURL.ts"
export type { CreateMigration } from "./createMigration.ts"
export type {
	AbortSignalLike,
	FetchLike,
	RequestInitLike,
	ResponseLike,
} from "./lib/request.ts"

//=============================================================================
// Helpers - Manipulate content from Prismic.
//=============================================================================

// Primary Helpers API.
export { asDate } from "./helpers/asDate.ts"
export { asLink } from "./helpers/asLink.ts"
export { asLinkAttrs } from "./helpers/asLinkAttrs.ts"
export { asText } from "./helpers/asText.ts"
export { asHTML } from "./helpers/asHTML.ts"
export { asImageSrc } from "./helpers/asImageSrc.ts"
export { asImageWidthSrcSet } from "./helpers/asImageWidthSrcSet.ts"
export { asImagePixelDensitySrcSet } from "./helpers/asImagePixelDensitySrcSet.ts"
export * as isFilled from "./helpers/isFilled.ts"

/**
 * @deprecated Renamed to `mapSliceZone`
 */
const unstable_mapSliceZone = mapSliceZone
export { mapSliceZone, unstable_mapSliceZone }

// Conversion helper.
export { documentToLinkField } from "./helpers/documentToLinkField.ts"

export type { LinkResolverFunction } from "./helpers/asLink.ts"
export type { AsLinkAttrsConfig } from "./helpers/asLinkAttrs.ts"
export type { SliceMapper } from "./helpers/mapSliceZone.ts"

/**
 * @deprecated Renamed to `HTMLRichTextMapSerializer`
 */
type HTMLMapSerializer = HTMLRichTextMapSerializer
/**
 * @deprecated Renamed to `HTMLRichTextFunctionSerializer`
 */
type HTMLFunctionSerializer = HTMLRichTextFunctionSerializer
export type {
	HTMLRichTextMapSerializer,
	HTMLRichTextFunctionSerializer,
	HTMLMapSerializer,
	HTMLFunctionSerializer,
}
export type { HTMLRichTextSerializer } from "./helpers/asHTML.ts"

//=============================================================================
// Errors - Custom errors for Prismic APIs.
//=============================================================================

// Client Errors
export { PrismicError } from "./errors/PrismicError.ts"
export { ForbiddenError } from "./errors/ForbiddenError.ts"
export { NotFoundError } from "./errors/NotFoundError.ts"
export { RefNotFoundError } from "./errors/RefNotFoundError.ts"
export { RefExpiredError } from "./errors/RefExpiredError.ts"
export { PreviewTokenExpiredError } from "./errors/PreviewTokenExpired.ts"
export { ParsingError } from "./errors/ParsingError.ts"
export { RepositoryNotFoundError } from "./errors/RepositoryNotFoundError.ts"

//=============================================================================
// Types - Types representing Prismic content, models, and API payloads.
//=============================================================================

// Values - Types representing Prismic content.
/**
 * @deprecated Use {@link RichTextNodeType} instead.
 */
// TODO: Remove in v8.
const Element = RichTextNodeType
export { RichTextNodeType, Element }
export { LinkType } from "./types/value/link.ts"
export { OEmbedType } from "./types/value/embed.ts"

export type {
	PrismicDocument,
	PrismicDocumentWithUID,
	PrismicDocumentWithoutUID,
	PrismicDocumentHeader,
	AlternateLanguage,
} from "./types/value/document.ts"

export type {
	// RichText & Title
	RichTextField,
	// RichText & Title (block nodes)
	RTTextNodeBase,
	RTHeading1Node,
	RTHeading2Node,
	RTHeading3Node,
	RTHeading4Node,
	RTHeading5Node,
	RTHeading6Node,
	RTParagraphNode,
	RTPreformattedNode,
	RTListItemNode,
	RTOListItemNode,
	// RichText & Title (span nodes)
	RTSpanNodeBase,
	RTStrongNode,
	RTEmNode,
	RTLabelNode,
	// RichText & Title (media nodes)
	RTImageNode,
	RTEmbedNode,
	// RichText & Title (link nodes)
	RTLinkNode,
	// RichText & Title (serialization related nodes)
	RTListNode,
	RTOListNode,
	RTSpanNode,
	// RichText & Title (helpers)
	RTNode,
	RTTextNode,
	RTBlockNode,
	RTInlineNode,
	RTAnyNode,
	RichTextNodeTypes,
} from "./types/value/richText.ts"
export type { TitleField } from "./types/value/title.ts"

export type {
	ImageField,
	ImageFieldImage,
	FilledImageFieldImage,
	EmptyImageFieldImage,
} from "./types/value/image.ts"

export type {
	EmptyLinkField,
	LinkField,
	FilledLinkToWebField,
} from "./types/value/link.ts"
export type {
	ContentRelationshipField,
	FilledContentRelationshipField,
} from "./types/value/contentRelationship.ts"
export type {
	LinkToMediaField,
	FilledLinkToMediaField,
} from "./types/value/linkToMedia.ts"

export type {
	OEmbedExtra,
	PhotoOEmbed,
	VideoOEmbed,
	LinkOEmbed,
	RichOEmbed,
	AnyOEmbed,
	EmbedField,
} from "./types/value/embed.ts"

export type {
	TableField,
	TableFieldHead,
	TableFieldHeadRow,
	TableFieldBody,
	TableFieldBodyRow,
	TableFieldHeaderCell,
	TableFieldDataCell,
} from "./types/value/table.ts"

export type { BooleanField } from "./types/value/boolean.ts"
export type { ColorField } from "./types/value/color.ts"
export type { DateField } from "./types/value/date.ts"
export type { KeyTextField } from "./types/value/keyText.ts"
export type { NumberField } from "./types/value/number.ts"
export type { SelectField } from "./types/value/select.ts"
export type { TimestampField } from "./types/value/timestamp.ts"
export type { GeoPointField } from "./types/value/geoPoint.ts"

/**
 * @deprecated Renamed to `IntegrationField`
 */
// TODO: Remove when we remove support for deprecated `IntegrationFields` export.
type IntegrationFields = IntegrationField
export type { IntegrationField, IntegrationFields }
export type { IntegrationFieldData } from "./types/value/integration.ts"

export type { GroupField, NestedGroupField } from "./types/value/group.ts"

export type { SliceZone } from "./types/value/sliceZone.ts"
export type { Slice } from "./types/value/slice.ts"
export type { SharedSlice } from "./types/value/sharedSlice.ts"
export type { SharedSliceVariation } from "./types/value/sharedSliceVariation.ts"

export type {
	FieldState,
	AnyRegularField,
	AnySlicePrimaryField,
	Repeatable,
} from "./types/value/types.ts"

// Models - Types representing Prismic content models.
export { CustomTypeModelFieldType } from "./types/model/types.ts"
export { CustomTypeModelLinkSelectType } from "./types/model/link.ts"
export { CustomTypeModelSliceType } from "./types/model/sliceZone.ts"
export { CustomTypeModelSliceDisplay } from "./types/model/slice.ts"

export type {
	CustomTypeModel,
	CustomTypeModelDefinition,
	CustomTypeModelTab,
} from "./types/model/customType"

export type {
	CustomTypeModelRichTextField,
	CustomTypeModelRichTextMultiField,
	CustomTypeModelRichTextSingleField,
} from "./types/model/richText.ts"
export type { CustomTypeModelTitleField } from "./types/model/title.ts"

export type {
	CustomTypeModelImageField,
	CustomTypeModelImageConstraint,
	CustomTypeModelImageThumbnail,
} from "./types/model/image.ts"

export type {
	CustomTypeModelFetchCustomTypeLevel1,
	CustomTypeModelFetchContentRelationshipLevel1,
	CustomTypeModelFetchGroupLevel1,
	CustomTypeModelFetchCustomTypeLevel2,
	CustomTypeModelFetchGroupLevel2,
	CustomTypeModelContentRelationshipField,
} from "./types/model/contentRelationship.ts"
export type { CustomTypeModelLinkField } from "./types/model/link.ts"
export type { CustomTypeModelLinkToMediaField } from "./types/model/linkToMedia.ts"

export type { CustomTypeModelEmbedField } from "./types/model/embed.ts"

export type { CustomTypeModelBooleanField } from "./types/model/boolean.ts"
export type { CustomTypeModelColorField } from "./types/model/color.ts"
export type { CustomTypeModelDateField } from "./types/model/date.ts"
export type { CustomTypeModelKeyTextField } from "./types/model/keyText.ts"
export type { CustomTypeModelNumberField } from "./types/model/number.ts"
export type { CustomTypeModelSelectField } from "./types/model/select.ts"
export type { CustomTypeModelTimestampField } from "./types/model/timestamp.ts"
export type { CustomTypeModelGeoPointField } from "./types/model/geoPoint.ts"
export type { CustomTypeModelTableField } from "./types/model/table.ts"

/**
 * @deprecated Renamed to `CustomTypeModelIntegrationField`.
 */
// TODO: Remove when we remove support for deprecated `CustomTypeModelIntegrationField` export.
type CustomTypeModelIntegrationFieldsField = CustomTypeModelIntegrationField
export {
	CustomTypeModelIntegrationField,
	CustomTypeModelIntegrationFieldsField,
}
export type {
	CustomTypeModelGroupField,
	CustomTypeModelNestedGroupField,
} from "./types/model/group.ts"
export type {
	CustomTypeModelSliceZoneField,
	CustomTypeModelSliceLabel,
	CustomTypeModelSharedSlice,
} from "./types/model/sliceZone.ts"
export type {
	CustomTypeModelSlice,
	CustomTypeModelLegacySlice,
} from "./types/model/slice.ts"
export type { SharedSliceModel } from "./types/model/sharedSlice.ts"
export type { SharedSliceModelVariation } from "./types/model/sharedSliceVariation.ts"

export type { CustomTypeModelUIDField } from "./types/model/uid.ts"

export type { CustomTypeModelRangeField } from "./types/model/range.ts"
export type { CustomTypeModelSeparatorField } from "./types/model/separator.ts"

export type {
	CustomTypeModelField,
	CustomTypeModelFieldForGroup,
	CustomTypeModelFieldForNestedGroup,
	CustomTypeModelFieldForSlicePrimary,
} from "./types/model/types.ts"

// Migrations - Types representing Prismic Migration API content values.
export { PrismicMigrationDocument } from "./types/migration/Document.ts"
export type {
	PendingPrismicDocument,
	ExistingPrismicDocument,
	InjectMigrationSpecificTypes,
} from "./types/migration/Document.ts"

export { PrismicMigrationAsset } from "./types/migration/Asset.ts"
export type {
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "./types/migration/Asset.ts"
export type { MigrationContentRelationship } from "./types/migration/ContentRelationship.ts"

// API - Types representing Prismic Content API responses.
export type { Query } from "./types/api/query.ts"

export type { Ref } from "./types/api/ref.ts"

export type { Release } from "./types/api/release.ts"

export type {
	Repository,
	Language,
	Form,
	FormField,
} from "./types/api/repository.ts"

export type { Tags } from "./types/api/tags.ts"

// Integration - Types representing Prismic's integration API.
export {
	IntegrationAPIItem,
	IntegrationAPIResults,
} from "./types/api/integration.ts"

// Webhook - Types representing Prismic webhooks.
export { WebhookType } from "./types/webhook/types.ts"

export type { WebhookBody } from "./types/webhook/types.ts"

export type { WebhookBodyAPIUpdate } from "./types/webhook/apiUpdate.ts"

export type { WebhookBodyTestTrigger } from "./types/webhook/testTrigger.ts"
