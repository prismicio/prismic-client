//=============================================================================
// Client - Everything you need to query data from Prismic.
//=============================================================================

// Primary Client API.
export { getRepositoryEndpoint } from "./getRepositoryEndpoint";
export { getRepositoryName } from "./getRepositoryName";
export { getGraphQLEndpoint } from "./getGraphQLEndpoint";
export { isRepositoryName } from "./isRepositoryName";
export { isRepositoryEndpoint } from "./isRepositoryEndpoint";
export { buildQueryURL } from "./buildQueryURL";
export { createClient, Client } from "./client";

// Predicates API.
export { predicate } from "./predicate";

// Custom errors used by Client.
export { PrismicError } from "./PrismicError";
export { ForbiddenError } from "./ForbiddenError";
export { ParsingError } from "./ParsingError";
export { NotFoundError } from "./NotFoundError";

// A collection of well-known cookie names shared between Prismic libraries and systems.
export * as cookie from "./cookie";

// General types used throughout the project. These are made public to allow users to better type their projects.
export type { CreateClient, ClientConfig } from "./client";
export type { QueryParams, BuildQueryURLArgs } from "./buildQueryURL";
export type {
	AbortSignalLike,
	FetchLike,
	HttpRequestLike,
	Ordering,
	RequestInitLike,
	ResponseLike,
	Route,
} from "./types/client";

//=============================================================================
// Helpers - Everything you need to template Prismic data.
//=============================================================================

// Primary Helpers API.
export { asDate } from "./helpers/asDate";
export { asLink } from "./helpers/asLink";
export { asText } from "./helpers/asText";
export { asHTML } from "./helpers/asHTML";
export { asImageSrc } from "./helpers/asImageSrc";
export { asImageWidthSrcSet } from "./helpers/asImageWidthSrcSet";
export { asImagePixelDensitySrcSet } from "./helpers/asImagePixelDensitySrcSet";
export * as isFilled from "./helpers/isFilled";

// Conversion helper.
export { documentToLinkField } from "./helpers/documentToLinkField";

// RichText element types.
export { Element } from "@prismicio/richtext";

export type {
	LinkResolverFunction,
	HTMLFunctionSerializer,
	HTMLMapSerializer,
} from "./types/helpers";

//=============================================================================
// Value - Types representing Prismic document and field values.
//=============================================================================

export { RichTextNodeType } from "./types/value/richText";
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

export type { IntegrationFields } from "./types/value/integrationFields";

export type { GroupField } from "./types/value/group";

export type { SliceZone } from "./types/value/sliceZone";
export type { Slice } from "./types/value/slice";
export type { SharedSlice } from "./types/value/sharedSlice";
export type { SharedSliceVariation } from "./types/value/sharedSliceVariation";

export type { FieldState, AnyRegularField } from "./types/value/types";

//=============================================================================
// Model - Types representing Prismic Custom Type and Shared Slice models.
//=============================================================================

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

export type { CustomTypeModelIntegrationFieldsField } from "./types/model/integrationFields";
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

//=============================================================================
// API - Types representing Prismic Rest API V2 responses.
//=============================================================================

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

//=============================================================================
// Webhook - Types representing Prismic webhooks.
//=============================================================================

export { WebhookType } from "./types/webhook/types";

export type { WebhookBody } from "./types/webhook/types";

export type { WebhookBodyAPIUpdate } from "./types/webhook/apiUpdate";

export type { WebhookBodyTestTrigger } from "./types/webhook/testTrigger";
