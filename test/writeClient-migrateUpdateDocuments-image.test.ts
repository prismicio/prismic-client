import { testMigrationFieldPatching } from "./__testutils__/testMigrationFieldPatching"

import { RichTextNodeType } from "../src"

testMigrationFieldPatching("patches image fields", {
	new: ({ migration }) => migration.createAsset("foo", "foo.png"),
	existing: ({ migration, existingAssets }) =>
		migration.createAsset(existingAssets[0]),
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
	otherRepositoryEmpty: ({ ctx }) => ctx.mock.value.image({ state: "empty" }),
	richTextNew: ({ ctx, migration }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		migration.createAsset("foo", "foo.png"),
	],
	richTextExisting: ({ ctx, migration, existingAssets }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		migration.createAsset(existingAssets[0]),
	],
	richTextOtherRepository: ({ ctx, mockedDomain }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		{
			type: RichTextNodeType.image,
			...ctx.mock.value.image({ state: "filled" }),
			id: "foo-id",
			url: `${mockedDomain}/foo.png`,
		},
	],
})
