# Migrate

This example shows a migration script leveraging `@prismicio/client`'s write client
and the migration helper to migrate existing content to Prismic. `migrate.ts` is the
TypeScript exact equivalent of `migrate.mjs`.

Learn more about migrating to Prismic on the [migration documentation](https://prismic.io/docs/migration).

## How to run the example

> Scripts in this example uses an hypothetical WordPress client, therefore, they are not runnable as-is.

```sh
# Clone the repository to your computer
git clone https://github.com/prismicio/prismic-client.git
cd prismic-client/examples/migrate

# Install the dependencies
npm install

# Run the example (TypeScript)
npx tsx migrate.ts

# Run the example (JavaScript)
node migrate.mjs
```
