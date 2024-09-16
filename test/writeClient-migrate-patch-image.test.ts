import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import type { ImageField, MigrationImage } from "../src"

testMigrationFieldPatching<MigrationImage | ImageField>(
	"patches image fields",
	{
		new: ({ migration }) => migration.createAsset("foo", "foo.png"),
		newLongForm: ({ migration }) => {
			return {
				id: migration.createAsset("foo", "foo.png"),
			}
		},
		newThumbnails: ({ migration }) => {
			return {
				id: migration.createAsset("foo", "foo.png"),
				square: migration.createAsset("foo", "foo.png"),
			}
		},
		existing: ({ existingAssets }) => {
			const asset = existingAssets[0]

			return {
				id: asset.id,
				url: asset.url,
				dimensions: { width: asset.width!, height: asset.height! },
				edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
				alt: asset.alt || null,
				copyright: asset.credits || null,
			}
		},
	},
)

testMigrationFieldPatching<ImageField>(
	"patches image fields (from Prismic)",
	{
		simple: ({ ctx, mockedDomain }) => {
			return {
				...ctx.mock.value.image({ state: "filled" }),
				id: "foo-id",
				url: `${mockedDomain}/foo.png`,
			}
		},
		withThumbnails: ({ ctx, mockedDomain }) => {
			const image = ctx.mock.value.image({ state: "filled" })
			const id = "foo-id"

			return {
				...image,
				id,
				url: `${mockedDomain}/foo.png?some=query`,
				square: {
					...image,
					id,
					url: `${mockedDomain}/foo.png?some=other&query=params`,
				},
			}
		},
		withThumbnailsNoAlt: ({ ctx, mockedDomain }) => {
			const image = ctx.mock.value.image({ state: "filled" })
			image.alt = null
			const id = "foo-id"

			return {
				...image,
				id,
				url: `${mockedDomain}/foo.png?some=query`,
				square: {
					...image,
					id,
					url: `${mockedDomain}/foo.png?some=other&query=params`,
				},
			}
		},
		withSpecialTypeThumbnail: ({ ctx, mockedDomain }) => {
			const image = ctx.mock.value.image({ state: "filled" })
			const id = "foo-id"

			return {
				...image,
				id,
				url: `${mockedDomain}/foo.png?some=query`,
				type: {
					...image,
					id,
					url: `${mockedDomain}/foo.png?some=other&query=params`,
				},
			}
		},
		empty: ({ ctx }) => ctx.mock.value.image({ state: "empty" }),
	},
	{ mode: "fromPrismic" },
)
