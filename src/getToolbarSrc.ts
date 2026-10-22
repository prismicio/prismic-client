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
 * @param config - `version: 5` opts in to Prismic Toolbar v5. Only use it with an integration that
 *   stores the preview session in the `cookie.previewSession` cookie. Defaults to v4.
 * @returns The URL for the given Prismic repository's Prismic Toolbar script.
 */
export const getToolbarSrc = <TRepositoryName extends string, TVersion extends 4 | 5 = 4>(
	repositoryName: TRepositoryName,
	config?: { version?: TVersion },
): `https://static.cdn.prismic.io/prismic.js?repo=${TRepositoryName}${TVersion extends 5 ? "&v=5" : ""}` => {
	if (isRepositoryName(repositoryName)) {
		return `https://static.cdn.prismic.io/prismic.js?repo=${repositoryName}${config?.version === 5 ? "&v=5" : ""}` as never
	} else {
		throw new PrismicError(
			`An invalid Prismic repository name was given: ${repositoryName}`,
			undefined,
			undefined,
		)
	}
}
