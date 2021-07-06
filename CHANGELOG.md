# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [6.0.0-alpha.8](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.7...v6.0.0-alpha.8) (2021-07-06)


### Bug Fixes

* support unauthorized repository response ([022d278](https://github.com/prismicio/prismic-javascript/commit/022d278fcb89ecc098e9729b5bf67ef87a9f8259))
* use access_token URL parameter over Authorization header ([#182](https://github.com/prismicio/prismic-javascript/issues/182)) ([4c44109](https://github.com/prismicio/prismic-javascript/commit/4c44109b8b4428341e6becc021b1888230e7e961))


### Chore

* **deps:** update examples dependencies ([1c8f2b2](https://github.com/prismicio/prismic-javascript/commit/1c8f2b2a73dc56aa055efdb7a0c8c10ada3e428f))

## [6.0.0-alpha.7](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.6...v6.0.0-alpha.7) (2021-07-03)


### Bug Fixes

* use `in` predicate for getByIDs ([fc522a2](https://github.com/prismicio/prismic-javascript/commit/fc522a22665f0ba461884c30ad5fb032b7910724))

## [6.0.0-alpha.6](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.5...v6.0.0-alpha.6) (2021-07-03)


### Chore

* update dependencies ([2a18d2e](https://github.com/prismicio/prismic-javascript/commit/2a18d2e52d78734dd2405f83677c6b221149910c))
* update dependencies ([eb9b13e](https://github.com/prismicio/prismic-javascript/commit/eb9b13e81bb6754597fa8df8948d0fafcd1ea042))

## [6.0.0-alpha.5](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.4...v6.0.0-alpha.5) (2021-06-27)


### Bug Fixes

* use @prismicio/helpers for resolvePreviewURL ([2db45d2](https://github.com/prismicio/prismic-javascript/commit/2db45d2eb67c335ea88838937f9e00696cd11b3a))

## [5.1.0](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.2...v5.1.0) (2021-06-11)

## [6.0.0-alpha.4](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.3...v6.0.0-alpha.4) (2021-06-23)


### Bug Fixes

* support global fetch if provided explicitly ([d22ae21](https://github.com/prismicio/prismic-javascript/commit/d22ae21483f967b4366d501f7e98934d6ee668bb))

## [6.0.0-alpha.3](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.2...v6.0.0-alpha.3) (2021-06-23)


### Features

* support Route Resolver with routes param ([063b5ee](https://github.com/prismicio/prismic-javascript/commit/063b5eec0399efd834c4c6142586b1cd54f44054))


### Bug Fixes

* resolve issue using global fetch ([83c6290](https://github.com/prismicio/prismic-javascript/commit/83c6290ec79a4f5bbecc1d2d9308816300101138)), closes [#180](https://github.com/prismicio/prismic-javascript/issues/180)
* throw if an invalid fetch function is given ([ec01c59](https://github.com/prismicio/prismic-javascript/commit/ec01c598c8a79049f843e9d47a3abd83043dd469))


### Refactor

* simplify SimpleTTLCache and add internal docs ([f255a27](https://github.com/prismicio/prismic-javascript/commit/f255a270ea1b7dc55979d2111ece9fedafb922c3))

## [6.0.0-alpha.2](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.1...v6.0.0-alpha.2) (2021-06-11)


### Features

* add wrapper errors ([3dfba0f](https://github.com/prismicio/prismic-javascript/commit/3dfba0f4fb013421db58217cb02a810dab2b5fcc)), closes [#177](https://github.com/prismicio/prismic-javascript/issues/177)
* return API error message on failed requests ([8de2873](https://github.com/prismicio/prismic-javascript/commit/8de287399fc919c097cd4d8a0bbc30f302092d51))


### Chore

* rename license file ([f496697](https://github.com/prismicio/prismic-javascript/commit/f4966979dbd02cd37a737ca982b1e6d2bb36ccc7))

## [6.0.0-alpha.1](https://github.com/prismicio/prismic-javascript/compare/v6.0.0-alpha.0...v6.0.0-alpha.1) (2021-06-07)


### Features

* [wip] cache master ref for a short period ([b73a7d0](https://github.com/prismicio/prismic-javascript/commit/b73a7d0ceb08d967f0552de7e1e38022243d3545))
* support cached refs for releases ([7a46513](https://github.com/prismicio/prismic-javascript/commit/7a46513b3e8595395e8bc57414431ea01131c2f0))


### Bug Fixes

* use cjs export to support non-esm ([63219e8](https://github.com/prismicio/prismic-javascript/commit/63219e8343552bed78fe4bdcf65470ea7cb9e885))


### Chore

* add test dir format script ([e4594f5](https://github.com/prismicio/prismic-javascript/commit/e4594f575d6b50be32381a00ff3ce9426bb70194))


### Documentation

* add internal comments ([61d4c14](https://github.com/prismicio/prismic-javascript/commit/61d4c149d7c99871edd8e803f39e6586d366f210))

## [5.0.0](https://github.com/prismicio/prismic-javascript/compare/v5.0.0-alpha.1...v5.0.0) (2021-05-27)


### Chore

* **release:** 5.0.0 fix ([ed15e96](https://github.com/prismicio/prismic-javascript/commit/ed15e963a0a05b7b8a276c14d0ff35c594ee36aa))

## [6.0.0-alpha.0](http://github.com/prismicio/prismic-javascript/compare/v5.0.0-alpha.1...v6.0.0-alpha.0) (2021-05-27)

## [5.0.0-alpha.1](http://github.com/prismicio/prismic-javascript/compare/v5.0.0-alpha.0...v5.0.0-alpha.1) (2021-05-27)


### Chore

* fix release script ([23bcc88](http://github.com/prismicio/prismic-javascript/commit/23bcc88bad570502f04e0e1fb997001cd0cc4584))

## [5.0.0-alpha.0](http://github.com/prismicio/prismic-javascript/compare/v4.0.0...v5.0.0-alpha.0) (2021-05-27)


### Features

* add "query from" methods and replace ref with release ([7d894a5](http://github.com/prismicio/prismic-javascript/commit/7d894a5a6e4512bc84d8fb1d8c57d72ccc895b56))
* add getAllByIDs ([297a70c](http://github.com/prismicio/prismic-javascript/commit/297a70ca53b9d7c9b5d40a0faf2e6c65c22c1a60))
* add getTags ([164c8d5](http://github.com/prismicio/prismic-javascript/commit/164c8d5972c6b7f0ad12ede8b1d27921b865f474))
* add initial client ([ee886bd](http://github.com/prismicio/prismic-javascript/commit/ee886bde37673dc25b6545d8ce2f971c81e026cd))
* add release-specific methods (wip) [skip ci] ([4f66405](http://github.com/prismicio/prismic-javascript/commit/4f6640565e854abdfadd4c3fb3577c49bd0a7d21))
* add resolvePreviewUrl ([53ed409](http://github.com/prismicio/prismic-javascript/commit/53ed409dc5418162a79f668fc6346c41d2c1a266))
* export HttpRequestLike ([96f1e1e](http://github.com/prismicio/prismic-javascript/commit/96f1e1ee4e66eb3bc72b520d15ca1af4bcb26c36))
* export predicates under root package ([18d742c](http://github.com/prismicio/prismic-javascript/commit/18d742c4e6476a22e23b9d860a50734b303c23a6))
* expose HTTPError ([fdf370a](http://github.com/prismicio/prismic-javascript/commit/fdf370aeda78f21a0b87dda699cabf41012298a1))
* restore form type ([c38e067](http://github.com/prismicio/prismic-javascript/commit/c38e067f74629ffa0a434de09e0d87499b6541ec))
* restore ref methods and scope release methods ([1ff8f72](http://github.com/prismicio/prismic-javascript/commit/1ff8f72b0c74847d87e23bce84dc666e5ac0808f))
* use normalized HTTPError ([0eb9fab](http://github.com/prismicio/prismic-javascript/commit/0eb9fabe98b46db73fc31847213935a787b23a85))


### Bug Fixes

* asc orderings direction should not be included in query ([46431fd](http://github.com/prismicio/prismic-javascript/commit/46431fde2e8c28c7bbc7b2439dd343e4f1560f34))
* clone responses for better cache support ([67ef2ba](http://github.com/prismicio/prismic-javascript/commit/67ef2ba909024e27ca418e8c9134e61eca848400))
* correct typings and predicate generation fn ([c81da44](http://github.com/prismicio/prismic-javascript/commit/c81da442129b5d001e6defe6d8bee9a39ab9951f))
* export types using `export type` ([a1fad4a](http://github.com/prismicio/prismic-javascript/commit/a1fad4ab0278f9501e6a35e56bc89dd6739cba30))
* getByIds should return paginated results ([fb94561](http://github.com/prismicio/prismic-javascript/commit/fb9456125da0721a80295e2f556cf4b07b368e70))
* ignore nullish ordering param ([51e53b7](http://github.com/prismicio/prismic-javascript/commit/51e53b7304a4b804f14e0cc4b41448598fcec997))
* use correct uid predicate for getByUID ([5735d28](http://github.com/prismicio/prismic-javascript/commit/5735d28e48645f2bf83970a3fd3d359f1bfe0e11))
* widen types of fetch-related APIs ([412205b](http://github.com/prismicio/prismic-javascript/commit/412205b9bf14473ab5a85988e5b986b09544d5e3))


### Documentation

* add comment to server-usage example ([b04d359](http://github.com/prismicio/prismic-javascript/commit/b04d35934c42b752776c22f75ecc001148369053))
* add custom-caching README ([ec26d6a](http://github.com/prismicio/prismic-javascript/commit/ec26d6a958cf55a77f5345f26622f1052895ae91))
* add examples ([62004a0](http://github.com/prismicio/prismic-javascript/commit/62004a0e72ff8368890dc83bf0aa9bb6cb86b79b))
* add multiple-languages example ([9d9592d](http://github.com/prismicio/prismic-javascript/commit/9d9592dbab0c2c34142adefaddb0c11cb4cdd1b5))
* add server-usage example ([c4b2e2f](http://github.com/prismicio/prismic-javascript/commit/c4b2e2f5228819dcb70f2be0407a8adf669a18be))
* add TSDoc for all client methods ([01cd9d9](http://github.com/prismicio/prismic-javascript/commit/01cd9d993ea4c685f4d04ec87a68fa553fe08a61))
* add TSDocs for client instance properties ([15d0187](http://github.com/prismicio/prismic-javascript/commit/15d0187be1aa4eeb337e6958044a7667eb4ad487))
* add TSDocs to remaining functions ([38052d2](http://github.com/prismicio/prismic-javascript/commit/38052d28a00b87966704d34b1ef5b87cba611da1))
* add with-typescript example ([5c7f396](http://github.com/prismicio/prismic-javascript/commit/5c7f396c350f25c9fb371dbf45a5a0f4a30fcbc6))
* describe internal predicate functions [skip ci] ([e4fed22](http://github.com/prismicio/prismic-javascript/commit/e4fed221e5f1b5c7562772079ed7233daa5be52a))
* fix badges ([7fd6541](http://github.com/prismicio/prismic-javascript/commit/7fd6541b73cbc985212798448f72436355fa8e5b))
* fix orderings parameter sketch ([0f43762](http://github.com/prismicio/prismic-javascript/commit/0f43762b5f8b99158370b999f56110aa3b5c4adf))
* more descriptive getResolvedRefString comment [skip ci] ([d9ae04b](http://github.com/prismicio/prismic-javascript/commit/d9ae04b4dfe830291cef0b7c0a38f7766b1928ea))
* new kit name typos fixes [#152](http://github.com/prismicio/prismic-javascript/issues/152) ([873bd58](http://github.com/prismicio/prismic-javascript/commit/873bd58befd26e2a3e8f6dca09d07c16303f00dd))
* refactor custom-caching example ([9dd2daa](http://github.com/prismicio/prismic-javascript/commit/9dd2daae2fd5839838b7ac60bd725bc51a293ff8))
* remove inaccurate docs ([974d160](http://github.com/prismicio/prismic-javascript/commit/974d160f99d9e12fa99e6c1df85f562837ec31d8))
* replace remaining usage of [@see](http://github.com/see) with [@link](http://github.com/link) ([02feadc](http://github.com/prismicio/prismic-javascript/commit/02feadc5b0c766562d0f03b2b98faac39ecacbc6))
* update comment wording ([3535c32](http://github.com/prismicio/prismic-javascript/commit/3535c32f73b34524bb88ab443342251eac70ca1c))
* update README ([1a9c5b8](http://github.com/prismicio/prismic-javascript/commit/1a9c5b8ee8f915e05d4ad8fd896364e28341acb1))
* use {[@link](http://github.com/link)} and [@type](http://github.com/type)Param ([2d2a2c5](http://github.com/prismicio/prismic-javascript/commit/2d2a2c545cb80fc0f43e06627d4f15bd3a212da8))


### Refactor

* assume the cookie store is always a string ([5d563b0](http://github.com/prismicio/prismic-javascript/commit/5d563b004bdcb131292282ed7549bb324e0111f2))
* client ([f0c5206](http://github.com/prismicio/prismic-javascript/commit/f0c5206e8fe8f10fb4a415fa81e26dd68fba02f5))
* explicitly export types ([b5b34fe](http://github.com/prismicio/prismic-javascript/commit/b5b34feb58b7efcfd0c249c5fb2ad7609700bb6d))
* export all in root ([2bdfd3f](http://github.com/prismicio/prismic-javascript/commit/2bdfd3ff8f40897b7606f00846a5a75b55a1f7bd))
* internal predicate fns for readability ([731a444](http://github.com/prismicio/prismic-javascript/commit/731a444e81d9506328e0b36f6710c5c3e8922638))
* remove ref methods ([a333921](http://github.com/prismicio/prismic-javascript/commit/a3339217a71215a0b1017a35a99b1b395a433884))
* remove unnecessary abstraction ([d976a11](http://github.com/prismicio/prismic-javascript/commit/d976a11e2188e1426df7795f1bd32f3c2978253e))
* revert tags refactor ([0240a18](http://github.com/prismicio/prismic-javascript/commit/0240a18103166fbaf0c866bccdba1a8f68065bfe))
* share code among tags and ref fns ([5c9e7ea](http://github.com/prismicio/prismic-javascript/commit/5c9e7ead0c47269e9df1da45048d6eb0a294a9c3))
* share fetch types ([a91a6c3](http://github.com/prismicio/prismic-javascript/commit/a91a6c3136057e38404cfd8066078fc0d4a19c91))
* use @prismicio/types where possible ([bb2b514](http://github.com/prismicio/prismic-javascript/commit/bb2b5149a9e8b647f93d25e63f53edb43788a52c))


### Chore

* **deps:** bump @prismicio/types ([a21a8fd](http://github.com/prismicio/prismic-javascript/commit/a21a8fdfc80b56fdda9321db9e2e1e482ffe0599))
* add .editorconfig ([535206a](http://github.com/prismicio/prismic-javascript/commit/535206a4c812718ce7bfe8db7c08aec4d64c0eb8))
* add code coverage via nyc ([7c2643b](http://github.com/prismicio/prismic-javascript/commit/7c2643b92f53600f866135a3848b369e5ead6d1e))
* add commitlint for conventional commits ([81107c0](http://github.com/prismicio/prismic-javascript/commit/81107c0056c967f9923e5e39e34df69069aa16c3))
* add examples ([4163944](http://github.com/prismicio/prismic-javascript/commit/4163944769e49e5b0c2463796022bdfc4dbff92c))
* add LICENSE.md ([b5e77a6](http://github.com/prismicio/prismic-javascript/commit/b5e77a6386aed57864b849871f11fb19d5bcfec0))
* add release scripts ([515722d](http://github.com/prismicio/prismic-javascript/commit/515722d75ef1276b7be3be63de20b33d7608b6bb))
* add simple example to README [skip ci] ([a384c8f](http://github.com/prismicio/prismic-javascript/commit/a384c8fda9e6f58213a51dbff25017cb023a93ee))
* add status to README [skip ci] ([865362e](http://github.com/prismicio/prismic-javascript/commit/865362ede32f610f6f3b262004afffc3227b8f1b))
* add test CI ([5856481](http://github.com/prismicio/prismic-javascript/commit/5856481fce1772d332db3e4e4cd7345fbde31944))
* add TODO to migrate to @prismicio/types when ready ([5f2c580](http://github.com/prismicio/prismic-javascript/commit/5f2c58047d5bae99b7c5f1063fda872c9aba4c49))
* add TODO to widen fetch type ([f8dcee9](http://github.com/prismicio/prismic-javascript/commit/f8dcee9608015b285957fbf529e6829d470af663))
* bootstrap v5 ([107ca1b](http://github.com/prismicio/prismic-javascript/commit/107ca1bc6e882bf667b4c926e20bbb106676aafe))
* fix nyc ([5bb1f23](http://github.com/prismicio/prismic-javascript/commit/5bb1f23cd9a82509e7e50a370c9ed4f32b557ef5))
* fix package.json version ([757a46d](http://github.com/prismicio/prismic-javascript/commit/757a46dc5de56333d25f044905f01151aa6df4cf))
* maintain dependencies ([0482128](http://github.com/prismicio/prismic-javascript/commit/0482128fc10b9a2612a5abb04b0bceeeb4e79ec2))
* mirror @prismicio/helpers project config ([155065e](http://github.com/prismicio/prismic-javascript/commit/155065eed7f8e0aac99646cbef650dc67b8ddda0))
* move git-simple-hooks config ([c17d070](http://github.com/prismicio/prismic-javascript/commit/c17d070214ce5c4bea74ae5fb38ef868fb6e2fe3))
* new README ([5694f3b](http://github.com/prismicio/prismic-javascript/commit/5694f3bc28907eeb3dbb67b44ce99168d3bf1f81))
* update dependencies ([508df11](http://github.com/prismicio/prismic-javascript/commit/508df11a0dccf157ea449512701f211fe11834d6))
* update dotfiles to match repo ([79017f4](http://github.com/prismicio/prismic-javascript/commit/79017f427eb8c2af44f4f091db482b4af6f72510))
* update IDEAS based on feedback ([8bd6754](http://github.com/prismicio/prismic-javascript/commit/8bd6754f7611abda8e20e3c72f5507874baa8762))
* upgrade dependencies ([7cb449a](http://github.com/prismicio/prismic-javascript/commit/7cb449afd5fae189ae4602f1509ff1694a151bce))
* upgrade dev dependencies ([cb167e4](http://github.com/prismicio/prismic-javascript/commit/cb167e4c615a32fb683f273067828d8295a4c46a))
