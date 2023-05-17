import { PrismicError } from "./errors/PrismicError";

import { isRepositoryName } from "./isRepositoryName";

/**
 * Returns the URL for a Prismic repository's Prismic Toolbar script. Use the
 * URL to inject the script into your app.
 *
 * @example
 *
 * ```typescriptreact
 * // In Next.js apps, use `next/script` in your `app/layout.tsx` file.
 *
 * import Script from "next/script";
 * import * as prismic from "@prismicio/client";
 *
 * export default function RootLayout({
 * 	children,
 * }: {
 * 	children: React.ReactNode,
 * }) {
 * 	const toolbarSrc = prismic.getToolbarSrc("my-repo");
 *
 * 	return (
 * 		<html lang="en">
 * 			<body>{children}</body>
 * 			<Script src={toolbarSrc} />
 * 		</html>
 * 	);
 * }
 * ```
 *
 * @param repositoryName - The name of the Prismic repository. For example,
 *   `"my-repo"` if the repository URL is `my-repo.prismic.io`.
 *
 * @returns The URL for the given Prismic repository's Prismic Toolbar script.
 */
export const getToolbarSrc = <TRepositoryName extends string>(
	repositoryName: TRepositoryName,
): `https://static.cdn.prismic.io/prismic.js?new=true&repo=${TRepositoryName}` => {
	if (isRepositoryName(repositoryName)) {
		return `https://static.cdn.prismic.io/prismic.js?new=true&repo=${repositoryName}` as const;
	} else {
		throw new PrismicError(
			`An invalid Prismic repository name was given: ${repositoryName}`,
			undefined,
			undefined,
		);
	}
};
