[TOC]

# OpenTalk-Web Monorepo

This includes:

- a fluent_conv fork [@opentalk/fluent_conv](packages/fluent_conv)
- a i18next-fluent fork [@opentalk/i18next-fluent](packages/i18next-fluent)
- the OpenTalk web client [@opentalk/opentalk](app)

# Getting Started

## Dependencies

You need a running controller (<https://git.opentalk.dev/opentalk/backend/services/controller>) and keycloak instance.

## Docker

see [docker docs](./ci/README.md)

## Developer mode

We have a super secret developer mode. You can activate it by manipulating the local storage in the browser dev tools. This adds debugging options to the `MoreMenu.tsx` which is located below your own video under the `...` button.

### Chrome

- Open the developer tools (F12)
- Go to the `Application` tab
- Open the local storage element
- Click inside to add a new key
- Set the key to `devMode`
- Set the value to `true`

### Firefox

- Open the developer tools (F12)
- Go to the `Storage` tab
- Open the local storage element
- Click inside to add a new key
- Set the key to `devMode`
- Set the value to `true`

### Environment variables used in the container

| Variable Name            | Required | Default                                           | Description                                                                                                                                                                                           |
| ------------------------ | -------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CONTROLLER_HOST          | yes      |                                                   | The hostname and port under which the controller is reachable, do not include http here.                                                                                                              |
| INSECURE                 | no       | false                                             | Whether the connections to the controller should be tls encrypted (http(s), ws(s)) WARNING! This is needed when connecting to a controller hosted on localhost without a TLS cert                     |
| BASE_URL                 | yes      |                                                   | Base URL of the frontend                                                                                                                                                                              |
| HELPDESK_URL             | yes      |                                                   | The URL to the helpdesk                                                                                                                                                                               |
| CONTACT_SUPPORT_URL      | yes      |                                                   | The URL to the contact support page                                                                                                                                                                               |
| ERROR_REPORT_ADDRESS     | yes      |                                                   | An email address, where the error reports should be send                                                                                                                                              |
| IS_BETA_RELEASE           | no       | true                                              | This flag will show a beta badge for the application                                                                                                                                                  |
| BETA_BADGE_URL           | no       |                                                   | add a link to the Badge                                                                                                                                                                               |
| LIBRAVATAR_DEFAULT_IMAGE | no       | robohash                                          | defaultImage for the Avatar, possible values: '404', 'mm', 'monsterid', 'wavatar', 'retro', 'robohash', 'pagan'                                                                                       |
| OIDC_ISSUER              | yes      |                                                   | Authority URL (used for discovery using AUTHORITY/.well-known/openid-configuration) (Old name: KEYCLOAK_AUTHORITY)                                                                                    |
| OIDC_CLIENT_ID           | no       | Frontend                                          | Client ID for the Authorization Code flow                                                                                                                                                             |
| USER_SURVEY_URL          | no       |                                                   | To enable user feedback collection configure a collection URL. (optional) & API KEY                                                                                                                   |
| USER_SURVEY_API_KEY      | no       |                                                   | To enable user feedback collection configure a collection URL. (optional) & API KEY                                                                                                                   |
| NDT_SERVER               | yes      |                                                   | NDT Server to use for the test                                                                                                                                                                        |
| ACTIVE_FEATURES          | no       | { userSearch: true... }     | An object with boolean values to activate specific features, possible values are: |
| FEATURE_USER_SEARCH      | no       | { userSearch: true}                               | to enable dashboard feature of geting list of user for inviting them to the event |
| FEATURE_MUTE_USER        | no       | { muteUsers: true}                                | to enable moderator option to mute user / users |
| FEATURE_RESET_HANDRAISES | no       | { resetHandraises: true}                          | to enable moderator option to reset users' raised hands |
| FEATURE_ADD_USER         | no       | { addUser: false}                                 | under construction |
| FEATURE_JOIN_WITHOUT_MEDIA       | no       | { joinWithoutMedia: false}                        | if is set to true, it will prevent user to join conference with audio/video on |
| FEATURE_SHARED_FOLDER | no | { sharedFolder: false } | activates shared folders |
| FEATURE_E2E_ENCRYPTION | no | { e2eEncryption: false } | to enable e2e encryption option when creating a meeting |
| VIDEO_BACKGROUNDS        | no       | [see here](#default-video-backgrounds)                                                | An array with a configuration of the background (Example: `[{ altText: 'OpenTalk', url: '/assets/videoBackgrounds/elevate-bg.png', thumb: '/assets/videoBackgrounds/thumbs/elevate-bg-thumb.png',}]`) |
| SIGN_OUT_REDIRECT_URI    | no       | /dashboard                             | Uri to redirect the client after signing out frontend |
| CHANGE_PASSWORD_ACTIVE           | no       | false                              | enable the reset password button in the dashboard profile settings |
| CHANGE_PASSWORD_URL       | no       | null                               | set the reset password url for password button in dashboard profile settings |
| IMPRINT_URL             | no      |                                                   | The URL to the imprint page |
| DATA_PROTECTION_URL             | no      |                                                   | The URL to the data protection page |
| ACCOUNT_MANAGEMENT_URL             | no      |                                                   | The account management url for use the dashboard menu, if provider.active is true |
| DISALLOW_CUSTOM_DISPLAY_NAME  | no  | false                                             | Disable editing of display name in profile and lobby page |
| SENTRY_DSN  | no  |                                              | Adding a valid sentry dsn will activate error logging |
| WAITING_ROOM_DEFAULT_VALUE | yes | Frontend { waitingRoomDefaultValue: true } | to enable waiting room switch by default                                          |
| LIVEKIT_E2EE_SALT        |  no      |                                                    | data added to the passphrase to make end-to-end encryption a bit more secure |

### Adding new Video Background Images

Copy the images to the `/assets/videoBackgrounds` folder and the thumbnails to the `/thumbs` subfolder. The images have to have a resolution of **1280x720** and the thumbs **128x72**

#### Developers

For developers this folder is in the `public` folder of the repository. Add the image to the `entrypoint.sh` file to the `DEFAULT_VIDEO_BACKGROUNDS` variable to add it to the deployment or the videoBackgrounds property of the `config.js` if you run it locally.

#### DevOps

For devops it's in the `/usr/share/nginx/html/` folder of the webapp container. You then have to set the environment variable VIDEO_BACKGROUNDS as described below. If you don't set the variable, the following default will be used

#### Default Video Backgrounds

```json
[
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
]
```

## Use pnpm to build a local version

### Local system setup

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

## Build local version

First setup your local system as described in the chapter `Local system setup`.

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
		waitingRoomDefaultValue: true
	}
}

