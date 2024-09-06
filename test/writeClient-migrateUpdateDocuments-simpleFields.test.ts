import { testMigrationSimpleFieldPatching } from "./__testutils__/testMigrationFieldPatching"

testMigrationSimpleFieldPatching("does not patch simple fields", {
	embed: ({ ctx }) => ctx.mock.value.embed({ state: "filled" }),
	date: ({ ctx }) => ctx.mock.value.date({ state: "filled" }),
	timestamp: ({ ctx }) => ctx.mock.value.timestamp({ state: "filled" }),
	color: ({ ctx }) => ctx.mock.value.color({ state: "filled" }),
	number: ({ ctx }) => ctx.mock.value.number({ state: "filled" }),
	keyText: ({ ctx }) => ctx.mock.value.keyText({ state: "filled" }),
	richTextSimple: ({ ctx }) =>
		ctx.mock.value.richText({ state: "filled", pattern: "long" }),
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
