import { Asset } from "./types/api/asset/asset"
import { PrismicDocument } from "./types/value/document"
import { FilledImageFieldImage } from "./types/value/image"
import { FilledLinkToMediaField } from "./types/value/linkToMedia"

/**
 * Max length for asset notes accepted by the API.
 */
const ASSET_NOTES_MAX_LENGTH = 500

/**
 * Max length for asset credits accepted by the API.
 */
const ASSET_CREDITS_MAX_LENGTH = 500

/**
 * Max length for asset alt text accepted by the API.
 */
const ASSET_ALT_MAX_LENGTH = 500

/**
 * Min length for asset tags accepted by the API.
 */
const ASSET_TAG_MIN_LENGTH = 3

/**
 * Max length for asset tags accepted by the API.
 */
const ASSET_TAG_MAX_LENGTH = 20

type MigrationAssetParams = {
	alt?: string
	notes?: string
	credits?: string
	tags?: string[]
}

export class Migration<TDocuments extends PrismicDocument = PrismicDocument> {
	assets: PrismicMigrationAsset[]
	documents: PrismicMigrationDocument[]

	createAsset(asset: Asset): PrismicMigrationAsset
	createAsset(
		field: FilledImageFieldImage | FilledLinkToMediaField,
		params?: Pick<MigrationAssetParams, "notes" | "credits" | "tags">,
	): PrismicMigrationAsset
	createAsset(file: File, params?: MigrationAssetParams): PrismicMigrationAsset
	createAsset(
		file: URL | NonNullable<ConstructorParameters<typeof File>[0]>[0],
		params: { filename: string } & MigrationAssetParams,
	): PrismicMigrationAsset
	createAsset(
		source: PrismicMigrationAssetSource,
		params: { filename?: string } & MigrationAssetParams = {},
	): PrismicMigrationAsset {
		validateAssetParams(params)

		let filename: string | undefined
		if (params?.filename) {
			filename = params.filename
		} else if (typeof source === "object" && "filename" in source) {
			filename = source.filename
		} else if (source instanceof URL) {
			filename = source.pathname.split("/").at(-1)
		} else if (source instanceof File) {
			filename = source.name
		} else if (typeof source === "object" && "url" in source) {
			if ("name" in source) {
				filename = source.name
			} else {
				filename = new URL(source.url).pathname
					.split("/")
					.at(-1)
					?.split("_")
					.at(-1)
			}
		}
		if (!filename) throw new Error(`Missing asset filename: ${source}`)

		const asset = new PrismicMigrationAsset(source, filename, params)

		this.assets.push(asset)

		return asset
	}
}

type PrismicMigrationAssetSource =
	| Asset
	| FilledImageFieldImage
	| FilledLinkToMediaField
	| File
	| NonNullable<ConstructorParameters<typeof File>[0]>[0]
	| URL

class PrismicMigrationAsset {
	source: PrismicMigrationAssetSource
	filename: string
	params: MigrationAssetParams
	asset?: Asset

	constructor(
		source: PrismicMigrationAssetSource,
		filename: string,
		params: MigrationAssetParams,
	) {
		this.source = source
		this.filename = filename
		this.params = params
	}
}

class PrismicMigrationDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> {}

function validateAssetParams(params: MigrationAssetParams) {
	const { alt, notes, credits, tags } = params
	const errors: string[] = []

	if (notes && notes.length > ASSET_NOTES_MAX_LENGTH)
		errors.push(
			`\`notes\` must be at most ${ASSET_NOTES_MAX_LENGTH} characters`,
		)

	if (credits && credits.length > ASSET_CREDITS_MAX_LENGTH)
		errors.push(
			`\`credits\` must be at most ${ASSET_CREDITS_MAX_LENGTH} characters`,
		)

	if (alt && alt.length > ASSET_ALT_MAX_LENGTH)
		errors.push(`\`alt\` must be at most ${ASSET_ALT_MAX_LENGTH} characters`)

	if (
		tags &&
		tags.length &&
		tags.some(
			(tag) =>
				tag.length < ASSET_TAG_MIN_LENGTH || tag.length > ASSET_TAG_MAX_LENGTH,
		)
	)
		errors.push(
			`tags must be at least 3 characters long and 20 characters at most`,
		)

	if (errors.length)
		throw new Error(`Errors validating asset metadata: ${errors.join(", ")}`)
}