```

After that you need a webserver to serve the files from the /app/dist directory.

# Development

## To install & run

First setup your local system as described in the chapter `Local system setup`.

To install all dependencies run: `pnpm install` in this project directory.

After that you can run `pnpm start`, see further down.

You need to add the same config to app/public/config.js as in the chapter `Build local version`.

## Guidelines

This repository is a monorepo. Libraries here are considered unstable and their inclusion should ease their development.
Libraries, except the app, will be moved to a separate repository and released to NPM once they are mature enough.

### Development

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

## Add svg icons

Refer to `createIconComponents.sh`  helper script to create React components out of svg's.
Note: as vite has problems importing svg's as react components, we use vite-plugin-svgr, which is used for that,
      The plugin requires `?react` suffix for filenames, while importing an svg in a dedicated *.tsx component file.
      If you use the script mentioned above, it will manage that for you.

## Build the container image

The `Dockerfile` for the app is located in `ci/Dockerfile`.

To build the image, execute in the root of the repository:

```bash
 docker build -f ci/Dockerfile . --tag <your tag>
```

## Git Hooks

By default, the git hooks configuration of the projects is being managed via [husky](https://typicode.github.io/husky/).

They need to be activated once, via `pnpm prepare` script.

If, after activation, you want to skip git hooks for some reason, refer to [Skipping Git Hooks](https://typicode.github.io/husky/how-to.html#skipping-git-hooks).

If you need more granularity or miss some particular checks, you can refer to `example/git_hooks/Instuctions.md`.

## E2E Tests

This project can run several end2end tests against different instances with different user

### How to run local

1. run ```npx playwright install```
2. run ```pnpm install```
3. create `.env` file in the `e2e` directory
4. fill in your variables (look at `.env-example` or in the table)
5. run ```pnpm playwright test```

Have a look in to the [Commands](#commands) section

### Writing Tests

- for local testing, create an .env file like the .env-example and fill it with your data
- tests will be created in the `tests` folder
- separate tests in different file depending on what should be tested
- keep tests clean and simple

### Environment Variables

| Variable Name         | Required | Default       | Description                                          |
| --------------------- | -------- | ------------- | -----------------------------------------------------|
| INSTANCE_URL          | yes      |               | The instance Baseurl against the tests should be run |
| USERNAME              | yes      |               | Username for login                                   |
| USER_EMAIL            | yes      |               | Email for login                                      |
| PASSWORD              | yes      |               | Password for login                                   |
| ALL_TESTS             | no       | false         | Per default just smoke tests are running, if all tests should run set this variable to `true` |

### Commands
Inside that directory, you can run several commands:

Run the end-to-end test <br>
```
pnpm playwright test
```

Starts the interactive UI mode. <br>
```
pnpm playwright test --ui
```

Runs the tests only on Desktop Chrome.<br>
```
pnpm playwright test --project=chromium
```

Runs the tests in a specific file.<br>
```
pnpm playwright test example
```

Runs the tests in debug mode.
```
pnpm playwright test --debug
```

Auto generate tests with Codegen.<br>
```
pnpm playwright codegen
```

We suggest that you begin by typing:
```
pnpm playwright test
```

## Livekit: setup

### Required Services

- Livekit Server
- Controller & dependent services (Keycloak, Database, ...)
- Web

### Setup

#### Livekit Server

[Install the CLI via](https://github.com/livekit/livekit?tab=readme-ov-file#install)

##### macOS

```bash
brew install livekit
```

##### Linux

```bash
curl -sSL https://get.livekit.io | bash
```

#### Start

Start via `livekit-server --dev` and copy the returned "API Key" and "API Secret", which we need for the Controller config.

The output should look like:

```bash
INFO livekit server/main.go:208 starting in development mode
INFO livekit server/main.go:211 no keys provided, using placeholder keys {"API Key": "devkey", "API Secret": "secret"}
INFO livekit routing/interfaces.go:110 using single-node routing
INFO livekit service/server.go:243 starting LiveKit server {"portHttp": 7880, "nodeID": "ND_SQ86Z2W79ukr", "nodeIP": "192.168.178.148", "version": "1.7.0", "bindAddresses": ["127.0.0.1", "::1"], "rtc.portTCP": 7881, "rtc.portUDP": {"Start":7882,"End":0}}
```

---

#### Controller and Dependent Services

##### Start Dependent Services

```bash
cd testing-environment
docker compose up -d
```

##### Controller

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
