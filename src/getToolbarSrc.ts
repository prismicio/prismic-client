import { PrismicError } from "./errors"
import { isRepositoryName } from "./isRepositoryName"

/**
 * Returns the URL for a Prismic repository's Prismic Toolbar script. Use the URL to inject the
 * script into your app.
 *
 * @example
 * 	```typescriptreact
 * 	// In Next.js apps, use `next/script` in your `app/layout.tsx` file.
 *
 * 	import Script from "next/script";
 * 	import * as prismic from "@prismicio/client";
 *
 * 	export default function RootLayout({
 * 	children,
 * 	}: {
 * 	children: React.ReactNode,
 * 	}) {
 * 	const toolbarSrc = prismic.getToolbarSrc("my-repo");
 *
 * 	return (
 * 	<html lang="en">
 * 	<body>{children}</body>
 * 	<Script src={toolbarSrc} />
 * 	</html>
 * 	);
 * 	}
 * 	```
 *
 * @param repositoryName - The name of the Prismic repository. For example, `"my-repo"` if the
 *   repository URL is `my-repo.prismic.io`.
 * @param config - Options that configure the toolbar URL.
 * @returns The URL for the given Prismic repository's Prismic Toolbar script.
 */
export const getToolbarSrc = (
	repositoryName: string,
	config?: {
		/** The version of the Prismic Toolbar to load. Defaults to 4. */
		version?: 4 | 5
		/**
		 * The URL the toolbar script is loaded from, without a trailing slash. For example, a toolbar
		 * preview build. Defaults to `https://static.cdn.prismic.io`.
		 */
		host?: string
	},
): string => {
	if (isRepositoryName(repositoryName)) {
		const url = new URL(`${config?.host ?? "https://static.cdn.prismic.io"}/prismic.js`)
		url.searchParams.set("repo", repositoryName)
		if (config?.version) url.searchParams.set("v", config.version.toString())

		return url.toString()
	} else {
		throw new PrismicError(
			`An invalid Prismic repository name was given: ${repositoryName}`,
			undefined,
			undefined,
		)
	}
}
