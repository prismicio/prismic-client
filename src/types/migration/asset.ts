export type MigrationAsset = {
	id: string | URL | File | NonNullable<ConstructorParameters<File>[0]>[0]
	file: string | URL | File | NonNullable<ConstructorParameters<File>[0]>[0]
	filename: string
	notes?: string
	credits?: string
	alt?: string
	tags?: string[]
}
