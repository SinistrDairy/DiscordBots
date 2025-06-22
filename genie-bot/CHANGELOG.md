# Changelog

## [1.9.17](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.16...Gv1.9.17) (2025-06-22)

## [1.9.16](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.15...Gv1.9.16) (2025-06-22)

## [1.9.15](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.14...Gv1.9.15) (2025-06-22)

## [1.9.14](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.11...Gv1.9.14) (2025-06-22)

## [1.9.13](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.12...Gv1.9.13) (2025-06-22)

## [1.9.12](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.11...Gv1.9.12) (2025-06-22)

## [1.9.11](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.10...Gv1.9.11) (2025-06-22)

## [1.9.10](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.9...Gv1.9.10) (2025-06-22)

## [1.9.9](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.8...Gv1.9.9) (2025-06-22)

## [1.9.8](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.7...Gv1.9.8) (2025-06-22)

## [1.9.7](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.6...Gv1.9.7) (2025-06-22)

## [1.9.6](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.5...Gv1.9.6) (2025-06-22)

## [1.9.5](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.4...Gv1.9.5) (2025-06-22)

## [1.9.4](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.3...Gv1.9.4) (2025-06-22)

## [1.9.3](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.2...Gv1.9.3) (2025-06-22)

## [1.9.2](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.1...Gv1.9.2) (2025-06-22)

## [1.9.1](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.9.0...Gv1.9.1) (2025-06-22)

# [1.9.0](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.8.0...Gv1.9.0) (2025-06-22)

# [1.8.0](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.7.0...Gv1.8.0) (2025-06-22)

# [1.7.0](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.6.0...Gv1.7.0) (2025-06-22)

# [1.6.0](https://github.com/SinistrDairy/DiscordBots/compare/Gv1.5.0...Gv1.6.0) (2025-06-22)

# 1.5.0 (2025-06-21)


### Bug Fixes

