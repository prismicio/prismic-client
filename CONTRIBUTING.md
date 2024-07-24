# Contributing

This package is primarily maintained by [Prismic](https://prismic.io)[^1]. External contributions are welcome. Ask for help by [opening an issue](https://github.com/prismicio/prismic-client/issues/new/choose), or request a review by opening a pull request.

## :gear: Setup

<!-- When applicable, list system requriements to work on the project. -->

The following setup is required to work on this project:

- Node.js
- npm CLI

## :memo: Project-specific notes

<!-- Share information about the repository. -->
<!-- What specific knowledge do contributors need? -->

> [!TIP]
> Please update this section with helpful notes for contributors.

#### Public types

`@prismicio/client` exports public-facing types for Prismic models and REST API V2 responses. They will likely need to be modified when models are changed.

- Model types are written in `src/types/model`. Each field type (e.g. key text) or composite field type (e.g. shared slice) has its own file.
- REST API V2 types are written in `src/types/value`. Each field type (e.g. key text) or composite field type (e.g. shared slice) has its own file.
- Repository API values, like `/api/v2` and ref values, are written in `src/types/api`. These files generally do not need to be edited for model changes.
- Webhook API values are written in `src/types/webhook`. These files generally do not need to be edited for model changes.

#### Content helpers

- `@prismicio/client` provides helpers for manipulating Prismic content. For example, `asDate` converts a date field to a JavaScript `Date` instance.
- Helpers are located in `src/helpers` with one file per helper. Find helpers that are affected by your model changes and update them accordingly.
- If your model changes require a new helper, add it to the library. In general, wait for usage patterns to emerge from users before adding helpers. You don’t want to write helpers that no one will use.

#### Tests

`@prismicio/client` has tests for its JavaScript/TypeScript API. It also has tests for its public TypeScript types.

##### JavaScript/TypeScript tests

- Any change to this library should be tested. A test can be as simple as ensuring a helper has the correct output.
- Tests should be placed in the `test` directory using the existing file name convention.
- Tests are written using Vitest.

##### TypeScript type tests

- Any change to this library should be tested. A test can be as simple as ensuring a type is compatible with a payload.
- Type tests should be placed in the `test/types` directory using the existing file name convention.
- Tests are written using `ts-expect` and run using `tsc`.

## :construction_worker: Develop

> [!NOTE]
> It's highly recommended to discuss your changes with the Prismic team before starting by [opening an issue](https://github.com/prismicio/prismic-client/issues/new/choose).[^2]
>
> A short discussion can accellerate your work and ship it faster.

```sh
# Clone and prepare the project.
git clone git@github.com:prismicio/prismic-client.git
cd prismic-client
npm install

# Create a new branch for your changes (e.g. lh/fix-win32-paths).
git checkout -b <your-initials>/<feature-or-fix-description>

# Start the development watcher.
# Run this command while you are working on your changes.
npm run dev

# Build the project for production.
# Run this command when you want to see the production version.
npm run build

# Lint your changes before requesting a review. No errors are allowed.
npm run lint
# Some errors can be fixed automatically:
npm run lint -- --fix

# Format your changes before requesting a review. No errors are allowed.
npm run format

# Test your changes before requesting a review.
# All changes should be tested. No failing tests are allowed.
npm run test
# Run only unit tests (optionally in watch mode):
npm run unit
npm run unit:watch
# Run only type tests
npm run types
```

## :building_construction: Submit a pull request

> [!NOTE]
> Code will be reviewed by the Prismic team before merging.[^3]
>
> Request a review by opening a pull request.

```sh
# Open a pull request. This example uses the GitHub CLI.
gh pr create

# Someone from the Prismic team will review your work. This review will at
# least consider the PR's general direction, code style, and test coverage.

# When ready, PRs should be merged using the "Squash and merge" option.
```

## :rocket: Publish

> [!CAUTION]
> Publishing is restricted to the Prismic team.[^4]

```sh
# Checkout the master branch and pull the latest changes.
git checkout master
git pull

# Perform a dry-run and verify the output.
# If it looks good, release a new version.
npm run release:dry
npm run release

# Or release an alpha.
# Perform a dry-run and verify the output.
# If it looks good, release a new alpha version.
npm run release:alpha:dry
npm run release:alpha
```

[^1]: This package is maintained by the DevX team. Prismic employees can ask for help or a review in the [#team-devx](https://prismic-team.slack.com/archives/C014VAACCQL) Slack channel.

[^2]: Prismic employees are highly encouraged to discuss changes with the DevX team in the [#team-devx](https://prismic-team.slack.com/archives/C014VAACCQL) Slack channel before starting.

[^3]: Code should be reviewed by the DevX team before merging. Prismic employees can request a review in the [#team-devx](https://prismic-team.slack.com/archives/CPG31MDL1) Slack channel.

[^4]: Prismic employees can ask the DevX team for [npm](https://www.npmjs.com) publish access.
