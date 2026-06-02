# List of OpenTalk Frontend Environment Variables

[TOC]

The following is a comprehensive list of all environment variables usable in the Open Talk Frontend Container. These are written into the containers `config.js` file by the `entrypoint.sh` bash script during the containers start up sequence.

| Variable Name                            | Required | Default                                    | Description                                                                                                                                                                                           |
|------------------------------------------|----------|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CONTROLLER_HOST                          | yes      |                                            | The hostname and port under which the controller is reachable, do not include http here.                                                                                                              |
| INSECURE                                 | no       | false                                      | Whether the connections to the controller should be tls encrypted (http(s), ws(s)) WARNING! This is needed when connecting to a controller hosted on localhost without a TLS cert                     |
| BASE_URL                                 | yes      |                                            | Base URL of the frontend                                                                                                                                                                              |
| HELPDESK_URL                             | no       |                                            | The URL to the helpdesk                                                                                                                                                                               |
| CONTACT_SUPPORT_URL                      | no       |                                            | The URL to the contact support page                                                                                                                                                                   |
| ERROR_REPORT_ADDRESS                     | yes      |                                            | An email address, where the error reports should be send                                                                                                                                              |
| IS_BETA_RELEASE                          | no       | true                                       | This flag will show a beta badge for the application                                                                                                                                                  |
| BETA_BADGE_URL                           | no       |                                            | add a link to the Badge                                                                                                                                                                               |
| LIBRAVATAR_DEFAULT_IMAGE                 | no       | robohash                                   | defaultImage for the Avatar, possible values: '404', 'mm', 'monsterid', 'wavatar', 'retro', 'robohash', 'pagan'                                                                                       |
| OIDC_ISSUER                              | yes      |                                            | Authority URL (used for discovery using AUTHORITY/.well-known/openid-configuration) (Old name: KEYCLOAK_AUTHORITY)                                                                                    |
| OIDC_CLIENT_ID                           | no       | Frontend                                   | Client ID for the Authorization Code flow                                                                                                                                                             |
| USER_SURVEY_URL                          | no       |                                            | To enable user feedback collection configure a collection URL. (optional) & API KEY                                                                                                                   |
| USER_SURVEY_API_KEY                      | no       |                                            | To enable user feedback collection configure a collection URL. (optional) & API KEY                                                                                                                   |
| NDT_SERVER                               | yes      |                                            | NDT Server to use for the test                                                                                                                                                                        |
| ACTIVE_FEATURES                          | no       | { userSearch: true... }                    | An object with boolean values to activate specific features, possible values are:                                                                                                                     |
| FEATURE_USER_SEARCH                      | no       | { userSearch: true}                        | to enable dashboard feature of geting list of user for inviting them to the event                                                                                                                     |
| FEATURE_MUTE_USER                        | no       | { muteUsers: true}                         | to enable moderator option to mute user / users                                                                                                                                                       |
| FEATURE_RESET_HANDRAISES                 | no       | { resetHandraises: true}                   | to enable moderator option to reset users' raised hands                                                                                                                                               |
| FEATURE_ADD_USER                         | no       | { addUser: false}                          | under construction                                                                                                                                                                                    |
| FEATURE_JOIN_WITHOUT_MEDIA               | no       | { joinWithoutMedia: false}                 | if is set to true, it will prevent user to join conference with audio/video on                                                                                                                        |
| FEATURE_E2E_ENCRYPTION                   | no       | { e2eEncryption: false }                   | to enable e2e encryption option when creating a meeting                                                                                                                                               |
| VIDEO_BACKGROUNDS                        | no       | [see here](#default-video-backgrounds)     | An array with a configuration of the background (Example: `[{ altText: 'OpenTalk', url: '/assets/videoBackgrounds/elevate-bg.png', thumb: '/assets/videoBackgrounds/thumbs/elevate-bg-thumb.png',}]`) |
| SIGN_OUT_REDIRECT_URI                    | no       | /dashboard                                 | Uri to redirect the client after signing out frontend                                                                                                                                                 |
| CHANGE_PASSWORD_ACTIVE                   | no       | false                                      | enable the reset password button in the dashboard profile settings                                                                                                                                    |
| CHANGE_PASSWORD_URL                      | no       | null                                       | set the reset password url for password button in dashboard profile settings                                                                                                                          |
| IMPRINT_URL                              | no       |                                            | The URL to the imprint page                                                                                                                                                                           |
| DATA_PROTECTION_URL                      | no       |                                            | The URL to the data protection page                                                                                                                                                                   |
| ACCOUNT_MANAGEMENT_URL                   | no       |                                            | The account management url for use the dashboard menu, if provider.active is true                                                                                                                     |
| DISALLOW_CUSTOM_DISPLAY_NAME             | no       | false                                      | Disable editing of display name in profile and lobby page                                                                                                                                             |
| SENTRY_DSN                               | no       |                                            | Adding a valid sentry dsn will activate error logging                                                                                                                                                 |
| WAITING_ROOM_DEFAULT_VALUE               | yes      | Frontend { waitingRoomDefaultValue: true } | to enable waiting room switch by default                                                                                                                                                              |
| SUPPRESS_BROWSER_COMPATIBILITY_INFO      | no       | false                                      | Suppress the browser compatibility notification  default                                                                                                                                              |
| LIVEKIT_E2EE_SALT                        | no       |                                            | data added to the passphrase to make end-to-end encryption a bit more secure                                                                                                                          |
| LIVEKIT_PREFERRED_VIDEO_CODEC            | no       |                                            | Preferred video codec. Use 'vp9' or 'av1' to enable instant quality switching (SVC). Automatically configures 'vp8' as a fallback for compatibility with older hardware                               |
| MEETING_INACTIVITY_MEDIA_DISABLE_SECONDS | no       | 120                                        | Number of seconds before media automatically turns off when we are left alone in the room.                                                                                                            |
| MEETING_INACTIVITY_WARNING_SECONDS       | no       | 900                                        | Number of seconds before user is warned about being alone in the room.                                                                                                                                |
| MEETING_INACTIVITY_TERMINATION_SECONDS   | no       | 3600                                       | Number of seconds before user is kicked out of the room due to the inactivity.                                                                                                                        |
| SPACEDECK_ENABLED                        | no       | true                                       | use spacedeck instead of excalidraw as whitboard                                                                                                                                                      |

## Adding new Video Background Images

Copy the images to the `/usr/share/nginx/html/assets/videoBackgrounds` folder of the webapp container and the thumbnails to the `/thumbs` subfolder. The images have to have a resolution of **1280x720** and the thumbs **128x72**
You then have to set the environment variable VIDEO_BACKGROUNDS as described below. If you don't set the variable, the following default will be used

### Default Video Backgrounds

```json
[
  {
    "altText": "Elevate",
    "url": "/assets/videoBackgrounds/elevate-bg.png",
    "thumb": "/assets/videoBackgrounds/thumbs/elevate-bg-thumb.png"
  },
  {
    "altText": "Living room",
    "url": "/assets/videoBackgrounds/ot1.png",
    "thumb": "/assets/videoBackgrounds/thumbs/ot1-thumb.png"
  },
  {
    "altText": "Conference room",
    "url": "/assets/videoBackgrounds/ot2.png",
    "thumb": "/assets/videoBackgrounds/thumbs/ot2-thumb.png"
  },
  {
    "altText": "Beach at sunset",
    "url": "/assets/videoBackgrounds/ot3.png",
    "thumb": "/assets/videoBackgrounds/thumbs/ot3-thumb.png"
  },
  {
    "altText": "Boat on shore",
    "url": "/assets/videoBackgrounds/ot4.png",
    "thumb": "/assets/videoBackgrounds/thumbs/ot4-thumb.png"
  },
  {
    "altText": "Pink living room",
    "url": "/assets/videoBackgrounds/ot5.png",
    "thumb": "/assets/videoBackgrounds/thumbs/ot5-thumb.png"
  },
  {
    "altText": "Bookshelf",
    "url": "/assets/videoBackgrounds/ot6.png",
    "thumb": "/assets/videoBackgrounds/thumbs/ot6-thumb.png"
  },
  {
    "altText": "Bookshelves surround an open door",
    "url": "/assets/videoBackgrounds/ot7.png",
    "thumb": "/assets/videoBackgrounds/thumbs/ot7-thumb.png"
  }
]
```
