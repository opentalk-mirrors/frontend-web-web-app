# OpenTalk-Web Monorepo Developer Guide

[TOC]

This repository includes:

- a fluent_conv fork [@opentalk/fluent_conv](packages/fluent_conv)
- a i18next-fluent fork [@opentalk/i18next-fluent](packages/i18next-fluent)
- the OpenTalk web client [@opentalk/opentalk](app)

## Getting Started

Fork the repository and clone it.

You will need `node` and `pnpm` installed on your system.

First install `node`. We recommend using a `node` version manager like [`nvm`](https://github.com/nvm-sh/nvm/blob/master/README.md) or [`n`](https://www.npmjs.com/package/n).
You should install at least `node v18`

Afterwards you need to enable `pnpm` via `corepack`.
`corepack` is a built-in feature of `node`, which is used for managing package managers

To enable `pnpm` run
`corepack enable pnpm`

IMPORTANT: If you installed Node.js using Homebrew, you'll need to install corepack separately:
`brew install corepack`

The `packageManager` field in the `package.json` will instruct `corepack` to always use a specific version on that project.

## To install & run

To install all dependencies run: `pnpm install` in this project directory.

You need to add the same config to `app/public/config.js` as in the following chapter [Build local version](#build-local-version).

## Build local version

First setup your local system as described in the chapter [Getting started](#getting-started).

After `pnpm` is installed you can build local version of the app

Run `pnpm install && pnpm build`

Place the following file with correct values into app/public/config.js, without the comments

```javascript
window.config = {
    // The hostname and port under which the controller is reachable, do not include http here.
    "controller": "localhost:8000",
    // Whether the connections to the controller should be tls encrypted (http(s), ws(s))
    "insecure": true,
    // Base URL of the frontend
    "baseUrl": "http://localhost:3000",
    // OIDC Config
    beta: {
      isBeta: '${IS_BETA_RELEASE:-true}', // show Badge
      badgeUrl: "${BETA_BADGE_URL}" // add a link to the Badge
    },
    provider: {
      // indicates if we are are in the provider context
      active: false,
      // The account management url for the dashboard menu, if active is true
      accountManagementUrl: '${ACCOUNT_MANAGEMENT_URL}',
    },
    // defaultImage for the Avatar, possible values: '404', 'mm', 'monsterid', 'wavatar', 'retro', 'robohash', 'pagan',
    "libravatarDefaultImage": 'robohash',
    // disable edditing the display name field in the dashboard profile and lobby page
    disallowCustomDisplayName: '${DISALLOW_CUSTOM_DISPLAY_NAME}',
    // amount of seconds before media is turned off for remaining participant in the room
    meetingInactivityMediaDisableSeconds: "${MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS}",
    // amount of seconds before only participant in the room is warned about room inactivity
    meetingInactivityWarningSeconds: "${MEETING_INACTIVITY_WARNING_SECONDS}",
    // amount of seconds before only participant is forced out of the room due to the inactivity
    meetingInactivityTerminationSeconds: "${MEETING_INACTIVITY_TERMINATION_SECONDS}",

    // OIDC Config
    "oidcConfig": {
        // Authority URL (used for discovery using AUTHORITY/.well-known/openid-configuration)
        "authority": "https://keycloak.local/auth/realms/OPENTALK",
        // Client ID for the Authorization Code flow
        "clientId": "Frontend",
        // Scope
        "scope": "openid profile email",
        // Path under the base_url to which the OP redirects after sign out
        "signOutRedirectUri": "/dashboard",
        // Path under the base_url to which the OP redirects
        "redirectPath": "/auth/callback",
        // Path under the base_url to which the OP redirects in a popup
        "popupRedirectPath": "/auth/popup_callback",
    },
    // Flag and Url to the authority to change the own password
    changePassword: {
        active: true,
        url: '/my-test-change-password-url'
    },
    // Speed-Test configuration, see also https://github.com/m-lab/ndt7-js and https://www.measurementlab.net/blog/ndt7-introduction/
    "speedTest": {
      // NDT Server to use for the test
      "ndtServer": 'localhost:10443',
      // js worker file to use for the download test
      "ndtDownloadWorkerJs": '/workers/ndt7-download-worker.js',
      // js worker file to use for the upload test
      "ndtUploadWorkerJs": '/workers/ndt7-upload-worker.js',
    },
    "livekit": {
      "e2eeSalt": "e2e_salt_key",
    },
    // To enable user feedback collection configure a collection URL. (optional) & API KEY
    "userSurveyUrl":"https://your-survey.collection/endpoint",
    "userSurveyApiKey: 'api_key',
    "videoBackgrounds": [
      {
        altText: 'Elevate',
        url: '/assets/videoBackgrounds/elevate-bg.png',
        thumb: '/assets/videoBackgrounds/thumbs/elevate-bg-thumb.png',
      },
      {
        altText: 'Living room',
        url: '/assets/videoBackgrounds/ot1.png',
        thumb: '/assets/videoBackgrounds/thumbs/ot1-thumb.png',
      },
      {
        altText: 'Conference room',
        url: '/assets/videoBackgrounds/ot2.png',
        thumb: '/assets/videoBackgrounds/thumbs/ot2-thumb.png',
      },
      {
        altText: 'Beach at sunset',
        url: '/assets/videoBackgrounds/ot3.png',
        thumb: '/assets/videoBackgrounds/thumbs/ot3-thumb.png',
      },
      {
        altText: 'Boat on shore',
        url: '/assets/videoBackgrounds/ot4.png',
        thumb: '/assets/videoBackgrounds/thumbs/ot4-thumb.png',
      },
      {
        altText: 'Pink living room',
        url: '/assets/videoBackgrounds/ot5.png',
        thumb: '/assets/videoBackgrounds/thumbs/ot5-thumb.png',
      },
      {
        altText: 'Bookshelf',
        url: '/assets/videoBackgrounds/ot6.png',
        thumb: '/assets/videoBackgrounds/thumbs/ot6-thumb.png',
      },
      {
        altText: 'Bookshelves surround an open door',
        url: '/assets/videoBackgrounds/ot7.png',
        thumb: '/assets/videoBackgrounds/thumbs/ot7-thumb.png',
      }
    ],
    // Configure the maximum video bandwidth.
    "maxVideoBandwidth":600000,
    "errorReportAddress": 'report@opentalk.eu',
    // Activate error logging for frontend
    glitchtip: {
      dsn: '${SENTRY_DSN}',
    },
    // Available moderator's features, can be enabled by setting feature to true
    "features": {
      "userSearch": true,
      "muteUsers": true,
      "resetHandraises": true,
      "addUser": true,
      "joinWithoutMedia": false,
      "sharedFolder": false,
      "e2eEncryption": false,
    },
    settings: {
      waitingRoomDefaultValue: true,
      suppressBrowserCompatibilityInfo: false,
    }
}

```

After that you need a webserver to serve the files from the /app/dist directory. Or you can run a dev server using

```bash
pnpm start
```

From the root directory. Check the following [dependencies](#dependencies) chapter to see what else you need to get up and running.

### Dependencies

You need a running controller (<https://git.opentalk.dev/opentalk/backend/services/controller>) and keycloak instance. These can be hosted online but you can and should also host them locally. See the [Controller and Dependent Services](#controller-and-dependent-services) chapter.

### Developer mode

We have a super secret developer mode. You can activate it by manipulating the local storage in the browser dev tools. This adds debugging options to the `MoreMenu.tsx` which is located below your own video under the `...` button.

#### Chrome

- Open the developer tools (F12)
- Go to the `Application` tab
- Open the local storage element
- Click inside to add a new key
- Set the key to `devMode`
- Set the value to `true`

#### Firefox

- Open the developer tools (F12)
- Go to the `Storage` tab
- Open the local storage element
- Click inside to add a new key
- Set the key to `devMode`
- Set the value to `true`

## Guidelines

This repository is a monorepo. Libraries here are considered unstable and their inclusion should ease their development.
Libraries, except the app, will be moved to a separate repository and released to NPM once they are mature enough.

### Hot Module Replacement

`@opentalk` packages/libraries are not a part of the app.
The Hot Module Replacement (HMR) mechanism will not work by default on `pnpm start`.
If you work on a package and want to speed-up the development use special HMR script `pnpm start:hot`.

#### Commands

In this directory, you can run:

### `pnpm start`

Builds libraries and calls `pnpm start` in `@opentalk/opentalk`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits in the app.\
You will also see any lint errors in the console.
If you plan to modify one of the libraries in this monorepo, execute a watcher inside of that library. See [Development](Development) for details information how to that.

### `pnpm start:hot`

Similar to `pnpm start` with extended hot reload functionality for the `@opentalk` packages.

### `pnpm test`

Builds libraries and calls `pnpm test` in `@opentalk/opentalk`
Launches the test runner in the interactive watch mode.\

### `pnpm build`

Builds libraries and calls `pnpm build` in `@opentalk/opentalk`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `pnpm build:profiling`

Builds libraries and calls `pnpm build:profiling` in `@opentalk/opentalk`, this build
can be used for profiling the application.

## Adding svg icons

Refer to `createIconComponents.sh`  helper script to create React components out of svg's.
Note: as vite has problems importing svg's as react components, we use vite-plugin-svgr, which is used for that,
      The plugin requires `?react` suffix for filenames, while importing an svg in a dedicated *.tsx component file.
      If you use the script mentioned above, it will manage that for you.

## Building the container image

The `Dockerfile` for the app is located in `ci/Dockerfile`.

To build the image, execute in the root of the repository:

```bash
 docker build -f ci/Dockerfile . --tag <your tag>
```

You can read more about it in the [docker docs](./ci/README.md)

### Environment variables used in the container

You can find a list of environment variables in [/ci/environment-variables.md](/ci/environment-variables.md)

### Adding new Video Background Images

Copy the images to the `app/public/assets/videoBackgrounds` folder and the thumbnails to the `/thumbs` subfolder. The images have to have a resolution of **1280x720** and the thumbs **128x72**
Add the image to the `ci/entrypoint.sh` file to the [DEFAULT_VIDEO_BACKGROUNDS](/ci/environment-variables.md#default-video-backgrounds) variable to add it to the deployment or the `videoBackgrounds` property of the `config.js` if you run it locally.

## Git Hooks

By default, the git hooks configuration of the projects is being managed via [husky](https://typicode.github.io/husky/).

They need to be activated once, via `pnpm prepare` script.

If, after activation, you want to skip git hooks for some reason, refer to [Skipping Git Hooks](https://typicode.github.io/husky/how-to.html#skipping-git-hooks).

If you need more granularity or miss some particular checks, you can refer to `example/git_hooks/Instuctions.md`.

## Livekit: setup

### Required Services

- Livekit Server
- Controller & dependent services (Keycloak, Database, ...)
- Web

### Livekit Server

[Install the CLI via](https://github.com/livekit/livekit?tab=readme-ov-file#install)

#### macOS

```bash
brew install livekit
```

#### Linux

```bash
curl -sSL https://get.livekit.io | bash
```

#### Start

Start via `livekit-server --dev` and copy the returned "API Key" and "API Secret", which we need for the Controller config.

The output should look like this:

```bash
INFO livekit server/main.go:208 starting in development mode
INFO livekit server/main.go:211 no keys provided, using placeholder keys {"API Key": "devkey", "API Secret": "secret"}
INFO livekit routing/interfaces.go:110 using single-node routing
INFO livekit service/server.go:243 starting LiveKit server {"portHttp": 7880, "nodeID": "ND_SQ86Z2W79ukr", "nodeIP": "192.168.178.148", "version": "1.7.0", "bindAddresses": ["127.0.0.1", "::1"], "rtc.portTCP": 7881, "rtc.portUDP": {"Start":7882,"End":0}}
```

---

## Controller and Dependent Services

### Docker-compose

You can checkout a docker-compose stack in the [testing-environment](https://git.opentalk.dev/opentalk/backend/tools/testing-environment) repo. And then start it using the following command.

```bash
docker compose up -d
```

The stack contains all the services and modules of opentalk excluding the controller. If you want to run the full stack including the controller you can use the following command:

```bash
docker compose --profile backend up -d
```

However you can also start the controller [locally](#running-the-controller-locally) for example if you need to develop on the controller.

### Running the Controller locally

Add the following section to the controller config (`controller/config.toml`). The provided values are the defaults from Livekit if the server was started in dev mode. If not, take the required values from the first 4 lines of the log output.

```toml
[livekit]
api_key = "devkey"
api_secret = "secret"
public_url = "http://localhost:7880"
service_url = "http://localhost:7880"
```

Start the controller via

```bash
cargo run
```
