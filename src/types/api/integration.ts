import type { IntegrationFieldData } from "./value/integration"

/**
 * A catalog item from an integration field.
 *
 * @typeParam TData - The data shape for the catalog item.
 *
 * @see {@link https://prismic.io/docs/fields/integration#create-an-integration-catalog}
 */
export type IntegrationAPIItem<
	TData extends IntegrationFieldData = IntegrationFieldData,
> = {
	id: string
	title: string
	description: string
	image_url?: string
	last_update?: number
	blob: TData
}

/**
 * Response payload from a custom integration catalog API. Contains an array of
 * catalog items and the total count.
 *
 * @typeParam TData - The shape of each catalog item's data.
 *
 * @see {@link https://prismic.io/docs/fields/integration#create-an-integration-catalog}
 */
export type IntegrationAPIResults<
	TData extends IntegrationFieldData = IntegrationFieldData,
> = {
	results_size: number
	results: IntegrationAPIItem<TData>[]
}
