import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { assetToImage } from "../src/types/migration/Asset"

testMigrationFieldPatching("patches image fields", {
	new: ({ migration }) => migration.createAsset("foo", "foo.png"),
	existing: ({ existingAssets }) => assetToImage(existingAssets[0]),
})

testMigrationFieldPatching(
	"patches image fields",
	{
		otherRepository: ({ ctx, mockedDomain }) => {
			return {
				...ctx.mock.value.image({ state: "filled" }),
				id: "foo-id",
				url: `${mockedDomain}/foo.png`,
			}
		},
		otherRepositoryWithThumbnails: ({ ctx, mockedDomain }) => {
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
		otherRepositoryWithThumbnailsNoAlt: ({ ctx, mockedDomain }) => {
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
		otherRepositoryWithTypeThumbnail: ({ ctx, mockedDomain }) => {
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
		otherRepositoryEmpty: ({ ctx }) => ctx.mock.value.image({ state: "empty" }),
	},
	{ mode: "fromPrismic" },
)
