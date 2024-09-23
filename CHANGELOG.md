# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [7.10.1](https://github.com/prismicio/prismic-client/compare/v7.10.0...v7.10.1) (2024-09-23)


### Bug Fixes

* ensure correct content type is attached to asset's blob ([80fe887](https://github.com/prismicio/prismic-client/commit/80fe887235e2eda594876f08db54cdb544e20b9f))

## [7.10.0](https://github.com/prismicio/prismic-client/compare/v7.9.0...v7.10.0) (2024-09-23)


### Features

* add `createMigration` and `createWriteClient` ([#350](https://github.com/prismicio/prismic-client/issues/350)) ([7dc2950](https://github.com/prismicio/prismic-client/commit/7dc2950e25e7f8db706522175974b8aee36d170e))

## [7.9.0](https://github.com/prismicio/prismic-client/compare/v7.8.1...v7.9.0) (2024-09-17)


### Features

* add client internal query params ([#349](https://github.com/prismicio/prismic-client/issues/349)) ([938d711](https://github.com/prismicio/prismic-client/commit/938d711845e4a51088a8f0e6374d27459f469315))


### Chore

* **deps:** maintain lock file ([601edd5](https://github.com/prismicio/prismic-client/commit/601edd55ed2594010da740f3f40250a7f517cf5c))

### [7.8.1](https://github.com/prismicio/prismic-client/compare/v7.8.0...v7.8.1) (2024-08-27)


### Bug Fixes

* add missing `is_master` property on repository type ([0289698](https://github.com/prismicio/prismic-client/commit/0289698cc9ca7ed5b264f71f2a9f8d39e3710058))

## [7.8.0](https://github.com/prismicio/prismic-client/compare/v7.7.4...v7.8.0) (2024-08-01)


### Features

* remove `*AsRichText` helpers ([#347](https://github.com/prismicio/prismic-client/issues/347)) ([cbd234b](https://github.com/prismicio/prismic-client/commit/cbd234b3a3cc72822ce1fe71dd39a85ce1860bcf))

### [7.7.4](https://github.com/prismicio/prismic-client/compare/v7.7.3...v7.7.4) (2024-07-24)


### Bug Fixes

* remove `hast-util-whitespace` dependency ([2d9c098](https://github.com/prismicio/prismic-client/commit/2d9c0988e4b9910e61299a8aa1ea03e7d57ec2fe))

### [7.7.3](https://github.com/prismicio/prismic-client/compare/v7.7.2...v7.7.3) (2024-07-23)


### Bug Fixes

* ignore trimmed empty spans ([6d1ce03](https://github.com/prismicio/prismic-client/commit/6d1ce035f7f5b3c112c3f00460190fdbd98e3543))

### [7.7.2](https://github.com/prismicio/prismic-client/compare/v7.7.1...v7.7.2) (2024-07-23)


### Bug Fixes

* ignore empty spans ([ab94da3](https://github.com/prismicio/prismic-client/commit/ab94da302a57872966c4720b4d1b5afbe390c2c6))

### [7.7.1](https://github.com/prismicio/prismic-client/compare/v7.7.0...v7.7.1) (2024-07-23)


### Bug Fixes

* support relative image URL ([5711f04](https://github.com/prismicio/prismic-client/commit/5711f046baf512f63f532da399c3f03146390d81))

## [7.7.0](https://github.com/prismicio/prismic-client/compare/v7.6.0...v7.7.0) (2024-07-23)


### Features

* add `unstable_htmlAsRichText` helpers ([#342](https://github.com/prismicio/prismic-client/issues/342)) ([8c5a82b](https://github.com/prismicio/prismic-client/commit/8c5a82b859ef0266e562da1f20eea5c9a785726b))


### Chore

* **deps:** maintain dependencies ([24df0e9](https://github.com/prismicio/prismic-client/commit/24df0e98ceaaf7244649cf8c1cc588ac55e0a86e))

## [7.6.0](https://github.com/prismicio/prismic-client/compare/v7.5.0...v7.6.0) (2024-06-20)


### Features

* support nested groups ([#341](https://github.com/prismicio/prismic-client/issues/341)) ([e6dc747](https://github.com/prismicio/prismic-client/commit/e6dc74710470c7bd66da61ccf0ece1f784c8129d))


### Documentation

* update `CONTRIBUTING.md` ([#340](https://github.com/prismicio/prismic-client/issues/340)) ([228f6b6](https://github.com/prismicio/prismic-client/commit/228f6b671d52d6ee6cd1c7b9a348d8613d4196aa))
* update README.md ([02479ae](https://github.com/prismicio/prismic-client/commit/02479ae34c5dbd3eb73f005ac71a19fe3b9c23f9))

## [7.6.0-alpha.0](https://github.com/prismicio/prismic-client/compare/v7.5.0...v7.6.0-alpha.0) (2024-06-05)


### Features

* support nested groups ([9c8a96c](https://github.com/prismicio/prismic-client/commit/9c8a96ca264564a08db9e7b445148542913d3665))

## [7.5.0](https://github.com/prismicio/prismic-client/compare/v7.4.1...v7.5.0) (2024-05-08)


### Features

* support groups in a slice's primary section ([#338](https://github.com/prismicio/prismic-client/issues/338)) ([0672bcb](https://github.com/prismicio/prismic-client/commit/0672bcbec506728a7a080783a985750fcdca8376))

## [7.5.0-alpha.3](https://github.com/prismicio/prismic-client/compare/v7.5.0-alpha.2...v7.5.0-alpha.3) (2024-05-07)


### Bug Fixes

* update @prismicio/types-internal ([e75b4c2](https://github.com/prismicio/prismic-client/commit/e75b4c2fb6a6495543d66556d42e787e2ab226c9))

### [7.4.1](https://github.com/prismicio/prismic-client/compare/v7.4.0...v7.4.1) (2024-04-13)


### Bug Fixes

* type error in `mapSliceZone` ([#339](https://github.com/prismicio/prismic-client/issues/339)) ([638e87a](https://github.com/prismicio/prismic-client/commit/638e87aeb97a04c0b8fbb160bd65a1d26028335e))


### Chore

* **release:** 7.4.1 ([f141026](https://github.com/prismicio/prismic-client/commit/f141026309e21be8f7e2fbdcc9dea9c5dc4594b2))

## [7.5.0-alpha.2](https://github.com/prismicio/prismic-client/compare/v7.5.0-alpha.1...v7.5.0-alpha.2) (2024-04-26)


### Bug Fixes

* update ([c28ae3a](https://github.com/prismicio/prismic-client/commit/c28ae3aa53a9c82573677d5ceaadf51b051b729d))

## [7.5.0-alpha.1](https://github.com/prismicio/prismic-client/compare/v7.5.0-alpha.0...v7.5.0-alpha.1) (2024-04-18)


### Bug Fixes

* export `CustomTypeModelFieldForSlicePrimary` ([16739f6](https://github.com/prismicio/prismic-client/commit/16739f6ec00a244e51b008f98d243be739376c50))

## [7.5.0-alpha.0](https://github.com/prismicio/prismic-client/compare/v7.4.0...v7.5.0-alpha.0) (2024-04-17)


### Features

* support groups in a slice's primary section ([98a44fa](https://github.com/prismicio/prismic-client/commit/98a44fa7a9da314f24d8b2ba518c921625391db2))


### Bug Fixes

* update `@prismicio/types-internal` ([3ee1b06](https://github.com/prismicio/prismic-client/commit/3ee1b064f2ae5de7ddbbd2e69f93776ff0d9a0ad))


### Refactor

* use `type` import ([46c4343](https://github.com/prismicio/prismic-client/commit/46c43439cce0ccf6626102a77918cea1e04736b7))


### Chore

* release alpha as minor ([9bd6355](https://github.com/prismicio/prismic-client/commit/9bd6355d7098f45f221821e3485edc8bad05f29e))
* use `@prismicio/types-internal` alpha ([df8f63d](https://github.com/prismicio/prismic-client/commit/df8f63d858227a246913dac33f15529294fc0515))

### [7.4.1](https://github.com/prismicio/prismic-client/compare/v7.4.0...v7.4.1) (2024-04-13)


### Bug Fixes

* type error in `mapSliceZone` ([#339](https://github.com/prismicio/prismic-client/issues/339)) ([638e87a](https://github.com/prismicio/prismic-client/commit/638e87aeb97a04c0b8fbb160bd65a1d26028335e))

## [7.4.0](https://github.com/prismicio/prismic-client/compare/v7.3.1...v7.4.0) (2024-03-27)


### Features

* stable `mapSliceZone` (previously `unstable_mapSliceZone`) ([#336](https://github.com/prismicio/prismic-client/issues/336)) ([b6852a4](https://github.com/prismicio/prismic-client/commit/b6852a419a247276debc2f094578bd8ab318958c))

### [7.3.1](https://github.com/prismicio/prismic-client/compare/v7.3.0...v7.3.1) (2023-10-11)


### Bug Fixes

* support expired preview token and repository not found API error ([#328](https://github.com/prismicio/prismic-client/issues/328)) ([d098a7f](https://github.com/prismicio/prismic-client/commit/d098a7ff0bfb318f73a30c98f355724248d89bfd))

## [7.3.0](https://github.com/prismicio/prismic-client/compare/v7.2.0...v7.3.0) (2023-10-09)


### Features

* add `@prismicio/client/richtext` entry ([#318](https://github.com/prismicio/prismic-client/issues/318)) ([fb555fd](https://github.com/prismicio/prismic-client/commit/fb555fde672ed8276ac0039aa093fa6d7227f35f))
* **helpers:** support attribute shorthand for map serializer ([#321](https://github.com/prismicio/prismic-client/issues/321)) ([b43557d](https://github.com/prismicio/prismic-client/commit/b43557d00a821938b463bcc6630953f4bfdc11cf))
* support expired and not-found ref API errors ([#327](https://github.com/prismicio/prismic-client/issues/327)) ([26d5b0f](https://github.com/prismicio/prismic-client/commit/26d5b0f022c61ed8711d99edce572bdbe013d3c9))
* support extended media API response ([#326](https://github.com/prismicio/prismic-client/issues/326)) ([5e5d057](https://github.com/prismicio/prismic-client/commit/5e5d0570dff67324c21cec1b553ae5f75b822590))

## [7.2.0](https://github.com/prismicio/prismic-client/compare/v7.1.1...v7.2.0) (2023-08-25)


### Features

* automatically retry rate-limited requests ([#319](https://github.com/prismicio/prismic-client/issues/319)) ([e0c8c49](https://github.com/prismicio/prismic-client/commit/e0c8c49fafac235c070550efbd45dc9dcbda4027))

### [7.1.1](https://github.com/prismicio/prismic-client/compare/v7.1.0...v7.1.1) (2023-08-11)


### Bug Fixes

* reduce the return type of `unstable_mapSliceZone()` to only include necessary properties ([#308](https://github.com/prismicio/prismic-client/issues/308)) ([d52cdfd](https://github.com/prismicio/prismic-client/commit/d52cdfd03b7a105efc3b2a4ce1bf421097c89fe3))
* throw `NotFoundError` when a document cannot be found ([#316](https://github.com/prismicio/prismic-client/issues/316)) ([74fce89](https://github.com/prismicio/prismic-client/commit/74fce893e812e29c49c8704d46c31b0f735ab176))


### Documentation

* Updated tags and oauth_token definitions in repository.ts ([#311](https://github.com/prismicio/prismic-client/issues/311)) ([cad174d](https://github.com/prismicio/prismic-client/commit/cad174da5d1099ed61619e40c34fb420e9186186))


### Chore

* **deps:** update all dependencies ([#307](https://github.com/prismicio/prismic-client/issues/307)) ([eb8cccc](https://github.com/prismicio/prismic-client/commit/eb8cccc4426d0696aa660588ffcc050ea8fb0104))
* **deps:** update dependencies ([#317](https://github.com/prismicio/prismic-client/issues/317)) ([d80b64a](https://github.com/prismicio/prismic-client/commit/d80b64ab39d181653f7bd08c97cae3f0564dc219))

## [7.1.0](https://github.com/prismicio/prismic-client/compare/v7.0.1...v7.1.0) (2023-06-07)


### Features

* add `unstable_mapSliceZone()` ([#302](https://github.com/prismicio/prismic-client/issues/302)) ([9e604d3](https://github.com/prismicio/prismic-client/commit/9e604d310eff9f4cae7c4340084501c68611ae9e))
* **customtype:** support new format property ([#295](https://github.com/prismicio/prismic-client/issues/295)) ([c68a557](https://github.com/prismicio/prismic-client/commit/c68a5576b6a264954181a2adab76744adc48149a))


### Bug Fixes

* type `PrismicDocument.*_publication_date` as `TimestampField<"filled">` ([#304](https://github.com/prismicio/prismic-client/issues/304)) ([7cce22a](https://github.com/prismicio/prismic-client/commit/7cce22a35cd3ef327920cf8a8f8289d5c38cb7bc))

### [7.0.1](https://github.com/prismicio/prismic-client/compare/v7.0.0...v7.0.1) (2023-05-22)


### Bug Fixes

* properly resolve types when using TypeScript's latest module resolution strategy ([#300](https://github.com/prismicio/prismic-client/issues/300)) ([a2b1084](https://github.com/prismicio/prismic-client/commit/a2b1084e013d92b913063833119ac0d1f002be4a))


### Documentation

* add migration guides in CHANGELOG.md ([aebbfa7](https://github.com/prismicio/prismic-client/commit/aebbfa72663910494e23772eebbf85f303429b7d))
* typo ([f06924c](https://github.com/prismicio/prismic-client/commit/f06924cb8cb37a72e76260959d3278b92cbf6c67))

## [7.0.0](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.5...v7.0.0) (2023-05-17)

[Check out the migration guide for how to migrate to `@prismicio/client` v7](https://prismic.io/docs/prismicio-client-v7-migration-guide)

### Bug Fixes

* update Prismic terms to use the latest language style ([#293](https://github.com/prismicio/prismic-client/issues/293)) ([1fce99c](https://github.com/prismicio/prismic-client/commit/1fce99cf282462df1952b8faa7ddf005ad96de6e))


### Documentation

* update link resolver, route resolver, and rich text serializer names ([#297](https://github.com/prismicio/prismic-client/issues/297)) ([a991a6c](https://github.com/prismicio/prismic-client/commit/a991a6cd98ce02ecabff15fb7a70d7a4531497b0))


### Chore

* **@prismicio/types-internal:** upgrade @prismicio/types-internal dependency ([#294](https://github.com/prismicio/prismic-client/issues/294)) ([edaa83d](https://github.com/prismicio/prismic-client/commit/edaa83db5b481ef3aefdbf9c998782d7abb5acd3))

## [6.8.0](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.4...v6.8.0) (2023-05-15)


### Features

* add `fetchOptions` parameter to control `fetch()` ([#291](https://github.com/prismicio/prismic-client/issues/291)) ([a492a40](https://github.com/prismicio/prismic-client/commit/a492a406eb3981d5eda73408c8e836cb2f591f99))


### Chore

* **release:** 6.8.0 ([4a3773e](https://github.com/prismicio/prismic-client/commit/4a3773eee45f4a440aef372082b44d14be894020))

### [6.7.3](https://github.com/prismicio/prismic-client/compare/v6.7.2...v6.7.3) (2022-12-19)


### Chore

* **deps:** maintain dependencies ([c821960](https://github.com/prismicio/prismic-client/commit/c82196076fe305d2f0a9aaf15167ba89da5cf8ed))
* **release:** 6.7.3 ([8f36b01](https://github.com/prismicio/prismic-client/commit/8f36b01f7ef6786384537da84a1ff1c36ca92058))

### [6.7.2](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.0...v6.7.2) (2022-12-19)


### Bug Fixes

* wrong example ([7dababc](https://github.com/prismicio/prismic-client/commit/7dababce904e3ab0928317b5e2a47c99bc3c57eb))


### Chore

* **deps:** maintain dependencies ([5d19954](https://github.com/prismicio/prismic-client/commit/5d19954175f475a65ffad23d50ca429ebbf77e7e))
* **release:** 6.7.2 ([74833e8](https://github.com/prismicio/prismic-client/commit/74833e8904b9bfb22803e6d2900e2a3905817510))

## [7.0.0-alpha.5](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.4...v7.0.0-alpha.5) (2023-05-16)


### ⚠ BREAKING CHANGES

* rename config `htmlRichTextSerializer` to `serializer`

### Refactor

* rename config `htmlRichTextSerializer` to `serializer` ([b4bdf7f](https://github.com/prismicio/prismic-client/commit/b4bdf7fbb44c487ee50edc4eff832cfc9321fc61))

## [7.0.0-alpha.4](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.3...v7.0.0-alpha.4) (2023-05-09)


### Features

* add `fetchOptions` parameter to control `fetch()` ([#289](https://github.com/prismicio/prismic-client/issues/289)) ([88bb32d](https://github.com/prismicio/prismic-client/commit/88bb32d73ed0b3c521007307c5da19351943a9d6))
* **client:** warn when non-.cdn endpoints are used [#284](https://github.com/prismicio/prismic-client/issues/284) ([81ab2bf](https://github.com/prismicio/prismic-client/commit/81ab2bf342c3d9fa2d83321914d4630d6e70d879))
* support Web API `Request`s containing partial URLs ([#286](https://github.com/prismicio/prismic-client/issues/286)) ([f2e8895](https://github.com/prismicio/prismic-client/commit/f2e889502ac39ab9ebfb5b7a3cbc4b71e4bb74d8))


### Refactor

* **helpers:** standardize helpers interface ([#288](https://github.com/prismicio/prismic-client/issues/288)) ([59f84ed](https://github.com/prismicio/prismic-client/commit/59f84ed051a2ea058cf9eae618ce1a781e0014f9))
* rename `predicate` tests to `filter` ([3100b3a](https://github.com/prismicio/prismic-client/commit/3100b3a1a51adcb8f656c8829664b099149ae0b3))


### Documentation

* mark `optimize` option as `[@experimental](https://github.com/experimental)` ([343534f](https://github.com/prismicio/prismic-client/commit/343534ff21ae74ecf319f5c91f8d251d181e76dc))
* wording and style ([0801785](https://github.com/prismicio/prismic-client/commit/0801785653a28abfbe175337b5fe04295d3e0949))

## [7.0.0-alpha.3](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.2...v7.0.0-alpha.3) (2023-04-28)


### Features

* add `optimize` options ([#285](https://github.com/prismicio/prismic-client/issues/285)) ([ff5dc42](https://github.com/prismicio/prismic-client/commit/ff5dc42e295febc6d5679d3e8a3203df6c72e9c6))

## [7.0.0-alpha.2](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.1...v7.0.0-alpha.2) (2023-04-22)


### Features

* export `AsLinkAttrsConfig` ([3957ab5](https://github.com/prismicio/prismic-client/commit/3957ab57f1804cf948e48654df6ac6505333b8ba))

## [7.0.0-alpha.1](https://github.com/prismicio/prismic-client/compare/v7.0.0-alpha.0...v7.0.0-alpha.1) (2023-04-20)


### ⚠ BREAKING CHANGES

* change `LinkResolver`'s default return type to `string | null | undefined`

### Features

* add `asLinkAttrs()` helper ([#282](https://github.com/prismicio/prismic-client/issues/282)) ([a520aa4](https://github.com/prismicio/prismic-client/commit/a520aa4d96aef37b0342a7dce9dce005e9738f2e))
* add `getToolbarSrc()` helper ([#281](https://github.com/prismicio/prismic-client/issues/281)) ([f0e768c](https://github.com/prismicio/prismic-client/commit/f0e768cfd795c18f03aab4e9f3cb83461bd7f5b7))
* add `HTMLRichTextSerializer` export ([014f15e](https://github.com/prismicio/prismic-client/commit/014f15ea93ad77f073f0fe4c6f2344bd333af808))
* change `LinkResolver`'s default return type to `string | null | undefined` ([3e1fc53](https://github.com/prismicio/prismic-client/commit/3e1fc53397e038dad1b1f8ecb78a63ac40477a94)), closes [#273](https://github.com/prismicio/prismic-client/issues/273)
* optimize concurrent queries via shared network requests ([7b72988](https://github.com/prismicio/prismic-client/commit/7b72988060fd6fd91dde86234ed2bd31ed89f0b9))
* port downstream changes from `@prismicio/helpers` and `@prismicio/types` ([409a6d6](https://github.com/prismicio/prismic-client/commit/409a6d6265dddd48efd853725cf24ab0e41fc8a9))


### Bug Fixes

* delete `fetch` job even if the network request rejects ([92dd2e7](https://github.com/prismicio/prismic-client/commit/92dd2e73d33b1ceb5fdcfc1faafea4fd3c7de8b6))
* export helper types from the correct locations ([21375d1](https://github.com/prismicio/prismic-client/commit/21375d141324c8329c7239ce5ed18f157ca50992))


### Refactor

* organize types, errors, and imports ([#275](https://github.com/prismicio/prismic-client/issues/275)) ([90245e2](https://github.com/prismicio/prismic-client/commit/90245e2c5edc599cd4f2e510fd49c08c5e274140))
* rename `HTMLSerializer` to `HTMLRichTextSerializer` ([84088d6](https://github.com/prismicio/prismic-client/commit/84088d6245ccfa9a3b2970484ecc6f769648902e))
* rename `predicate` to `filter` ([6e45c28](https://github.com/prismicio/prismic-client/commit/6e45c287a44edf7fc828e9e751d60c334f898545))
* replace nullish coalescing with `||` or ternaries ([#280](https://github.com/prismicio/prismic-client/issues/280)) ([d4720ad](https://github.com/prismicio/prismic-client/commit/d4720adcab38ea7b46ec32f7e248056173b8687a))
* use backwards compatible `||=` syntax ([b021748](https://github.com/prismicio/prismic-client/commit/b021748c67c8f4be9ebc6724d6de8123bc58cf81))


### Documentation

* add comment about `fetchJobs` strategy ([3fcdb42](https://github.com/prismicio/prismic-client/commit/3fcdb424cfcf31e82ab0490081ceb2298b16d0f4))
* port [#271](https://github.com/prismicio/prismic-client/issues/271) fix ([a3a6609](https://github.com/prismicio/prismic-client/commit/a3a66095dc62a3e4bf073f7b2d17c9758b20e93e))
* update documentation links ([af81b62](https://github.com/prismicio/prismic-client/commit/af81b62989b313ad1b42e445433f5066d0069e36))


### Chore

* add "custom" header to `.prettierignore` ([325505d](https://github.com/prismicio/prismic-client/commit/325505d53924fdffad2bad68e009709401885825))
* deprecate `orderings` string values, resolves [#269](https://github.com/prismicio/prismic-client/issues/269) ([#279](https://github.com/prismicio/prismic-client/issues/279)) ([25b9019](https://github.com/prismicio/prismic-client/commit/25b90196bdcaa258e33699c5393cb1882ef40167))
* **deps:** inline `escape-html` ([530e49b](https://github.com/prismicio/prismic-client/commit/530e49bec00948f3687d557713218450077236da))
* **deps:** maintain dependencies ([4a25c66](https://github.com/prismicio/prismic-client/commit/4a25c661796cb3905ae736d6af0d81e560416108))
* **deps:** update all dependencies ([0b0eaee](https://github.com/prismicio/prismic-client/commit/0b0eaeebb096b71919e0d1953fbbb7e48459f6f2))
* update `.prettierrc` import order ([74ddbe9](https://github.com/prismicio/prismic-client/commit/74ddbe95a5a7340b77d42e289169b68c1553dd6c))
* update LICENSE ([d94a9e8](https://github.com/prismicio/prismic-client/commit/d94a9e850b3268ff1e4532071875a915252fc6a6))

## [7.0.0-alpha.0](https://github.com/prismicio/prismic-client/compare/v6.7.1...v7.0.0-alpha.0) (2022-10-14)


### Bug Fixes

* refactor `ImageField` for better `isFilled.image()` compatibility ([44369fa](https://github.com/prismicio/prismic-client/commit/44369faf592e0dccffcc4ece93f5792f40217d2a))


### Chore

* merge `helpers` and `types`, remove deprecated APIs ([3201188](https://github.com/prismicio/prismic-client/commit/3201188db18fb311791e252088a284bdc3cd2b73))
* remove deprecated APIs ([610ddbc](https://github.com/prismicio/prismic-client/commit/610ddbc6db08f49c90ba87a2fd24a54ca4450cfe))
* update `.github` ([9600113](https://github.com/prismicio/prismic-client/commit/9600113b0bcc61f1de34f0901efbe132f37f0139))


### Documentation

* fix comment typos ([9b8aee0](https://github.com/prismicio/prismic-client/commit/9b8aee0ec33a4ad718e83167c107676a3e991e38))


### Refactor

* `examples` ([e37c9af](https://github.com/prismicio/prismic-client/commit/e37c9af607891f1f0ea900aa6c33d0cb91aadf91))
* make `getPreviewCookie()` break early ([3d639a7](https://github.com/prismicio/prismic-client/commit/3d639a7d8096b71b0d17650af1663cdffd183a3d))
* remove unused function ([9b6b3bd](https://github.com/prismicio/prismic-client/commit/9b6b3bd7d00f156c4903e2ab5ca6ae332b90a9dc))

### [6.7.1](https://github.com/prismicio/prismic-client/compare/v6.7.0...v6.7.1) (2022-09-08)


### Bug Fixes

* widen `AbortSignal` for greater support of fetch implementations ([#263](https://github.com/prismicio/prismic-client/issues/263)) ([70a2eb4](https://github.com/prismicio/prismic-client/commit/70a2eb444a78e3fc63015c4d802b298948f5a758))

## [6.7.0](https://github.com/prismicio/prismic-client/compare/v6.6.4...v6.7.0) (2022-08-23)


### Features

* support Route Resolver `uid`, `lang`, and `brokenRoute` options ([#258](https://github.com/prismicio/prismic-client/issues/258)) ([22f01c6](https://github.com/prismicio/prismic-client/commit/22f01c6cad671b908b568e2960d5434ca3a1b0fb))


### Chore

* **deps:** upgrade dependencies ([#259](https://github.com/prismicio/prismic-client/issues/259)) ([4d17090](https://github.com/prismicio/prismic-client/commit/4d170902f98c8022b876d8b46cec784b32a52a8c))

### [6.6.4](https://github.com/prismicio/prismic-client/compare/v6.6.3...v6.6.4) (2022-08-06)


### Chore

* **deps:** upgrade dependencies ([#253](https://github.com/prismicio/prismic-client/issues/253)) ([3beb148](https://github.com/prismicio/prismic-client/commit/3beb148e20df2c94a4452e971471c918b9835e59))

### [6.6.3](https://github.com/prismicio/prismic-client/compare/v6.6.2...v6.6.3) (2022-07-26)


### Chore

* **deps:** upgrade dependencies ([#251](https://github.com/prismicio/prismic-client/issues/251)) ([25918ab](https://github.com/prismicio/prismic-client/commit/25918abf7eb453e0f45bb7d80f0e83a1244feaa9))

### [6.6.2](https://github.com/prismicio/prismic-client/compare/v6.6.1...v6.6.2) (2022-07-21)


### Bug Fixes

* adjust `AbortSignalLike` to support native `AbortSignal` ([#250](https://github.com/prismicio/prismic-client/issues/250)) ([62fdae1](https://github.com/prismicio/prismic-client/commit/62fdae146912b2125691881a54595d124bcfdd02))


### Refactor

* optimize `getFirst()` and dependent methods ([#249](https://github.com/prismicio/prismic-client/issues/249)) ([ed06cec](https://github.com/prismicio/prismic-client/commit/ed06cec83e8b4d78bf73cf7a6dfce9311c586f6c))

### [6.6.1](https://github.com/prismicio/prismic-client/compare/v6.6.0...v6.6.1) (2022-06-22)


### Bug Fixes

* restore previous explicit document type parameter handling (fixes [#246](https://github.com/prismicio/prismic-client/issues/246)) ([#247](https://github.com/prismicio/prismic-client/issues/247)) ([6a33564](https://github.com/prismicio/prismic-client/commit/6a33564244c1e38ad79d2514188bdc9a92d23e2b))

## [6.6.0](https://github.com/prismicio/prismic-client/compare/v6.5.1...v6.6.0) (2022-06-17)


### Features

* declare document TypeScript types in `createClient()` ([#238](https://github.com/prismicio/prismic-client/issues/238)) ([92d8f84](https://github.com/prismicio/prismic-client/commit/92d8f84e710986b9ff476436ca036e4891854144))


### Bug Fixes

* resolve issue where `getTags()` returned an empty array for secured repositories ([#245](https://github.com/prismicio/prismic-client/issues/245)) ([b073edc](https://github.com/prismicio/prismic-client/commit/b073edccab818a12632dac3f8ac69eebb5185d56))


### Chore

* **deps:** upgrade dependencies ([ed571d7](https://github.com/prismicio/prismic-client/commit/ed571d7a167160e61acccc6eca54618c11af1c16))

### [6.5.1](https://github.com/prismicio/prismic-client/compare/v6.5.0...v6.5.1) (2022-05-31)


### Bug Fixes

* correctly detect HTTP requests with parsed queries ([#244](https://github.com/prismicio/prismic-client/issues/244)) ([d014bc8](https://github.com/prismicio/prismic-client/commit/d014bc8420eb6602f7548df48acf559cd00968a7))

## [6.5.0](https://github.com/prismicio/prismic-client/compare/v6.4.3...v6.5.0) (2022-05-26)


### Features

* accept Web API Request object in `enableAutoPreviewsFromReq()` ([#240](https://github.com/prismicio/prismic-client/issues/240)) ([66e01b9](https://github.com/prismicio/prismic-client/commit/66e01b96e377881e796ec5c034bd3e045bba43b6))


### Bug Fixes

* accept `not` predicate type ([#241](https://github.com/prismicio/prismic-client/issues/241)) ([a1812fd](https://github.com/prismicio/prismic-client/commit/a1812fdcd15fae7fc660ee3667e183f8c7f407d4))


### Chore

* **deps:** upgrade dependencies ([c3bd66c](https://github.com/prismicio/prismic-client/commit/c3bd66c15d7580ec0326737ed8538e2d04d8117e))
* remove reverted CHANGELOG entry ([f93af08](https://github.com/prismicio/prismic-client/commit/f93af0897860aec910e1149354753e07448cf0b4))

### [6.4.3](https://github.com/prismicio/prismic-client/compare/v6.4.2...v6.4.3) (2022-04-15)


### Bug Fixes

* add `limit` to all `getAll*()` methods (fixes [#233](https://github.com/prismicio/prismic-client/issues/233)) ([#234](https://github.com/prismicio/prismic-client/issues/234)) ([7d3e4c3](https://github.com/prismicio/prismic-client/commit/7d3e4c3b0759cfb368c4251538681d148f88a430))
* optimize `pageSize` when a `limit` less than `pageSize` is given ([#236](https://github.com/prismicio/prismic-client/issues/236)) ([3bec394](https://github.com/prismicio/prismic-client/commit/3bec394084db84625fbbbdd56264693d60ef0322))


### Chore

* **deps:** upgrade dependencies ([8e27a71](https://github.com/prismicio/prismic-client/commit/8e27a71485921d18a55b99c8b3df1a1b53604234))
* fix coverage ([933200a](https://github.com/prismicio/prismic-client/commit/933200ab3810ee1dd51bf269efff1fc2d45453ee))

### [6.4.2](https://github.com/prismicio/prismic-client/compare/v6.4.1...v6.4.2) (2022-03-23)


### Bug Fixes

* support boolean and dates in basic predicates, closes [#229](https://github.com/prismicio/prismic-client/issues/229) ([f15f606](https://github.com/prismicio/prismic-client/commit/f15f6061bcaafaef4e0a775da6a1167344e830dd))


### Documentation

* update `with-express` example to use a per-request client ([#228](https://github.com/prismicio/prismic-client/issues/228)) ([edc8280](https://github.com/prismicio/prismic-client/commit/edc82802efef741395b4f19e6f4776ad5fcb2a96))


### Chore

* add issues workflow ([5541a06](https://github.com/prismicio/prismic-client/commit/5541a065d794335c5e7cf00e886983fef869b876))
* **deps:** maintain dependencies ([a03704a](https://github.com/prismicio/prismic-client/commit/a03704ab2adaef9d9ca6df5fd418af375e2b9a7a))

### [6.4.1](https://github.com/prismicio/prismic-client/compare/v6.4.0...v6.4.1) (2022-03-10)


### Bug Fixes

* cache-bust GraphQL requests made with `graphQLFetch()` ([#227](https://github.com/prismicio/prismic-client/issues/227)) ([894e7a8](https://github.com/prismicio/prismic-client/commit/894e7a8b5bc57bf6b65ee23d4f3fb34959d6cbc2))

## [6.4.0](https://github.com/prismicio/prismic-client/compare/v6.3.0...v6.4.0) (2022-03-10)


### Features

* rename `graphqlFetch()` to `graphQLFetch()` ([c1651ba](https://github.com/prismicio/prismic-client/commit/c1651ba2e3e05ca9d1ebf50b72cb2324f837b01a))


### Bug Fixes

* return default URL `resolvePreviewURL()` does not resolve a string URL ([#226](https://github.com/prismicio/prismic-client/issues/226)) ([8b5a689](https://github.com/prismicio/prismic-client/commit/8b5a689ac55c77d0e5900ca81c1014020b48928b))
* use `pageSize` from `defaultParams` if given when calling `dangerouslyGetAll()` ([0787631](https://github.com/prismicio/prismic-client/commit/078763175374740b046870da437c533dd4aa8505))

## [6.3.0](https://github.com/prismicio/prismic-client/compare/v6.2.0...v6.3.0) (2022-02-16)


### Features

* add `getRepositoryEndpoint()`, `getRepositoryName()`, `isRepositoryName()`, `isRepositoryEndpoint()`; deprecate `getEndpoint()` ([#222](https://github.com/prismicio/prismic-client/issues/222)) ([27bf0ee](https://github.com/prismicio/prismic-client/commit/27bf0ee5633cf85c6221918fea089d909705c1ed))
* support providing a repository name to `createClient()` in place of an API endpoint ([#224](https://github.com/prismicio/prismic-client/issues/224)) ([8c88382](https://github.com/prismicio/prismic-client/commit/8c88382dbc31ff752f8742411700cbc7947558bc))


### Chore

* **deps:** update dependencies ([283d5f0](https://github.com/prismicio/prismic-client/commit/283d5f07703497b7ba1fb22fe30af7ba57c4cfdc))
* update license ([91f1b61](https://github.com/prismicio/prismic-client/commit/91f1b612d8ec4e10e10714d4c44112748309e036))

## [6.2.0](https://github.com/prismicio/prismic-client/compare/v6.1.1...v6.2.0) (2022-02-04)


### Features

* support abortable requests via `AbortController` ([#221](https://github.com/prismicio/prismic-client/issues/221)) ([5891a83](https://github.com/prismicio/prismic-client/commit/5891a838d5a140fa5e28081071729b3a776bcde6))


### Bug Fixes

* minify GraphQL queries by removing whitespace ([#219](https://github.com/prismicio/prismic-client/issues/219)) ([96cad0b](https://github.com/prismicio/prismic-client/commit/96cad0beddc31a09bf7056a719b8e5d1a44a430c))
* resolve `'document.tags' expected a [list] of 'string' literals` error when using tag methods with a single tag ([50c78f7](https://github.com/prismicio/prismic-client/commit/50c78f7033bd175e34a4aa2e54d85d6d9261425b))


### Documentation

* fix caching example by using `.clone()` method ([#218](https://github.com/prismicio/prismic-client/issues/218)) ([52b455c](https://github.com/prismicio/prismic-client/commit/52b455ca27fc2809fd8e07b077ac0278244ea01b))
* remove version-specific docs link ([b141ba7](https://github.com/prismicio/prismic-client/commit/b141ba78c7f842b4c147419f6d7f26ac3b2bb125))


### Chore

* **deps:** update dependencies ([5452f87](https://github.com/prismicio/prismic-client/commit/5452f87c06f4f241980b152534f65b5f8947ac18))


### Refactor

* remove `type-fest` dependency ([f1d8124](https://github.com/prismicio/prismic-client/commit/f1d81247bd3bd95397108e66ec0ac3e586cf9976))

### [6.1.1](https://github.com/prismicio/prismic-client/compare/v6.1.0...v6.1.1) (2022-01-28)


### Chore

* **deps:** update dependencies ([d35e2da](https://github.com/prismicio/prismic-client/commit/d35e2dac36f59c9561aae298f5fe0f156ec1b3ee))
* support React Native's Metro bundler ([9c5a38b](https://github.com/prismicio/prismic-client/commit/9c5a38bbf104b0ea8791f955b6dfbcbc2a615e72))

## [6.1.0](https://github.com/prismicio/prismic-client/compare/v6.0.0...v6.1.0) (2022-01-18)


### Features

* add `getGraphQLEndpoint` and `Client.prototype.graphqlFetch` ([9b5a126](https://github.com/prismicio/prismic-client/commit/9b5a12621e4ca5cf6e34338d1a99ac80383d399c))


### Bug Fixes

* resolve previewed document URL any language ([#208](https://github.com/prismicio/prismic-client/issues/208)) ([a7504be](https://github.com/prismicio/prismic-client/commit/a7504bef9e3563836a95ad20a8d052971d348426))


### Refactor

* simplify graphqlFetch by unsupporting `RequestInfo` and `RequestInit` ([580c4d5](https://github.com/prismicio/prismic-client/commit/580c4d59ad4826290d4eee9bc0d2c12f27c69ee7))


### Documentation

* add TSDoc to `Client.prototype.graphqlFetch` ([a883f7e](https://github.com/prismicio/prismic-client/commit/a883f7e41141090246d07b8f78f16ccd77dafd41))
* fix links ([144b6bd](https://github.com/prismicio/prismic-client/commit/144b6bdc4d733093374d9d873b6d9b4944c1a02d))


### Chore

* add build step to test script ([1d0a8a7](https://github.com/prismicio/prismic-client/commit/1d0a8a78656e65d4f5ab98d0cba60e6c163751c5))
* add custom-timeout example ([#205](https://github.com/prismicio/prismic-client/issues/205)) ([d4e55d4](https://github.com/prismicio/prismic-client/commit/d4e55d41fdb952c808d03066823e5ae77a39434f))
* add size limit ([8eb5170](https://github.com/prismicio/prismic-client/commit/8eb5170eec9a2dc7b16c817fc9eff7288fda220f))
* **deps:** maintain dependencies ([2f337a3](https://github.com/prismicio/prismic-client/commit/2f337a3a79d9b7b47dd2b9ee6688d1a4f16e9464))
* **deps:** update dependencies ([7e1746a](https://github.com/prismicio/prismic-client/commit/7e1746a4f3c8932e344763cfd54ae193db987a09))

## [6.0.0](https://github.com/prismicio/prismic-client/compare/v5.1.1...v6.0.0) (2022-01-05)

[Check out the migration guide for how to migrate to `@prismicio/client` v6](https://prismic.io/docs/prismic-client-v6-migration-guide)

## [6.0.0-beta.5](https://github.com/prismicio/prismic-client/compare/v6.0.0-beta.4...v6.0.0-beta.5) (2021-12-21)


### Features

* ensure Prismic Rest API V2 endpoint is used ([#203](https://github.com/prismicio/prismic-client/issues/203)) ([18faf65](https://github.com/prismicio/prismic-client/commit/18faf65016de380838ed3ea74eb56cad201acf13))
* throw NotFoundError if repository does not exist ([bf7b862](https://github.com/prismicio/prismic-client/commit/bf7b862e6d7b8cbb3a9bb5fa4ccf334e5c72bca0))


### Documentation

* update README links [skip ci] ([298e062](https://github.com/prismicio/prismic-client/commit/298e06214eae3de69d4b54022398dd0087c6951c))


### Chore

* **deps:** update dependencies ([3c8414d](https://github.com/prismicio/prismic-client/commit/3c8414dac01a2ccc482b9f5cf88135e51c25aaee))

## [6.0.0-beta.4](https://github.com/prismicio/prismic-client/compare/v6.0.0-beta.3...v6.0.0-beta.4) (2021-12-03)


### Bug Fixes

* add predicate aliases for smoother upgrade path ([4a1f49c](https://github.com/prismicio/prismic-client/commit/4a1f49c147c68ba450478725b34cd432be5e2012))


### Chore

* **deps:** maintain dependencies ([6250df3](https://github.com/prismicio/prismic-client/commit/6250df3ecf768f8135fc13ef582eb10ef26b3f4e))

## [6.0.0-beta.3](https://github.com/prismicio/prismic-client/compare/v6.0.0-beta.2...v6.0.0-beta.3) (2021-11-09)


### Features

* throttle getAll* methods and rename getAll to dangerouslyGetAll ([#193](https://github.com/prismicio/prismic-client/issues/193)) ([4efdfa0](https://github.com/prismicio/prismic-client/commit/4efdfa0383e448e2d09c50c42804803358438b05))

## [6.0.0-beta.2](https://github.com/prismicio/prismic-client/compare/v6.0.0-beta.1...v6.0.0-beta.2) (2021-10-30)


### Bug Fixes

* revert to providing access token via URL parameter ([7a5140e](https://github.com/prismicio/prismic-client/commit/7a5140e7be1fca2c1ddf1ad34b14e16604c491c6))

## [6.0.0-beta.1](https://github.com/prismicio/prismic-client/compare/v6.0.0-beta.0...v6.0.0-beta.1) (2021-10-25)


### Features

* add `getBySomeTags`, rename `getByTags` to `getByEveryTag` ([#194](https://github.com/prismicio/prismic-client/issues/194)) ([37385dc](https://github.com/prismicio/prismic-client/commit/37385dc3a4e7eebd21e9b66077878c74dbe06294))
* extend all custom errors from PrismicError ([c4be6ce](https://github.com/prismicio/prismic-client/commit/c4be6ce17136361af79a1fca17c7c8fb3d258bcd))
* use authorization header for access token ([#192](https://github.com/prismicio/prismic-client/issues/192)) ([42af240](https://github.com/prismicio/prismic-client/commit/42af2405bb68e1763b6508deb3b3d86000b28fb0))


### Bug Fixes

* on getAll methods, use MAX_PAGE_SIZE when pageSize param is falsey ([#195](https://github.com/prismicio/prismic-client/issues/195)) ([46b638a](https://github.com/prismicio/prismic-client/commit/46b638acfb8f658d7272418fc927c664c9e0b72a))


### Chore

* **deps:** update dependencies ([e7dbd7f](https://github.com/prismicio/prismic-client/commit/e7dbd7f80e8676ea11989ce1ccc33073ae6df13b))
* mark package as side effect free ([dc02db7](https://github.com/prismicio/prismic-client/commit/dc02db7a3660e00473d59bb59e4e3926e98b4dcb))


### Refactor

* optimize code for bundle size ([#196](https://github.com/prismicio/prismic-client/issues/196)) ([9dc32e0](https://github.com/prismicio/prismic-client/commit/9dc32e0fa4ab47df222c328882517e041e8daad4))

## [6.0.0-beta.0](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.15...v6.0.0-beta.0) (2021-09-29)


### Chore

* **deps:** maintain dependencies ([312ce48](https://github.com/prismicio/prismic-client/commit/312ce489434abafa9a8322d79dd083ac1e5afe1f))
* update template config ([8dbc214](https://github.com/prismicio/prismic-client/commit/8dbc2148e72b861d701fa490910c47b25a96892a))

## [6.0.0-alpha.15](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.14...v6.0.0-alpha.15) (2021-09-14)


### Chore

* update @prismicio/types and @prismicio/helpers ([c4e00a1](https://github.com/prismicio/prismic-client/commit/c4e00a1d40907b1900979e5bbf2a3d5b6292fa6a))

## [6.0.0-alpha.14](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.13...v6.0.0-alpha.14) (2021-09-14)


### Chore

* update dependencies ([a383ec7](https://github.com/prismicio/prismic-client/commit/a383ec7f0552adf3895f4584c5809ffeae0b0cb7))

## [6.0.0-alpha.13](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.12...v6.0.0-alpha.13) (2021-09-10)


### Features

* add `getByUIDs` and `getAllByUIDs` ([52a8cc9](https://github.com/prismicio/prismic-client/commit/52a8cc9d491f10737086bb796b98fa767cefa890)), closes [#191](https://github.com/prismicio/prismic-client/issues/191)

## [6.0.0-alpha.12](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.11...v6.0.0-alpha.12) (2021-09-09)


### Features

* use API types from `@prismicio/types` ([632c2ae](https://github.com/prismicio/prismic-client/commit/632c2aeca484502546e880156e94600476f12314))


### Bug Fixes

* builds ([5f49827](https://github.com/prismicio/prismic-client/commit/5f49827d77b24cd0f0333e23c2306984ae821c94))
* use "ID" over "Id" in method names ([2bcdabf](https://github.com/prismicio/prismic-client/commit/2bcdabf829f309f856b757a3401aacae6856bba4))

## [6.0.0-alpha.11](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.10...v6.0.0-alpha.11) (2021-08-24)


### Features

* provide routes as top-level client options ([69f2002](https://github.com/prismicio/prismic-client/commit/69f2002a97c476bc7b7f9161ee81946f9e65a4c9))


### Chore

* update dependencies ([d70c228](https://github.com/prismicio/prismic-client/commit/d70c228a7902ea7a147e203d9c50a253ba6f033c))

## [6.0.0-alpha.10](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.9...v6.0.0-alpha.10) (2021-08-19)


### Chore

* update dependencies ([1d7723f](https://github.com/prismicio/prismic-client/commit/1d7723f1b102a4f5e77c38f596912a97df85e052))

## [6.0.0-alpha.9](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.8...v6.0.0-alpha.9) (2021-08-17)


### Bug Fixes

* allow optional Link Resolver in resolvePreviewURL ([4321921](https://github.com/prismicio/prismic-client/commit/43219210fad1fadf57365a77c5c5bce34e28baa3)), closes [#183](https://github.com/prismicio/prismic-client/issues/183)
* mark `resolvers` as optional in Routes ([d84658a](https://github.com/prismicio/prismic-client/commit/d84658aa3efd97b034b3cae6281f37b841d62f91))
* use "main" as primary branch ([c4c02e6](https://github.com/prismicio/prismic-client/commit/c4c02e6538dd00ad7324cbffdfa92c6deafbf20d))


### Chore

* revert previous commit ([a0cf5cb](https://github.com/prismicio/prismic-client/commit/a0cf5cb27ccad10076625d549d6b410b5f9f8dac))
* update dotfiles per standard template ([5f4dee0](https://github.com/prismicio/prismic-client/commit/5f4dee0a85ed64d20861c59abc6e6dce5a4a2933))
* update pull request template ([f618d62](https://github.com/prismicio/prismic-client/commit/f618d626aa74272b7c5a4f4da51c808e30617741))

## [6.0.0-alpha.8](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.7...v6.0.0-alpha.8) (2021-07-06)


### Bug Fixes

* support unauthorized repository response ([022d278](https://github.com/prismicio/prismic-client/commit/022d278fcb89ecc098e9729b5bf67ef87a9f8259))
* use access_token URL parameter over Authorization header ([#182](https://github.com/prismicio/prismic-client/issues/182)) ([4c44109](https://github.com/prismicio/prismic-client/commit/4c44109b8b4428341e6becc021b1888230e7e961))


### Chore

* **deps:** update examples dependencies ([1c8f2b2](https://github.com/prismicio/prismic-client/commit/1c8f2b2a73dc56aa055efdb7a0c8c10ada3e428f))

## [6.0.0-alpha.7](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.6...v6.0.0-alpha.7) (2021-07-03)


### Bug Fixes

* use `in` predicate for getByIDs ([fc522a2](https://github.com/prismicio/prismic-client/commit/fc522a22665f0ba461884c30ad5fb032b7910724))

## [6.0.0-alpha.6](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.5...v6.0.0-alpha.6) (2021-07-03)


### Chore

* update dependencies ([2a18d2e](https://github.com/prismicio/prismic-client/commit/2a18d2e52d78734dd2405f83677c6b221149910c))
* update dependencies ([eb9b13e](https://github.com/prismicio/prismic-client/commit/eb9b13e81bb6754597fa8df8948d0fafcd1ea042))

## [6.0.0-alpha.5](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.4...v6.0.0-alpha.5) (2021-06-27)


### Bug Fixes

* use @prismicio/helpers for resolvePreviewURL ([2db45d2](https://github.com/prismicio/prismic-client/commit/2db45d2eb67c335ea88838937f9e00696cd11b3a))

## [5.1.0](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.2...v5.1.0) (2021-06-11)

## [6.0.0-alpha.4](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.3...v6.0.0-alpha.4) (2021-06-23)


### Bug Fixes

* support global fetch if provided explicitly ([d22ae21](https://github.com/prismicio/prismic-client/commit/d22ae21483f967b4366d501f7e98934d6ee668bb))

## [6.0.0-alpha.3](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.2...v6.0.0-alpha.3) (2021-06-23)


### Features

* support Route Resolver with routes param ([063b5ee](https://github.com/prismicio/prismic-client/commit/063b5eec0399efd834c4c6142586b1cd54f44054))


### Bug Fixes

* resolve issue using global fetch ([83c6290](https://github.com/prismicio/prismic-client/commit/83c6290ec79a4f5bbecc1d2d9308816300101138)), closes [#180](https://github.com/prismicio/prismic-client/issues/180)
* throw if an invalid fetch function is given ([ec01c59](https://github.com/prismicio/prismic-client/commit/ec01c598c8a79049f843e9d47a3abd83043dd469))


### Refactor

* simplify SimpleTTLCache and add internal docs ([f255a27](https://github.com/prismicio/prismic-client/commit/f255a270ea1b7dc55979d2111ece9fedafb922c3))

## [6.0.0-alpha.2](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.1...v6.0.0-alpha.2) (2021-06-11)


### Features

* add wrapper errors ([3dfba0f](https://github.com/prismicio/prismic-client/commit/3dfba0f4fb013421db58217cb02a810dab2b5fcc)), closes [#177](https://github.com/prismicio/prismic-client/issues/177)
* return API error message on failed requests ([8de2873](https://github.com/prismicio/prismic-client/commit/8de287399fc919c097cd4d8a0bbc30f302092d51))


### Chore

* rename license file ([f496697](https://github.com/prismicio/prismic-client/commit/f4966979dbd02cd37a737ca982b1e6d2bb36ccc7))

## [6.0.0-alpha.1](https://github.com/prismicio/prismic-client/compare/v6.0.0-alpha.0...v6.0.0-alpha.1) (2021-06-07)


### Features

* [wip] cache master ref for a short period ([b73a7d0](https://github.com/prismicio/prismic-client/commit/b73a7d0ceb08d967f0552de7e1e38022243d3545))
* support cached refs for releases ([7a46513](https://github.com/prismicio/prismic-client/commit/7a46513b3e8595395e8bc57414431ea01131c2f0))


### Bug Fixes

* use cjs export to support non-esm ([63219e8](https://github.com/prismicio/prismic-client/commit/63219e8343552bed78fe4bdcf65470ea7cb9e885))


### Chore

* add test dir format script ([e4594f5](https://github.com/prismicio/prismic-client/commit/e4594f575d6b50be32381a00ff3ce9426bb70194))


### Documentation

* add internal comments ([61d4c14](https://github.com/prismicio/prismic-client/commit/61d4c149d7c99871edd8e803f39e6586d366f210))

## [5.0.0](https://github.com/prismicio/prismic-client/compare/v5.0.0-alpha.1...v5.0.0) (2021-05-27)


### Chore

* **release:** 5.0.0 fix ([ed15e96](https://github.com/prismicio/prismic-client/commit/ed15e963a0a05b7b8a276c14d0ff35c594ee36aa))

## [6.0.0-alpha.0](http://github.com/prismicio/prismic-client/compare/v5.0.0-alpha.1...v6.0.0-alpha.0) (2021-05-27)

## [5.0.0-alpha.1](http://github.com/prismicio/prismic-client/compare/v5.0.0-alpha.0...v5.0.0-alpha.1) (2021-05-27)


### Chore

* fix release script ([23bcc88](http://github.com/prismicio/prismic-client/commit/23bcc88bad570502f04e0e1fb997001cd0cc4584))

## [5.0.0-alpha.0](http://github.com/prismicio/prismic-client/compare/v4.0.0...v5.0.0-alpha.0) (2021-05-27)


### Features

* add "query from" methods and replace ref with release ([7d894a5](http://github.com/prismicio/prismic-client/commit/7d894a5a6e4512bc84d8fb1d8c57d72ccc895b56))
* add getAllByIDs ([297a70c](http://github.com/prismicio/prismic-client/commit/297a70ca53b9d7c9b5d40a0faf2e6c65c22c1a60))
* add getTags ([164c8d5](http://github.com/prismicio/prismic-client/commit/164c8d5972c6b7f0ad12ede8b1d27921b865f474))
* add initial client ([ee886bd](http://github.com/prismicio/prismic-client/commit/ee886bde37673dc25b6545d8ce2f971c81e026cd))
* add release-specific methods (wip) [skip ci] ([4f66405](http://github.com/prismicio/prismic-client/commit/4f6640565e854abdfadd4c3fb3577c49bd0a7d21))
* add resolvePreviewUrl ([53ed409](http://github.com/prismicio/prismic-client/commit/53ed409dc5418162a79f668fc6346c41d2c1a266))
* export HttpRequestLike ([96f1e1e](http://github.com/prismicio/prismic-client/commit/96f1e1ee4e66eb3bc72b520d15ca1af4bcb26c36))
* export predicates under root package ([18d742c](http://github.com/prismicio/prismic-client/commit/18d742c4e6476a22e23b9d860a50734b303c23a6))
* expose HTTPError ([fdf370a](http://github.com/prismicio/prismic-client/commit/fdf370aeda78f21a0b87dda699cabf41012298a1))
* restore form type ([c38e067](http://github.com/prismicio/prismic-client/commit/c38e067f74629ffa0a434de09e0d87499b6541ec))
* restore ref methods and scope release methods ([1ff8f72](http://github.com/prismicio/prismic-client/commit/1ff8f72b0c74847d87e23bce84dc666e5ac0808f))
* use normalized HTTPError ([0eb9fab](http://github.com/prismicio/prismic-client/commit/0eb9fabe98b46db73fc31847213935a787b23a85))


### Bug Fixes

* asc orderings direction should not be included in query ([46431fd](http://github.com/prismicio/prismic-client/commit/46431fde2e8c28c7bbc7b2439dd343e4f1560f34))
* clone responses for better cache support ([67ef2ba](http://github.com/prismicio/prismic-client/commit/67ef2ba909024e27ca418e8c9134e61eca848400))
* correct typings and predicate generation fn ([c81da44](http://github.com/prismicio/prismic-client/commit/c81da442129b5d001e6defe6d8bee9a39ab9951f))
* export types using `export type` ([a1fad4a](http://github.com/prismicio/prismic-client/commit/a1fad4ab0278f9501e6a35e56bc89dd6739cba30))
* getByIds should return paginated results ([fb94561](http://github.com/prismicio/prismic-client/commit/fb9456125da0721a80295e2f556cf4b07b368e70))
* ignore nullish ordering param ([51e53b7](http://github.com/prismicio/prismic-client/commit/51e53b7304a4b804f14e0cc4b41448598fcec997))
* use correct uid predicate for getByUID ([5735d28](http://github.com/prismicio/prismic-client/commit/5735d28e48645f2bf83970a3fd3d359f1bfe0e11))
* widen types of fetch-related APIs ([412205b](http://github.com/prismicio/prismic-client/commit/412205b9bf14473ab5a85988e5b986b09544d5e3))


### Documentation

* add comment to server-usage example ([b04d359](http://github.com/prismicio/prismic-client/commit/b04d35934c42b752776c22f75ecc001148369053))
* add custom-caching README ([ec26d6a](http://github.com/prismicio/prismic-client/commit/ec26d6a958cf55a77f5345f26622f1052895ae91))
* add examples ([62004a0](http://github.com/prismicio/prismic-client/commit/62004a0e72ff8368890dc83bf0aa9bb6cb86b79b))
* add multiple-languages example ([9d9592d](http://github.com/prismicio/prismic-client/commit/9d9592dbab0c2c34142adefaddb0c11cb4cdd1b5))
* add server-usage example ([c4b2e2f](http://github.com/prismicio/prismic-client/commit/c4b2e2f5228819dcb70f2be0407a8adf669a18be))
* add TSDoc for all client methods ([01cd9d9](http://github.com/prismicio/prismic-client/commit/01cd9d993ea4c685f4d04ec87a68fa553fe08a61))
* add TSDocs for client instance properties ([15d0187](http://github.com/prismicio/prismic-client/commit/15d0187be1aa4eeb337e6958044a7667eb4ad487))
* add TSDocs to remaining functions ([38052d2](http://github.com/prismicio/prismic-client/commit/38052d28a00b87966704d34b1ef5b87cba611da1))
* add with-typescript example ([5c7f396](http://github.com/prismicio/prismic-client/commit/5c7f396c350f25c9fb371dbf45a5a0f4a30fcbc6))
* describe internal predicate functions [skip ci] ([e4fed22](http://github.com/prismicio/prismic-client/commit/e4fed221e5f1b5c7562772079ed7233daa5be52a))
* fix badges ([7fd6541](http://github.com/prismicio/prismic-client/commit/7fd6541b73cbc985212798448f72436355fa8e5b))
* fix orderings parameter sketch ([0f43762](http://github.com/prismicio/prismic-client/commit/0f43762b5f8b99158370b999f56110aa3b5c4adf))
* more descriptive getResolvedRefString comment [skip ci] ([d9ae04b](http://github.com/prismicio/prismic-client/commit/d9ae04b4dfe830291cef0b7c0a38f7766b1928ea))
* new kit name typos fixes [#152](http://github.com/prismicio/prismic-client/issues/152) ([873bd58](http://github.com/prismicio/prismic-client/commit/873bd58befd26e2a3e8f6dca09d07c16303f00dd))
* refactor custom-caching example ([9dd2daa](http://github.com/prismicio/prismic-client/commit/9dd2daae2fd5839838b7ac60bd725bc51a293ff8))
* remove inaccurate docs ([974d160](http://github.com/prismicio/prismic-client/commit/974d160f99d9e12fa99e6c1df85f562837ec31d8))
* replace remaining usage of [@see](http://github.com/see) with [@link](http://github.com/link) ([02feadc](http://github.com/prismicio/prismic-client/commit/02feadc5b0c766562d0f03b2b98faac39ecacbc6))
* update comment wording ([3535c32](http://github.com/prismicio/prismic-client/commit/3535c32f73b34524bb88ab443342251eac70ca1c))
* update README ([1a9c5b8](http://github.com/prismicio/prismic-client/commit/1a9c5b8ee8f915e05d4ad8fd896364e28341acb1))
* use {[@link](http://github.com/link)} and [@type](http://github.com/type)Param ([2d2a2c5](http://github.com/prismicio/prismic-client/commit/2d2a2c545cb80fc0f43e06627d4f15bd3a212da8))


### Refactor

* assume the cookie store is always a string ([5d563b0](http://github.com/prismicio/prismic-client/commit/5d563b004bdcb131292282ed7549bb324e0111f2))
* client ([f0c5206](http://github.com/prismicio/prismic-client/commit/f0c5206e8fe8f10fb4a415fa81e26dd68fba02f5))
* explicitly export types ([b5b34fe](http://github.com/prismicio/prismic-client/commit/b5b34feb58b7efcfd0c249c5fb2ad7609700bb6d))
* export all in root ([2bdfd3f](http://github.com/prismicio/prismic-client/commit/2bdfd3ff8f40897b7606f00846a5a75b55a1f7bd))
* internal predicate fns for readability ([731a444](http://github.com/prismicio/prismic-client/commit/731a444e81d9506328e0b36f6710c5c3e8922638))
* remove ref methods ([a333921](http://github.com/prismicio/prismic-client/commit/a3339217a71215a0b1017a35a99b1b395a433884))
* remove unnecessary abstraction ([d976a11](http://github.com/prismicio/prismic-client/commit/d976a11e2188e1426df7795f1bd32f3c2978253e))
* revert tags refactor ([0240a18](http://github.com/prismicio/prismic-client/commit/0240a18103166fbaf0c866bccdba1a8f68065bfe))
* share code among tags and ref fns ([5c9e7ea](http://github.com/prismicio/prismic-client/commit/5c9e7ead0c47269e9df1da45048d6eb0a294a9c3))
* share fetch types ([a91a6c3](http://github.com/prismicio/prismic-client/commit/a91a6c3136057e38404cfd8066078fc0d4a19c91))
* use @prismicio/types where possible ([bb2b514](http://github.com/prismicio/prismic-client/commit/bb2b5149a9e8b647f93d25e63f53edb43788a52c))


### Chore

* **deps:** bump @prismicio/types ([a21a8fd](http://github.com/prismicio/prismic-client/commit/a21a8fdfc80b56fdda9321db9e2e1e482ffe0599))
* add .editorconfig ([535206a](http://github.com/prismicio/prismic-client/commit/535206a4c812718ce7bfe8db7c08aec4d64c0eb8))
* add code coverage via nyc ([7c2643b](http://github.com/prismicio/prismic-client/commit/7c2643b92f53600f866135a3848b369e5ead6d1e))
* add commitlint for conventional commits ([81107c0](http://github.com/prismicio/prismic-client/commit/81107c0056c967f9923e5e39e34df69069aa16c3))
* add examples ([4163944](http://github.com/prismicio/prismic-client/commit/4163944769e49e5b0c2463796022bdfc4dbff92c))
* add LICENSE.md ([b5e77a6](http://github.com/prismicio/prismic-client/commit/b5e77a6386aed57864b849871f11fb19d5bcfec0))
* add release scripts ([515722d](http://github.com/prismicio/prismic-client/commit/515722d75ef1276b7be3be63de20b33d7608b6bb))
* add simple example to README [skip ci] ([a384c8f](http://github.com/prismicio/prismic-client/commit/a384c8fda9e6f58213a51dbff25017cb023a93ee))
* add status to README [skip ci] ([865362e](http://github.com/prismicio/prismic-client/commit/865362ede32f610f6f3b262004afffc3227b8f1b))
* add test CI ([5856481](http://github.com/prismicio/prismic-client/commit/5856481fce1772d332db3e4e4cd7345fbde31944))
* add TODO to migrate to @prismicio/types when ready ([5f2c580](http://github.com/prismicio/prismic-client/commit/5f2c58047d5bae99b7c5f1063fda872c9aba4c49))
* add TODO to widen fetch type ([f8dcee9](http://github.com/prismicio/prismic-client/commit/f8dcee9608015b285957fbf529e6829d470af663))
* bootstrap v5 ([107ca1b](http://github.com/prismicio/prismic-client/commit/107ca1bc6e882bf667b4c926e20bbb106676aafe))
* fix nyc ([5bb1f23](http://github.com/prismicio/prismic-client/commit/5bb1f23cd9a82509e7e50a370c9ed4f32b557ef5))
* fix package.json version ([757a46d](http://github.com/prismicio/prismic-client/commit/757a46dc5de56333d25f044905f01151aa6df4cf))
* maintain dependencies ([0482128](http://github.com/prismicio/prismic-client/commit/0482128fc10b9a2612a5abb04b0bceeeb4e79ec2))
* mirror @prismicio/helpers project config ([155065e](http://github.com/prismicio/prismic-client/commit/155065eed7f8e0aac99646cbef650dc67b8ddda0))
* move git-simple-hooks config ([c17d070](http://github.com/prismicio/prismic-client/commit/c17d070214ce5c4bea74ae5fb38ef868fb6e2fe3))
* new README ([5694f3b](http://github.com/prismicio/prismic-client/commit/5694f3bc28907eeb3dbb67b44ce99168d3bf1f81))
* update dependencies ([508df11](http://github.com/prismicio/prismic-client/commit/508df11a0dccf157ea449512701f211fe11834d6))
* update dotfiles to match repo ([79017f4](http://github.com/prismicio/prismic-client/commit/79017f427eb8c2af44f4f091db482b4af6f72510))
* update IDEAS based on feedback ([8bd6754](http://github.com/prismicio/prismic-client/commit/8bd6754f7611abda8e20e3c72f5507874baa8762))
* upgrade dependencies ([7cb449a](http://github.com/prismicio/prismic-client/commit/7cb449afd5fae189ae4602f1509ff1694a151bce))
* upgrade dev dependencies ([cb167e4](http://github.com/prismicio/prismic-client/commit/cb167e4c615a32fb683f273067828d8295a4c46a))