* change @sern/cli installation from global to dev dependency in deployment workflow ([6fc2e0f](https://github.com/SinistrDairy/DiscordBots/commit/6fc2e0f3cec14f9e5c3511dde7806fbeec54b87e))
* change @sern/cli installation to global in deployment workflow ([eb44308](https://github.com/SinistrDairy/DiscordBots/commit/eb4430808ff7ab1ac2804ae2fb3e23b39db42426))
* format deploy.yml for consistency and update package installation to use pnpm ([e795a3d](https://github.com/SinistrDairy/DiscordBots/commit/e795a3d49172861e2e446bd7089dfbe106f816df))
* **prisma:** remove invalid preview feature "esm" from generator configuration ([90fe304](https://github.com/SinistrDairy/DiscordBots/commit/90fe304ee9761161430fd93ed3f872941ca1e05d))
* **prisma:** update @prisma/client to version 6.10.1 and remove output path from generator configuration ([24d2f5d](https://github.com/SinistrDairy/DiscordBots/commit/24d2f5d2066deda056e3bc8119aea8dcbc5db3ed))
* rename command to active_threads and update description for clarity ([347b06a](https://github.com/SinistrDairy/DiscordBots/commit/347b06a9fe6382bc9598b03c12071e8c83453016))
* update @prisma/client version to use caret notation and add binaryTargets for Prisma client ([6e1eb75](https://github.com/SinistrDairy/DiscordBots/commit/6e1eb755ae7bbe0183df186f895139fb40069bd3))
* update image references in spray command for consistency ([dbe5fa8](https://github.com/SinistrDairy/DiscordBots/commit/dbe5fa8a0b0c25facf71ea5c8dc7d9305a35695c))


### Features

* add .release-it.json configuration for automated releases ([3143eee](https://github.com/SinistrDairy/DiscordBots/commit/3143eeecca97a8595a457aaf16feeb6b3e36be68))
* add image assets for spray command and update wg-profile image ([d62f597](https://github.com/SinistrDairy/DiscordBots/commit/d62f597f7beda00d46c5ca8add68c6a58d441351))
* add mongoose and related dependencies to package-lock.json; remove NODE_PATH and FORCE_COLOR from ambient.d.ts ([3766a00](https://github.com/SinistrDairy/DiscordBots/commit/3766a000807aa3d6dd80c082d703475be28a4563))
* add pnpm installation step to deployment workflow ([29e71b8](https://github.com/SinistrDairy/DiscordBots/commit/29e71b8582ff44e036deb43e6498a3711ff13f13))
* implement interactive script runner and multiple audit scripts for user profiles ([11fa020](https://github.com/SinistrDairy/DiscordBots/commit/11fa020e96d25273b49d3017c61f9d7c63fd39ef))
* update ambient.d.ts to include new environment variables; remove OLDPWD ([f73f290](https://github.com/SinistrDairy/DiscordBots/commit/f73f290ab1fe47074c336db3fe44ad40c06f8b8a))
* update deployment workflow to use pnpm for package installation ([d277d35](https://github.com/SinistrDairy/DiscordBots/commit/d277d35474aa31027da61c75040759817ad211ae))

## [1.4.3](https://github.com/SinistrDairy/DiscordBots/compare/v1.0.1...v1.4.3) (2025-06-21)


### Bug Fixes

* rename command to active_threads and update description for clarity ([347b06a](https://github.com/SinistrDairy/DiscordBots/commit/347b06a9fe6382bc9598b03c12071e8c83453016))

## [1.4.2](https://github.com/SinistrDairy/DiscordBots/compare/v1.4.1...v1.4.2) (2025-06-21)


### Bug Fixes

* update image references in spray command for consistency ([dbe5fa8](https://github.com/SinistrDairy/DiscordBots/commit/dbe5fa8a0b0c25facf71ea5c8dc7d9305a35695c))

## [1.4.1](https://github.com/SinistrDairy/DiscordBots/compare/v1.4.0...v1.4.1) (2025-06-20)

# [1.4.0](https://github.com/SinistrDairy/DiscordBots/compare/v1.3.3...v1.4.0) (2025-06-20)


### Features

* add image assets for spray command and update wg-profile image ([d62f597](https://github.com/SinistrDairy/DiscordBots/commit/d62f597f7beda00d46c5ca8add68c6a58d441351))

## [1.3.3](https://github.com/SinistrDairy/DiscordBots/compare/v1.3.2...v1.3.3) (2025-06-20)

## [1.3.2](https://github.com/SinistrDairy/DiscordBots/compare/v1.3.1...v1.3.2) (2025-06-19)


### Bug Fixes

* change @sern/cli installation from global to dev dependency in deployment workflow ([6fc2e0f](https://github.com/SinistrDairy/DiscordBots/commit/6fc2e0f3cec14f9e5c3511dde7806fbeec54b87e))

## [1.3.1](https://github.com/SinistrDairy/DiscordBots/compare/v1.3.0...v1.3.1) (2025-06-19)


### Bug Fixes

* change @sern/cli installation to global in deployment workflow ([eb44308](https://github.com/SinistrDairy/DiscordBots/commit/eb4430808ff7ab1ac2804ae2fb3e23b39db42426))

# [1.3.0](https://github.com/SinistrDairy/DiscordBots/compare/v1.2.0...v1.3.0) (2025-06-19)


### Features

* add pnpm installation step to deployment workflow ([29e71b8](https://github.com/SinistrDairy/DiscordBots/commit/29e71b8582ff44e036deb43e6498a3711ff13f13))

# [1.2.0](https://github.com/SinistrDairy/DiscordBots/compare/v1.1.0...v1.2.0) (2025-06-19)


### Bug Fixes

* format deploy.yml for consistency and update package installation to use pnpm ([e795a3d](https://github.com/SinistrDairy/DiscordBots/commit/e795a3d49172861e2e446bd7089dfbe106f816df))


### Features

* add .release-it.json configuration for automated releases ([3143eee](https://github.com/SinistrDairy/DiscordBots/commit/3143eeecca97a8595a457aaf16feeb6b3e36be68))
* update deployment workflow to use pnpm for package installation ([d277d35](https://github.com/SinistrDairy/DiscordBots/commit/d277d35474aa31027da61c75040759817ad211ae))

# 1.1.0 (2025-06-19)


### Bug Fixes

* **prisma:** remove invalid preview feature "esm" from generator configuration ([90fe304](https://github.com/SinistrDairy/DiscordBots/commit/90fe304ee9761161430fd93ed3f872941ca1e05d))
* **prisma:** update @prisma/client to version 6.10.1 and remove output path from generator configuration ([24d2f5d](https://github.com/SinistrDairy/DiscordBots/commit/24d2f5d2066deda056e3bc8119aea8dcbc5db3ed))
* update @prisma/client version to use caret notation and add binaryTargets for Prisma client ([6e1eb75](https://github.com/SinistrDairy/DiscordBots/commit/6e1eb755ae7bbe0183df186f895139fb40069bd3))


### Features

* add mongoose and related dependencies to package-lock.json; remove NODE_PATH and FORCE_COLOR from ambient.d.ts ([3766a00](https://github.com/SinistrDairy/DiscordBots/commit/3766a000807aa3d6dd80c082d703475be28a4563))
* update ambient.d.ts to include new environment variables; remove OLDPWD ([f73f290](https://github.com/SinistrDairy/DiscordBots/commit/f73f290ab1fe47074c336db3fe44ad40c06f8b8a))
