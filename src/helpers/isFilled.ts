import type { ColorField } from "../types/value/color";
import type { ContentRelationshipField } from "../types/value/contentRelationship";
import type { DateField } from "../types/value/date";
import type { AnyOEmbed, EmbedField } from "../types/value/embed";
import type { GeoPointField } from "../types/value/geoPoint";
import type { GroupField } from "../types/value/group";
import type { ImageField, ImageFieldImage } from "../types/value/image";
import type { IntegrationField } from "../types/value/integration";
import type { KeyTextField } from "../types/value/keyText";
import type { LinkField } from "../types/value/link";
import type { LinkToMediaField } from "../types/value/linkToMedia";
import type { NumberField } from "../types/value/number";
import type { RichTextField } from "../types/value/richText";
import type { SelectField } from "../types/value/select";
import type { SharedSlice } from "../types/value/sharedSlice";
import type { Slice } from "../types/value/slice";
import type { SliceZone } from "../types/value/sliceZone";
import type { TimestampField } from "../types/value/timestamp";
import type { TitleField } from "../types/value/title";
import type { AnyRegularField } from "../types/value/types";

/**
 * Determines if a value is not nullish (i.e. not `null` or `undefined`). This
 * is used to check if nullable field values are filled.
 *
 * @param input - The value to check.
 *
 * @returns `true` if `input` is not nullish, `false` otherwise.
 */
const isNonNullish = <T>(input: T): input is NonNullable<T> => {
	return input != null;
};

/**
 * Determines if an array is not empty. This is used to check if array-based
 * fields are filled.
 *
 * @param input - The array to check.
 *
 * @returns `true` if `input` has at least one element, `false` otherwise.
 */
const isNonEmptyArray = <T>(input: T[]): input is [T, ...T[]] => {
	return !!input.length;
};

/**
 * Determines if a rich text field is filled.
 *
 * @param field - rich text field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const richText = (
	field: RichTextField | null | undefined,
): field is RichTextField<"filled"> => {
	if (!isNonNullish(field)) {
		return false;
	} else if (field.length === 1 && "text" in field[0]) {
		return !!field[0].text;
	} else {
		return !!field.length;
	}
};

/**
 * Determines if a title field is filled.
 *
 * @param field - Title field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const title = richText as (
	field: TitleField | null | undefined,
) => field is TitleField<"filled">;

/**
 * Determines if an Image thumbnail is filled.
 *
 * @param thumbnail - Image thumbnail to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const imageThumbnail = (
	thumbnail: ImageFieldImage | null | undefined,
): thumbnail is ImageFieldImage<"filled"> => {
	return isNonNullish(thumbnail) && !!thumbnail.url;
};

/**
 * Determines if an image field is filled.
 *
 * @param field - Image field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const image = imageThumbnail as <
	ThumbnailNames extends string | null = never,
>(
	field: ImageField<ThumbnailNames> | null | undefined,
) => field is ImageField<ThumbnailNames, "filled">;

/**
 * Determines if a link field is filled.
 *
 * @param field - Link field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const link = <
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
>(
	field: LinkField<TypeEnum, LangEnum, DataInterface> | null | undefined,
): field is LinkField<TypeEnum, LangEnum, DataInterface, "filled"> => {
	return isNonNullish(field) && ("id" in field || "url" in field);
};

/**
 * Determines if a link to media field is filled.
 *
 * @param field - Link to media field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const linkToMedia = link as (
	field: LinkToMediaField | null | undefined,
) => field is LinkToMediaField<"filled">;

/**
 * Determines if a content relationship field is filled.
 *
 * @param field - Content Relationship field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const contentRelationship = link as <
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
>(
	field:
		| ContentRelationshipField<TypeEnum, LangEnum, DataInterface>
		| null
		| undefined,
) => field is ContentRelationshipField<
	TypeEnum,
	LangEnum,
	DataInterface,
	"filled"
>;

/**
 * Determines if a date field is filled.
 *
 * @param field - Date field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const date = isNonNullish as (
	field: DateField | null | undefined,
) => field is DateField<"filled">;

/**
 * Determines if a timestamp field is filled.
 *
 * @param field - Timestamp field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const timestamp = isNonNullish as (
	field: TimestampField | null | undefined,
) => field is TimestampField<"filled">;

/**
 * Determines if a color field is filled.
 *
 * @param field - Color field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const color = isNonNullish as (
	field: ColorField | null | undefined,
) => field is ColorField<"filled">;

/**
 * Determines if a number field is filled.
 *
 * @param field - Number field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const number = isNonNullish as (
	field: NumberField | null | undefined,
) => field is NumberField<"filled">;

/**
 * Determines if a key text field is filled.
 *
 * @param field - Key Text field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const keyText = (
	field: KeyTextField | null | undefined,
): field is KeyTextField<"filled"> => {
	return isNonNullish(keyText) && !!field;
};

/**
 * Determines if a select field is filled.
 *
 * @param field - Select field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const select = isNonNullish as <Enum extends string>(
	field: SelectField<Enum> | null | undefined,
) => field is SelectField<Enum, "filled">;

/**
 * Determines if an embed field is filled.
 *
 * @param field - Embed field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const embed = <Field extends EmbedField<AnyOEmbed>>(
	field: Field | null | undefined,
): field is Extract<Field, EmbedField<AnyOEmbed, "filled">> => {
	return isNonNullish(field) && !!field.embed_url;
};

/**
 * Determines if a geopoint field is filled.
 *
 * @param field - GeoPoint field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const geoPoint = (
	field: GeoPointField | null | undefined,
): field is GeoPointField<"filled"> => {
	return isNonNullish(field) && "longitude" in field;
};

/**
 * Determines if an integration field is filled.
 *
 * @param field - Integration field to check.
 *
 * @returns `true` if `field` is filled, `false` otherwise.
 */
export const integrationField = isNonNullish as <
	Data extends Record<string, unknown>,
>(
	field: IntegrationField<Data> | null | undefined,
) => field is IntegrationField<Data, "filled">;
/**
 * @deprecated Renamed to `integrationField`.
 */
// TODO: Remove when we remove support for deprecated `integrationFields` export.
export const integrationFields = integrationField;

/**
 * Determines if a Group has at least one item.
 *
 * @param group - Group to check.
 *
 * @returns `true` if `group` contains at least one item, `false` otherwise.
 */
export const group = <Fields extends Record<string, AnyRegularField>>(
	group: GroupField<Fields> | null | undefined,
): group is GroupField<Fields, "filled"> => {
	return isNonNullish(group) && isNonEmptyArray(group);
};

/**
 * Determines if a Slice Zone has at least one Slice.
 *
 * @param slices - Slice Zone to check.
 *
 * @returns `true` if `slices` contains at least one Slice, `false` otherwise.
 */
export const sliceZone = <Slices extends Slice | SharedSlice>(
	slices: SliceZone<Slices> | null | undefined,
): slices is SliceZone<Slices, "filled"> => {
	return isNonNullish(slices) && isNonEmptyArray(slices);
};
