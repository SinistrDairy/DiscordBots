# Changelog

# [1.3.0](https://github.com/SinistrDairy/DiscordBots/compare/Ov1.2.0...Ov1.3.0) (2026-02-10)

# [1.2.0](https://github.com/SinistrDairy/DiscordBots/compare/Ov1.1.0...Ov1.2.0) (2026-02-09)

# [1.1.0](https://github.com/SinistrDairy/DiscordBots/compare/Ov1.0.5...Ov1.1.0) (2026-02-04)


### Bug Fixes

* add condition to deploy step and update notification trigger ([ae6af21](https://github.com/SinistrDairy/DiscordBots/commit/ae6af21248a08cc9e042afd8aca1031f6c575dcc))
* correct conditions for artifact download and deployment notification ([246ae29](https://github.com/SinistrDairy/DiscordBots/commit/246ae293f14b8be6aabbd92b882f77241e145db1))
* correct output variable names for bot change detection in deploy workflow ([c41b812](https://github.com/SinistrDairy/DiscordBots/commit/c41b812c710e49a6a0de085bd8ae24e9f61d77de))
* enhance deployment process by ensuring remote directory exists before syncing and restarting PM2 ([779b840](https://github.com/SinistrDairy/DiscordBots/commit/779b8408dc4f26d42bfb47481e72a666965d7a55))
* enhance Discord deployment notification with versioning and error handling ([1d857aa](https://github.com/SinistrDairy/DiscordBots/commit/1d857aaf0ede891f20d8512ab02d031aeab552b0))
* ensure remote directory exists before syncing and restarting PM2 ([e70ad94](https://github.com/SinistrDairy/DiscordBots/commit/e70ad9439ac2305257dcb9935e3a392f843922ed))
* exclude additional directories from deployment script ([0dacc7a](https://github.com/SinistrDairy/DiscordBots/commit/0dacc7a5a5714dfbeea14b2a4ae48b8df7c18801))
* improve artifact download step in deployment workflow ([2f5125b](https://github.com/SinistrDairy/DiscordBots/commit/2f5125b2ec07bdefdef205da8e5934e3ce10ad2f))
* streamline Node.js and pnpm setup in deployment workflow ([325b65e](https://github.com/SinistrDairy/DiscordBots/commit/325b65e07dc2af8c8b0724581713edec9eee3c04))
* update bot names in deployment and release workflows ([f3e7ef1](https://github.com/SinistrDairy/DiscordBots/commit/f3e7ef188f629a884626f8f644b3a18fb1cbae68))
* update checkout reference to use main branch instead of workflow run SHA ([76e6d2a](https://github.com/SinistrDairy/DiscordBots/commit/76e6d2affb053c5a7fee8385c67307637131b9bc))
* update conditions for checkout, release, and artifact upload steps ([0e4a891](https://github.com/SinistrDairy/DiscordBots/commit/0e4a891c14c6b6b35585cf22849921e87be9c1b0))
* update deployment script to sync full bot folder and exclude unnecessary files ([e166040](https://github.com/SinistrDairy/DiscordBots/commit/e16604037c99ef03e7a9d7a0ee92bf38a5328a2b))
* update embedSend command to use ctx.update for responses and clean up code ([32e5a53](https://github.com/SinistrDairy/DiscordBots/commit/32e5a53aeb5b51e13310cebfe887a789056dbffb))
* update SSH key secret reference in deployment workflow ([317b043](https://github.com/SinistrDairy/DiscordBots/commit/317b043f63accf0c75b07917606391c505184280))


### Features

* :sparkles: alphabetical listing of events ([2013ca9](https://github.com/SinistrDairy/DiscordBots/commit/2013ca9d1b38b2b1affafaa9d0de1087d9f39373))
* add debug step to log workflow_run.id during deployment ([022dc37](https://github.com/SinistrDairy/DiscordBots/commit/022dc3762c4e1db51d2005d2b60f9cc18cc627e4))
* add migration script for event data cleanup and emoji updates ([d34e27f](https://github.com/SinistrDairy/DiscordBots/commit/d34e27f7d948cbe25042e2b6f54cf3e5ae1eb9f5))

## [1.0.5](https://github.com/SinistrDairy/DiscordBots/compare/Ov1.0.4...Ov1.0.5) (2025-06-22)

## [1.0.4](https://github.com/SinistrDairy/DiscordBots/compare/Ov1.0.3...Ov1.0.4) (2025-06-22)

## [1.0.3](https://github.com/SinistrDairy/DiscordBots/compare/Ov1.0.2...Ov1.0.3) (2025-06-22)

## 1.0.2 (2025-06-22)


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
