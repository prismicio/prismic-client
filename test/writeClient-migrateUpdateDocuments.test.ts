import {
	testMigrationImageFieldPatching,
	testMigrationLinkFieldPatching,
	testMigrationSimpleFieldPatching,
} from "./__testutils__/testMigrationFieldPatching"

testMigrationSimpleFieldPatching("does not patch simple fields", {
	embed: ({ ctx }) => ctx.mock.value.embed({ state: "filled" }),
	date: ({ ctx }) => ctx.mock.value.date({ state: "filled" }),
	timestamp: ({ ctx }) => ctx.mock.value.timestamp({ state: "filled" }),
	color: ({ ctx }) => ctx.mock.value.color({ state: "filled" }),
	number: ({ ctx }) => ctx.mock.value.number({ state: "filled" }),
	keyText: ({ ctx }) => ctx.mock.value.keyText({ state: "filled" }),
	select: ({ ctx }) =>
		ctx.mock.value.select({
			model: ctx.mock.model.select({ options: ["foo", "bar"] }),
			state: "filled",
		}),
	boolean: ({ ctx }) => ctx.mock.value.boolean(),
	geoPoint: ({ ctx }) => ctx.mock.value.geoPoint({ state: "filled" }),
	integration: ({ ctx }) => ctx.mock.value.integration({ state: "filled" }),
	linkToWeb: ({ ctx }) =>
		ctx.mock.value.link({ type: "Web", withTargetBlank: true }),
})

testMigrationImageFieldPatching("patches image fields", {
	regular: ({ migration }) => migration.createAsset("foo", "foo.png"),
	richText: ({ ctx, migration }) => [
		...ctx.mock.value.richText({ pattern: "short", state: "filled" }),
		migration.createAsset("foo", "foo.png"),
	],
})

testMigrationLinkFieldPatching("patches link fields", {
	existingDocument: ({ existingDocuments }) => existingDocuments[0],
	migrationDocument:
		({ migration, migrationDocuments }) =>
		() =>
			migration.getByUID(migrationDocuments[0].type, migrationDocuments[0].uid),
	otherRepositoryContentRelationship: ({ ctx, existingDocuments }) => {
		const contentRelationship = ctx.mock.value.link({ type: "Document" })
		contentRelationship.id = existingDocuments[0].id

		return contentRelationship
	},
})
