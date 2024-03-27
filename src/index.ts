// Imports are used for deprecations.
import type { CustomTypeModelIntegrationField } from "./types/model/integration";
import type { IntegrationField } from "./types/value/integration";
import { RichTextNodeType } from "./types/value/richText";

import type {
	HTMLRichTextFunctionSerializer,
	HTMLRichTextMapSerializer,
} from "./helpers/asHTML";
import { mapSliceZone } from "./helpers/mapSliceZone";

import { filter } from "./filter";

//=============================================================================
// Client - Query content from Prismic.
//=============================================================================

// Primary Client API.
export { createClient, Client } from "./createClient";

// API endpoint helpers.
export { getRepositoryEndpoint } from "./getRepositoryEndpoint";
export { getRepositoryName } from "./getRepositoryName";
export { getGraphQLEndpoint } from "./getGraphQLEndpoint";
export { isRepositoryName } from "./isRepositoryName";
export { isRepositoryEndpoint } from "./isRepositoryEndpoint";
export { buildQueryURL } from "./buildQueryURL";

// Toolbar helpers.
export { getToolbarSrc } from "./getToolbarSrc";

// Query filters API.
/**
 * @deprecated Renamed to `filter`
 */
// TODO: Remove when we remove support for deprecated `predicate` export.
const predicate = filter;
export { filter, predicate };

// A collection of well-known cookie names shared between Prismic libraries and systems.
export * as cookie from "./cookie";

// General types used to query content from Prismic. These are made public to allow users to better type their projects.
export type {
	AbortSignalLike,
	ClientConfig,
	CreateClient,
	FetchLike,
	HttpRequestLike,
	RequestInitLike,
	ResponseLike,
} from "./createClient";
export type {
	BuildQueryURLArgs,
	Ordering,
	QueryParams,
	Route,
} from "./buildQueryURL";

//=============================================================================
// Helpers - Manipulate content from Prismic.
//=============================================================================

// Primary Helpers API.
export { asDate } from "./helpers/asDate";
export { asLink } from "./helpers/asLink";
export { asLinkAttrs } from "./helpers/asLinkAttrs";
export { asText } from "./helpers/asText";
export { asHTML } from "./helpers/asHTML";
export { asImageSrc } from "./helpers/asImageSrc";
export { asImageWidthSrcSet } from "./helpers/asImageWidthSrcSet";
export { asImagePixelDensitySrcSet } from "./helpers/asImagePixelDensitySrcSet";
export * as isFilled from "./helpers/isFilled";

/**
 * @deprecated Renamed to `mapSliceZone`
 */
const unstable_mapSliceZone = mapSliceZone;
export { mapSliceZone, unstable_mapSliceZone };

// Conversion helper.
export { documentToLinkField } from "./helpers/documentToLinkField";

export type { LinkResolverFunction } from "./helpers/asLink";
export type { AsLinkAttrsConfig } from "./helpers/asLinkAttrs";
export type { SliceMapper } from "./helpers/mapSliceZone";

/**
 * @deprecated Renamed to `HTMLRichTextMapSerializer`
 */
type HTMLMapSerializer = HTMLRichTextMapSerializer;
/**
 * @deprecated Renamed to `HTMLRichTextFunctionSerializer`
 */
type HTMLFunctionSerializer = HTMLRichTextFunctionSerializer;
export type {
	HTMLRichTextMapSerializer,
	HTMLRichTextFunctionSerializer,
	HTMLMapSerializer,
	HTMLFunctionSerializer,
};
export type { HTMLRichTextSerializer } from "./helpers/asHTML";

//=============================================================================
// Errors - Custom errors for Prismic APIs.
//=============================================================================

export { PrismicError } from "./errors/PrismicError";
export { ForbiddenError } from "./errors/ForbiddenError";
export { NotFoundError } from "./errors/NotFoundError";
export { RefNotFoundError } from "./errors/RefNotFoundError";
export { RefExpiredError } from "./errors/RefExpiredError";
export { PreviewTokenExpiredError } from "./errors/PreviewTokenExpired";
export { ParsingError } from "./errors/ParsingError";
export { RepositoryNotFoundError } from "./errors/RepositoryNotFoundError";

//=============================================================================
// Types - Types representing Prismic content, models, and API payloads.
//=============================================================================

// Values - Types representing Prismic content.
/**
 * @deprecated Use {@link RichTextNodeType} instead.
 */
// TODO: Remove in v8.
const Element = RichTextNodeType;
export { RichTextNodeType, Element };
export { LinkType } from "./types/value/link";
export { OEmbedType } from "./types/value/embed";

export type {
	PrismicDocument,
	PrismicDocumentWithUID,
	PrismicDocumentWithoutUID,
	PrismicDocumentHeader,
	AlternateLanguage,
} from "./types/value/document";

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
} from "./types/value/richText";
export type { TitleField } from "./types/value/title";

export type {
	ImageField,
	ImageFieldImage,
	FilledImageFieldImage,
	EmptyImageFieldImage,
} from "./types/value/image";

export type {
	EmptyLinkField,
	LinkField,
	FilledLinkToWebField,
} from "./types/value/link";
export type {
	ContentRelationshipField,
	FilledContentRelationshipField,
} from "./types/value/contentRelationship";
export type {
	LinkToMediaField,
	FilledLinkToMediaField,
} from "./types/value/linkToMedia";

export type {
	OEmbedExtra,
	PhotoOEmbed,
	VideoOEmbed,
	LinkOEmbed,
	RichOEmbed,
	AnyOEmbed,
	EmbedField,
} from "./types/value/embed";

export type { BooleanField } from "./types/value/boolean";
export type { ColorField } from "./types/value/color";
export type { DateField } from "./types/value/date";
export type { KeyTextField } from "./types/value/keyText";
export type { NumberField } from "./types/value/number";
export type { SelectField } from "./types/value/select";
export type { TimestampField } from "./types/value/timestamp";
export type { GeoPointField } from "./types/value/geoPoint";

/**
 * @deprecated Renamed to `IntegrationField`
 */
// TODO: Remove when we remove support for deprecated `IntegrationFields` export.
type IntegrationFields = IntegrationField;
export { IntegrationField, IntegrationFields };

export type { GroupField } from "./types/value/group";

export type { SliceZone } from "./types/value/sliceZone";
export type { Slice } from "./types/value/slice";
export type { SharedSlice } from "./types/value/sharedSlice";
export type { SharedSliceVariation } from "./types/value/sharedSliceVariation";

export type { FieldState, AnyRegularField } from "./types/value/types";

// Models - Types representing Prismic content models.
export { CustomTypeModelFieldType } from "./types/model/types";
export { CustomTypeModelLinkSelectType } from "./types/model/link";
export { CustomTypeModelSliceType } from "./types/model/sliceZone";
export { CustomTypeModelSliceDisplay } from "./types/model/slice";

export type {
	CustomTypeModel,
	CustomTypeModelDefinition,
	CustomTypeModelTab,
} from "./types/model/customType";

export type {
	CustomTypeModelRichTextField,
	CustomTypeModelRichTextMultiField,
	CustomTypeModelRichTextSingleField,
} from "./types/model/richText";
export type { CustomTypeModelTitleField } from "./types/model/title";

export type {
	CustomTypeModelImageField,
	CustomTypeModelImageConstraint,
	CustomTypeModelImageThumbnail,
} from "./types/model/image";

export type { CustomTypeModelContentRelationshipField } from "./types/model/contentRelationship";
export type { CustomTypeModelLinkField } from "./types/model/link";
export type { CustomTypeModelLinkToMediaField } from "./types/model/linkToMedia";

export type { CustomTypeModelEmbedField } from "./types/model/embed";

export type { CustomTypeModelBooleanField } from "./types/model/boolean";
export type { CustomTypeModelColorField } from "./types/model/color";
export type { CustomTypeModelDateField } from "./types/model/date";
export type { CustomTypeModelKeyTextField } from "./types/model/keyText";
export type { CustomTypeModelNumberField } from "./types/model/number";
export type { CustomTypeModelSelectField } from "./types/model/select";
export type { CustomTypeModelTimestampField } from "./types/model/timestamp";
export type { CustomTypeModelGeoPointField } from "./types/model/geoPoint";

/**
 * @deprecated Renamed to `CustomTypeModelIntegrationField`.
 */
// TODO: Remove when we remove support for deprecated `CustomTypeModelIntegrationField` export.
type CustomTypeModelIntegrationFieldsField = CustomTypeModelIntegrationField;
export {
	CustomTypeModelIntegrationField,
	CustomTypeModelIntegrationFieldsField,
};
export type { CustomTypeModelGroupField } from "./types/model/group";
export type {
	CustomTypeModelSliceZoneField,
	CustomTypeModelSliceLabel,
	CustomTypeModelSharedSlice,
} from "./types/model/sliceZone";
export type {
	CustomTypeModelSlice,
	CustomTypeModelLegacySlice,
} from "./types/model/slice";
export type { SharedSliceModel } from "./types/model/sharedSlice";
export type { SharedSliceModelVariation } from "./types/model/sharedSliceVariation";

export type { CustomTypeModelUIDField } from "./types/model/uid";

export type { CustomTypeModelRangeField } from "./types/model/range";
export type { CustomTypeModelSeparatorField } from "./types/model/separator";

export type {
	CustomTypeModelField,
	CustomTypeModelFieldForGroup,
} from "./types/model/types";

// API - Types representing Prismic Rest API V2 responses.
export type { Query } from "./types/api/query";

export type { Ref } from "./types/api/ref";

export type { Release } from "./types/api/release";

export type {
	Repository,
	Language,
	Form,
	FormField,
} from "./types/api/repository";

export type { Tags } from "./types/api/tags";

// Webhook - Types representing Prismic webhooks.
export { WebhookType } from "./types/webhook/types";

export type { WebhookBody } from "./types/webhook/types";

export type { WebhookBodyAPIUpdate } from "./types/webhook/apiUpdate";

export type { WebhookBodyTestTrigger } from "./types/webhook/testTrigger";
