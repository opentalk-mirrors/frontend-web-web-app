# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2025-08-22

[2.6.0]: https://git.opentalk.dev/opentalk/frontend/web/web-app/-/compare/v2.5.4...v2.6.0

### 🚀 New features

- Add screen share options panel ([!2010](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2010))
- Show accept/decline for pending meetings in home page ([!2296](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2296), [#2695](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2695))
- Add config to suppress browser compability info ([!2318](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2318))
- Support message chunking ([!2337](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2337))
- Add wiretapping user notification ([!2363](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2363))
- Use AudioContext for EchoTest ([!2371](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2371))
- (chat) Add debounce to setting last seen timestamp per scope ([!2383](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2383))
- Toggle guest links feature by flag from controller ([!2285](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2285))

### 🐛 Bug fixes

- Own BackgroundBlur for livekit ([!2106](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2106), [#2648](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2648))
- Error on pop-up screen share with Firefox ([!2191](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2191))
- Remove unnecessary props from switch ([!2192](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2192), [#2616](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2616))
- Log error only setProcessor ([!2213](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2213))
- Constrain events for screenshare update ([!2213](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2213))
- Glitchtip server upgrade to version 4.x ([!2157](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2157))
- Hide whiteboard button box is too large ([!2221](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2221))
- Fetch only not declined meetings in home page ([!2187](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2187), [#2667](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2667))
- Create a recording have a misleading error message ([!2237](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2237))
- Styling of favorite meeting card ([!2245](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2245), [#2681](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2681))
- Translation of meeting form errors ([!2261](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2261))
- (pipeline) Renovate corepack version mismatch ([!2266](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2266))
- TrackRef is missing ([!2269](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2269))
- Closing breakout room while users are entering leads to infinite reconnect loop ([!2271](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2271))
- Pin state on toggling fullscreen mode was gone ([!2281](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2281))
- Incorrect tooltip message on disabled microphone button ([!2282](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2282))
- Transfer correct media state when joining waiting room from lobby ([!2290](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2290))
- Ending screenshare was not reseting to the old view ([!2298](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2298))
- Meeting note where still shown after room was cleaned up ([!2302](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2302))
- Caching last layout on screenshare ([!2312](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2312))
- Keyboard interaction for participant menu ([!2309](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2309))
- Push2talk is still enabled after permission dialog ([!2295](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2295))
- Accessibility of select layout view menu ([!2314](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2314))
- (a11y) Add aria-label and autoFocus for more menu ([!2315](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2315), [#2700](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2700))
- Talking stick list in breakout rooms ([!2330](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2330))
- Unsubscribe hidden participant video tracks ([!2326](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2326))
- Display recording consent after 2. start ([!2324](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2324))
- Error handling for invalid meeting link ([!2340](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2340))
- Local video flicker ([!2291](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2291))
- Deactivates the smoke test in scheduled pipelines ([!2365](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2365))
- Ensure chat settings are updated when chat is disabled on join ([!2364](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2364))
- Media state after breakout room transition ([!2367](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2367))
- Selector warning after receiving a chat message ([!2369](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2369))
- Audio activation in lobby ([!2371](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2371))
- (popout) Ensure media streams work reliably and avoid triggering eavesdropping notification ([!2382](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2382))
- Show active speaker in full screen when no participant is selected ([!2373](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2373))
- Correct download buffer type ([!2388](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2388))
- Cleanup browser check ([!2079](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2079))
- Ensure guest links use invite codes for authorized users ([!2392](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2392))
- Change typescript module resolution ([!2368](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2368))
- Vite specify Plugin type ([!2307](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2307))
- (waiting-room) Re-enable media buttons after being moved ([!2407](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2407))
- (popout) Suppress eavesdropping notification ([!2406](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2406))

### 📚 Documentation

- Extract admin doc from readme ([!2211](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2211))

### 🔨 Refactor

- (middleware) Extract `login.fulfilled` logic from `apiMiddleware` to `startUserListeners` ([!2120](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2120))

### 📦 Dependencies

- (deps) Update dependency @vitejs/plugin-react to ^4.5.1 ([!2149](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2149))
- (deps) Update pnpm to v10.11.1 ([!2148](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2148))
- (deps) Update dependency @babel/core to ^7.27.4 ([!2144](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2144))
- (deps) Update mcr.microsoft.com/playwright docker tag to v1.53.0 ([!2171](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2171))
- (deps) Update eslint-plugins ([!2143](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2143))
- (deps) Update dependency knip to ^5.61.0 ([!2136](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2136))
- (deps) Update dependency msw to ^2.10.2 ([!2141](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2141))
- (deps) Update dependency react-i18next to ^15.5.3 ([!2177](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2177))
- (deps) Update dependency eslint-plugin-jest to ^28.13.5 ([!2178](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2178))
- (deps) Update dependency @playwright/test to ^1.53.0 ([!2170](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2170))
- (deps) Update livekit ([!2106](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2106))
- (deps) Update @types ([!2135](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2135))
- (deps) Update sentry-javascript monorepo to ^9.29.0 ([!2133](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2133))
- (deps) Update alpine/helm docker tag to v3.18.2 ([!2145](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2145))
- (deps) Update dependency knip to ^5.61.1 ([!2188](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2188))
- (deps) Update eslint-plugins ([!2181](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2181))
- (deps) Update dependency @types/node to ^22.15.32 ([!2186](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2186))
- (deps) Update dependency @vitejs/plugin-react to ^4.5.2 ([!2164](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2164))
- (deps) Update sentry-javascript monorepo to ^9.30.0 ([!2190](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2190))
- (deps) Update dependency @types/jest to v30 ([!2185](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2185))
- (deps) Update dependency lint-staged to ^16.1.2 ([!2182](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2182))
- (deps) Update dependency context-filter-polyfill to ^0.3.23 ([!2163](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2163))
- (deps) Update dependency @types/lodash to ^4.17.18 ([!2194](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2194))
- (deps) Update dependency i18next-browser-languagedetector to ^8.2.0 ([!2173](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2173))
- (deps) Update pnpm to v10.12.1 ([!2161](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2161))
- (deps) Update dependency knip to ^5.61.2 ([!2198](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2198))
- (deps) Update dependency web-vitals to ^5.0.3 ([!2142](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2142))
- (deps) Update dependency eslint-plugin-jest to v29 ([!2202](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2202))
- (deps) Update dependency react-router-dom to v7.6.2 ([!2151](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2151))
- (deps) Update dependency livekit-client to v2.13.6 ([!2206](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2206))
- (deps) Update pnpm to v10.12.4 ([!2215](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2215))
- (deps) Update livekit ([!2208](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2208))
- (deps) Update jest monorepo to v30 ([!2165](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2165))
- (deps) Update dependency vite to v7 ([!2225](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2225))
- (deps) Update material-ui monorepo ([!2147](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2147))
- (deps) Update node.js to v22.17.0 ([!2227](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2227))
- (deps) Update jest monorepo to ^30.0.4 ([!2253](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2253))
- (deps) Update dependency emoji-picker-react to ^4.12.3 ([!2240](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2240))
- (deps) Update pnpm to v10.13.1 ([!2272](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2272))
- (deps) Update @types ([!2226](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2226))
- (deps) Update dependency knip to ^5.62.0 ([!2246](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2246))
- (deps) Update dependency @vitejs/plugin-react to ^4.7.0 ([!2217](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2217))
- (deps) Update dependency vite to ^7.0.5 ([!2255](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2255))
- (deps) Update dependency i18next to ^25.3.2 ([!2303](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2303))
- (deps) Update dependency emoji-picker-react to ^4.13.2 ([!2301](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2301))
- (deps) Update dependency react-i18next to ^15.6.0 ([!2305](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2305))
- (deps) Update eslint-plugins ([!2205](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2205))
- (deps) Update dependency dotenv to v17 ([!2308](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2308))
- (deps) Update dependency snakecase-keys to ^8.1.0 ([!2306](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2306))
- (deps) Update dependency vite to ^7.0.6 ([!2320](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2320))
- (deps) Update jest monorepo to ^30.0.5 ([!2316](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2316))
- (deps) Update dependency react-i18next to ^15.6.1 ([!2321](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2321))
- (deps) Update dependency dotenv to ^17.2.1 ([!2327](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2327))
- (deps) Update dependency @mui/x-date-pickers to v8 ([!1966](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1966))
- (deps) Update dependency prettier to ^3.6.2 ([!2216](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2216))
- (deps) Update eslint-plugins ([!2317](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2317))
- (deps) Update dependency globals to ^16.3.0 ([!2278](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2278))
- (deps) Update dependency @emotion/styled to ^11.14.1 ([!2231](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2231))
- (deps) Update linkifyjs monorepo to ^4.3.2 ([!2329](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2329))
- (deps) Update dependency @playwright/test to ^1.54.1 ([!2203](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2203))
- (deps) Update mcr.microsoft.com/playwright docker tag to v1.54.1 ([!2204](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2204))
- (deps) Update dependency msw to ^2.10.4 ([!2267](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2267))
- (deps) Update node.js to v22.17.1 ([!2299](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2299))
- (deps) Update babel monorepo to ^7.28.0 ([!2234](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2234))
- (deps) Update dependency react-router-dom to v7.7.1 ([!2239](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2239))
- (deps) Update alpine/helm docker tag to v3.18.4 ([!2214](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2214))
- (deps) Update testing-library monorepo ([!2338](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2338))
- (deps) Update @types ([!2339](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2339))
- (deps) Update dependency snakecase-keys to v9 ([!2322](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2322))
- (deps) Update pnpm to v10.14.0 ([!2343](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2343))
- (deps) Update dependency @mui/x-date-pickers to ^8.9.2 ([!2341](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2341))
- (deps) Update dependency web-vitals to ^5.1.0 ([!2346](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2346))
- (deps) Update dependency lint-staged to ^16.1.4 ([!2351](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2351))
- (deps) Update dependency yup to ^1.7.0 ([!2349](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2349))
- (deps) Update dependency typescript-eslint to ^8.39.0 ([!2356](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2356))
- (deps) Update dependency vite to ^7.1.1 ([!2366](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2366))
- (deps) Update dependency react-router-dom to v7.8.0 ([!2372](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2372))
- (deps) Update dependency i18next to ^25.3.4 ([!2378](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2378))
- (deps) Update livekit ([!2274](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2274))
- (deps) Update material-ui monorepo ([!2358](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2358))
- (deps) Update eslint-plugins ([!2376](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2376))
- (deps) Update dependency @types/node to ^22.17.1 ([!2375](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2375))
- (deps) Update node.js to v22.18.0 ([!2354](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2354))
- (deps) Update dependency lint-staged to ^16.1.5 ([!2374](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2374))
- (deps) Update eslint-plugins ([!2379](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2379))
- (deps) Update dependency @types/react to ^19.1.10 ([!2380](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2380))
- (deps) Update dependency vite to ^7.1.2 ([!2381](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2381))
- (deps) Update dependency msw to ^2.10.5 ([!2385](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2385))
- (deps) Update dependency i18next to ^25.3.5 ([!2386](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2386))
- (deps) Update dependency typescript to ^5.9.2 ([!2345](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2345))
- (deps) Update dependency i18next to ^25.3.6 ([!2389](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2389))
- (deps) Update dependency @types/node to ^22.17.2 ([!2391](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2391))
- (deps) Lock file maintenance ([!2079](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2079))
- (deps) Update dependency bowser to ^2.12.0 ([!2377](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2377))
- (deps) Update dependency @vitejs/plugin-react to v5 ([!2368](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2368))
- (deps) Update sentry-javascript monorepo to v10 ([!2344](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2344))
- (deps) Update dependency @testing-library/jest-dom to ^6.7.0 ([!2384](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2384))
- (deps) Update dependency livekit-client to v2.15.5 ([!2387](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2387))
- (deps) Update dependency @sentry/vite-plugin to v4 ([!2307](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2307))
- (deps) Update dependency vite to ^7.1.3 ([!2400](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2400))
- (deps) Update dependency @vitejs/plugin-react to ^5.0.1 ([!2399](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2399))
- (deps) Update dependency react-router-dom to v7.8.1 ([!2393](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2393))
- (deps) Update dependency typescript-eslint to ^8.40.0 ([!2398](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2398))
- (deps) Update dependency @livekit/protocol to ^1.40.0 ([!2394](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2394))
- (deps) Update pnpm to v10.15.0 ([!2401](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2401))
- (deps) Update dependency @mui/x-date-pickers to ^8.10.2 ([!2404](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2404))
- (deps) Update dependency @testing-library/jest-dom to ^6.8.0 ([!2408](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2408))
- (deps) Update dependency knip to ^5.63.0 ([!2409](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2409))
- (deps) Update dependency react-i18next to ^15.7.1 ([!2403](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2403))
- (deps) Update dependency i18next to ^25.4.0 ([!2402](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2402))

### ⚙ Miscellaneous

- Remove shared folder extra steps ([!2112](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2112))
- Remove unused track-processors package ([!2106](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2106))
- Improve the type-safety of the meeting form validation schema ([!2166](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2166))
- Unit tests for meeting form utils ([!2100](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2100))
- (types) Fix all typing problems ([!2210](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2210))
- Add testing library plugin and fix linting errors ([!2218](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2218))
- Deleted unused hook ([!2233](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2233))
- Improve tests for the meeting header ([!2097](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2097))
- Add unit tests for legal vote token clipboard ([!2152](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2152))
- Increase coverage of waiting view tests ([!2153](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2153))
- Add jest fail on console ([!2229](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2229))
- Unit tests and refactoring of the date time section ([!2251](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2251))
- Unit tests MeetingForm and ActionButtons ([!2259](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2259))
- Improve general unit tests ([!2160](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2160))
- Improve test coverage of asset table ([!2263](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2263))
- Improve test coverage for progress bar component ([!2262](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2262))
- (justfile) Add justfile for release creation ([!2270](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2270))
- Read shared folder enabled from tariff modules ([!2325](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2325))
- Reduce code duplication in stream_updated handler ([!2360](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2360))
- Remove e2e tests steps from ci and add manual trigger step for the new e2e tests repo ([!2361](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2361))
- (tooling) Switch from jest to vitest ([!2350](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2350))
- Move room creation into middlware ([!2162](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2162))
- Bump browser minimum versions ([!2410](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2410))

### Ci

- Remove unneeded secret cleanup step ([!2201](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2201))

### Test

- (e2e) Adding e2e tests for TC_002_Dashboard_Help_User Manual ([!2048](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2048))
- (e2e) Disable 79_Dashboard_Settings & MeetingRoom - adjust participant view TC2 & TC5 ([!2140](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2140))
- (e2e) Adding e2e tests for TC_005_Dashboard_Home_Plan ([!2089](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2089))
- (e2e) Tc_001_user_manual ([!2139](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2139))
- (e2e) Fix flaky e2e tests ([!2154](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2154))
- (e2e) Tc_002_keyboard shortcuts ([!2146](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2146))
- (e2e) Refactoring navigation to external page ([!2158](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2158))
- (e2e) Add gitlab integration for test suite ([!2004](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2004))
- (e2e) Fix nightly run condition and cleanup variables ([!2179](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2179))
- (e2e) Merge pipeline jobs browser and browser-nightly ([!2180](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2180))
- (e2e) Tc_003_report a bug ([!2155](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2155))
- (e2e) Change locator to getByRole ([!2159](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2159))
- (e2e) Tc_001_meeting room_as moderator_timer ([!2176](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2176))
- (e2e) Tc_001_meetingRoom_meeting credentials summary ([!2168](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2168))
- (e2e) Tc_002_meeting room_as moderator_timer_duration_session duration ([!2183](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2183))
- (e2e) Improve waiting after deleting of meeting ([!2196](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2196))
- (e2e) Improve waiting on HomePage ([!2193](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2193))
- (e2e) Tc_001_url route in Dashboard + Meeting Room ([!2207](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2207))
- (e2e) Tc_003_meeting room_as moderator_timer_create timer_with different duration, with title ([!2197](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2197))
- (e2e) Meeting room debriefing for moderator and registered user ([!2184](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2184))
- (e2e) Meeting room debriefing for moderator ([!2199](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2199))
- (e2e) Meeting room debriefing for moderator and registered user ([!2228](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2228))
- (e2e) Meeting room debriefing for moderator and registered user ([!2228](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2228))
- (e2e) Meeting room debriefing for end of the conference ([!2200](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2200))
- (e2e) Refactored tc_002_meeting room_as moderator_timer_duration_session duration ([!2224](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2224))
- (e2e) Tc_004_meeting room_as moderator_timer_create timer_without title ([!2212](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2212))
- (unit) Add useTabs tests and refactor the hook ([!2230](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2230))
- (unit) Add useNavigateToHome unit tests ([!2247](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2247))
- (e2e) Refactoring page objects - meeting details ([!2241](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2241))
- (unit) Add MeetingNotesView tests ([!2250](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2250))
- (e2e) Refactoring debriefing moderator tool ([!2232](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2232))
- (e2e) Refactoring talking stick moderator tool ([!2238](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2238))
- (e2e) Refactoring page objects - timer moderator tool ([!2242](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2242))
- (e2e) Refactoring view options ([!2249](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2249))
- (e2e) Tc_005_meeting room ask participants if they are ready toggle button as on/off ([!2219](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2219))
- (e2e) Remove skip firefox and add missing assertion to accessibility TC 002 & 003 ([!2169](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2169))
- (e2e) Refactor wait for guestlink function ([!2195](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2195))
- (e2e) Refactoring meeting helpers to close webkitpopup ([!2243](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2243))
- (unit) Add tests for useLocale ([!2257](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2257))
- (unit) Add unit tests for Participant and the fragments ([!2256](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2256))
- (unit) Add unit tests for LocalVideo ([!2265](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2265))
- (e2e) IsFullScreen fixes in meeting room burger menu ([!2276](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2276))
- (e2e) Refactoring page objects - burger menu ([!2236](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2236))
- (e2e) Fix dashboard_home › tc_001_dashboard_home_start test new ([!2279](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2279))
- (e2e) Tc_006_meeting room_as moderator_timer_mark me as done button+stop timer button ([!2248](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2248))
- (e2e) Using api to change language ([!2260](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2260))
- (e2e) Fix accessibility_general > tc_001_dashboard-getThreeDotMenuOfMeeting ([!2280](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2280))
- (e2e) Fix accessibility_general > tc_001_dashboard-uniqueMeetingStartButton ([!2286](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2286))
- (e2e) Tc_001_accessibility ([!2289](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2289))
- (e2e) Refactoring e2e test for tc_001_dashboard_settings_general ([!2252](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2252))
- (e2e) Tc_001_dashboard_legal_imprint & data protection ([!2156](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2156))
- (e2e) Fix selectors in MeetingRoom > ViewOptionsPage ([!2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2328))
- (e2e) Delete workaround for local setup ([!2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2328))
- (e2e) Bring moderators meeting room to front after joining as guest ([!2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2328))
- (e2e) Delete selection of already sekected option ([!2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2328))
- (e2e) Improve locator ([!2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2328))
- (e2e) Delete not needed awaits ([!2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2328))
- (e2e) Simplify test ([!2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2328))
- (e2e) Refactoring e2e test for tc_003_dashboard_settings_account option ([!2283](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2283))
- (e2) Fix locators for date fields on MeetingPlanningPage ([!2353](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2353))
- (e2e) Skip check for Create shared folder button ([!2352](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2352))
- (e2e) Fix accessibility-general-TC_001_Dashboard-navigateToHomePage ([!2331](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2331))

## [2.5.0] - 2025-05-29

[2.5.0]: https://git.opentalk.dev/opentalk/frontend/web/web-app/-/compare/v2.4.4...v2.5.0

### 🚀 New features

- Add user locale to sentry report ([!1908](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1908))
- Add accept button in meeting popover ([!1869](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1869), [#2432](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2432))
- (settings_dialog) Implement meeting settings dialog ([!1877](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1877), [#1915](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1915))
- Accessibility statement link in burger menu ([!1883](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1883))
- (legal-vote) Add `ProtocolInconsistent` to `VoteInvalidReason` ([!2007](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2007))
- Add innovafone remote control ([!1962](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1962))
- Setup custom logger ([!1979](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1979))

### 🐛 Bug fixes

- Middleware calls duplicated in media slice ([!1873](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1873))
- Prevent duplicate actions after breakout room start ([!1903](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1903))
- Display voting results ([!1905](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1905))
- Prevent user duplication in breakout rooms ([!1899](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1899))
- Correct field name for end-to-end encryption flag ([!1894](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1894))
- Handle participants in deleted rooms ([!1782](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1782), [#1748](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1748))
- Meeting notes participants list after join ([!1914](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1914))
- Ui issues after camera permission denial ([!1850](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1850), [#2598](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2598))
- A11y of the event conflict dialog ([!1925](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1925))
- A11y change text fields from disabled to readonly ([!1902](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1902))
- Scrollbar not showing last message in the viewport ([!1890](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1890))
- Hover and focus contrast on participant video buttons ([!1882](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1882))
- Hang up is causing conference context allready closed ([!1955](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1955))
- Duration aria label not reading plural minutes ([!1958](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1958))
- Unexpected styling of readonly text fields ([!1953](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1953))
- Missing on going timer title for joined participant ([!1938](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1938))
- Meeting deletion button clickable during submittion ([!1936](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1936))
- Keyboard navigation not working in mobile drawer ([!1959](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1959))
- Meeting recurrence select label overlaps on focus ([!1935](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1935))
- Preserve participant thumbnail position ([!1916](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1916))
- Preserve aspect ratio when activating background blur on android phones ([!1710](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1710), [#2212](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2212))
- Apply background effects when local video is not rendered ([!1710](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1710), [#2212](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2212))
- Background Image should now get cropped instead of scaled ([!1710](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1710), [#2212](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2212))
- Fullscreen mode for mobile and tablet viewports ([!1967](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1967))
- Display real dates for a particular event instance ([!1974](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1974))
- Mark CONTACT_SUPPORT_URL as optional ([!1982](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1982))
- Breakout notification countdown on inactive tab ([!1937](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1937))
- Remove extra space from top and bottom of meeting info button ([!1989](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1989))
- Prevent incorrect request upon room join ([!1987](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1987))
- Participant is cutted when sharing the screen on a wide screen ([!2016](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2016))
- Fix typo in EN translation file ([!2026](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2026))
- Add max character restriction to profile name ([!2005](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2005))
- Close notifications upon reconnection dialog ([!1988](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1988))
- Set firefox e2e tests to manual ([!2044](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2044))
- Downgrade livekit-client to 2.10.0 ([!2043](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2043))
- Firefox esr background effect support ([!2013](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2013))
- Keep debriefing notifications on screen ([!2038](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2038))
- Add missing default for maximum allowed duration ([!1939](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1939))
- Reduce re-renders of the RoomPage ([!2046](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2046))
- Prevent opening redundant tab for secondary navigation ([!2070](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2070))
- Security badge layout ([!2073](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2073))
- Moderator tab tooltip trigger ([!2006](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2006))
- Show divider in the meeting header in case a feature is active ([!2072](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2072))
- Disable meeting cancel button during fetch ([!2055](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2055))
- User not able to select custom value in mobile version timer ([!2117](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2117))
- Removing a meeting participant ([!2110](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2110))
- Poll: timer is not counting in moderation panel ([!2067](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2067))

### 🔨 Refactor

- Add microphone state caching ([!1853](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1853))

### 📦 Dependencies

- (deps) Lock file maintenance ([!1863](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1863))
- (deps) Update dependency knip to ^5.46.5 ([!1861](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1861))
- (deps) Update pnpm to v10.7.1 ([!1878](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1878))
- (deps) Update material-ui monorepo to v7 ([!1758](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1758))
- (deps) Update dependency @testing-library/react to ^16.3.0 ([!1884](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1884))
- (deps) Update dependency type-fest to ^4.39.1 ([!1872](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1872))
- (deps) Update dependency vite to ^6.2.5 ([!1865](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1865))
- (deps) Update dependency react-router-dom to v7.4.1 ([!1859](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1859))
- (deps) Update dependency rollup to ^4.39.0 ([!1860](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1860))
- (deps) Update @types ([!1868](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1868))
- (deps) Update dependency typescript-eslint to ^8.29.0 ([!1867](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1867))
- (deps) Update dependency @fluent/bundle to ^0.19.1 ([!1880](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1880))
- (deps) Update sentry-javascript monorepo to v9 ([!1853](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1853))
- (deps) Update sentry-javascript monorepo to ^9.11.0 ([!1888](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1888))
- (deps) Update dependency react-virtualized-auto-sizer to ^1.0.26 ([!1862](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1862))
- (deps) Update dependency eslint-plugin-react to ^7.37.5 ([!1889](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1889))
- (deps) Update dependency date-fns to v4 ([!1853](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1853))
- (deps) Update dependency msw to v2 ([!1853](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1853))
- (deps) Lock file maintenance ([!1900](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1900))
- (deps) Update dependency typescript to ^5.8.3 ([!1897](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1897))
- (deps) Update dependency react-router-dom to v7.5.0 ([!1895](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1895))
- (deps) Update eslint-plugins to ^9.24.0 ([!1896](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1896))
- (deps) Update pnpm to v10.8.0 ([!1906](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1906))
- (deps) Update dependency knip to ^5.47.0 ([!1898](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1898))
- (deps) Update dependency typescript-eslint to ^8.29.1 ([!1907](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1907))
- (deps) Update dependency @types/react-dom to v19.1.2 ([!1917](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1917))
- (deps) Update sentry-javascript monorepo to ^9.12.0 ([!1913](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1913))
- (deps) Update dependency knip to ^5.48.0 ([!1915](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1915))
- (deps) Update dependency @mui/material to ^7.0.2 ([!1919](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1919))
- (deps) Update dependency knip to ^5.49.0 ([!1920](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1920))
- (deps) Update dependency vite to ^6.2.6 ([!1921](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1921))
- (deps) Update dependency knip to ^5.50.1 ([!1922](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1922))
- (deps) Update pnpm to v10.8.1 ([!1941](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1941))
- (deps) Update dependency @changesets/cli to ^2.29.0 ([!1940](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1940))
- (deps) Update dependency knip to ^5.50.3 ([!1924](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1924))
- (deps) Update @types ([!1927](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1927))
- (deps) Update dependency vite to ^6.2.6 ([!1933](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1933))
- (deps) Update dependency typescript-eslint to ^8.30.1 ([!1943](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1943))
- (deps) Update dependency msw to ^2.7.4 ([!1929](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1929))
- (deps) Update dependency knip to ^5.50.4 ([!1944](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1944))
- (deps) Update dependency lint-staged to ^15.5.1 ([!1928](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1928))
- (deps) Update livekit ([!1887](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1887))
- (deps) Update dependency type-fest to ^4.40.0 ([!1948](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1948))
- (deps) Update dependency vite to ^6.3.0 ([!1954](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1954))
- (deps) Update dependency dotenv to ^16.5.0 ([!1926](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1926))
- (deps) Update dependency @vitejs/plugin-react to ^4.4.0 ([!1947](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1947))
- (deps) Update dependency @changesets/cli to ^2.29.1 ([!1951](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1951))
- (deps) Update dependency i18next to v25 ([!1946](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1946))
- (deps) Update sentry-javascript monorepo to ^9.13.0 ([!1957](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1957))
- (deps) Update eslint-plugins ([!1975](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1975))
- (deps) Update dependency @vitejs/plugin-react to ^4.4.1 ([!1976](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1976))
- (deps) Update pnpm to v10.9.0 ([!1978](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1978))
- (deps) Update dependency vite to ^6.3.2 ([!1963](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1963))
- (deps) Update dependency @playwright/test to ^1.52.0 ([!1970](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1970))
- (deps) Update i18next ([!1972](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1972))
- (deps) Update dependency msw to ^2.7.5 ([!1973](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1973))
- (deps) Update mcr.microsoft.com/playwright docker tag to v1.52.0 ([!1971](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1971))
- (deps) Update dependency knip to ^5.50.5 ([!1969](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1969))
- (deps) Update dependency react-router-dom to v7.5.1 ([!1968](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1968))
- (deps) Update dependency react-i18next to ^15.5.0 ([!1980](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1980))
- (deps) Update dependency @reduxjs/toolkit to ^2.7.0 ([!1960](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1960))
- (deps) Update dependency @changesets/cli to ^2.29.2 ([!1961](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1961))
- (deps) Update dependency react-i18next to ^15.5.1 ([!1981](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1981))
- (deps) Update dependency @mui/x-date-pickers to ^7.29.0 ([!1965](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1965))
- (deps) Update dependency vite to ^6.3.3 ([!1986](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1986))
- (deps) Update sentry-javascript monorepo to ^9.14.0 ([!1984](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1984))
- (deps) Update node.js to v22.15.0 ([!1983](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1983))
- (deps) Update dependency @mui/x-date-pickers to ^7.29.1 ([!1985](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1985))
- (deps) Update dependency react-router-dom to v7.5.2 ([!1991](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1991))
- (deps) Update dependency @types/node to ^22.15.2 ([!1992](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1992))
- (deps) Update pnpm to v10.10.0 ([!1997](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1997))
- (deps) Update dependency type-fest to ^4.40.1 ([!1995](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1995))
- (deps) Update dependency @types/node to ^22.15.3 ([!1999](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1999))
- (deps) Update livekit ([!1949](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1949))
- (deps) Update dependency i18next to ^25.0.2 ([!2001](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2001))
- (deps) Lock file maintenance ([!1932](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1932))
- (deps) Update dependency typescript-eslint to ^8.31.1 ([!2000](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2000))
- (deps) Update dependency react-router-dom to v7.5.3 ([!2002](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2002))
- (deps) Update dependency knip to ^5.51.0 ([!2003](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2003))
- (deps) Update sentry-javascript monorepo to ^9.15.0 ([!2009](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2009))
- (deps) Update dependency vite to ^6.3.4 ([!2011](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2011))
- (deps) Update dependency knip to ^5.51.1 ([!2012](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2012))
- (deps) Update dependency @types/react-dom to v19.1.3 ([!2015](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2015))
- (deps) Update babel monorepo to ^7.27.1 ([!2017](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2017))
- (deps) Lock file maintenance ([!2024](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2024))
- (deps) Update dependency i18next-browser-languagedetector to ^8.1.0 ([!2018](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2018))
- (deps) Update dependency knip to ^5.53.0 ([!2019](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2019))
- (deps) Update dependency @changesets/cli to ^2.29.3 ([!2029](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2029))
- (deps) Update alpine/helm docker tag to v3.17.3 ([!2023](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2023))
- (deps) Update dependency msw to ^2.7.6 ([!2025](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2025))
- (deps) Update dependency @livekit/protocol to ^1.37.1 ([!2027](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2027))
- (deps) Update @types ([!2035](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2035))
- (deps) Update dependency vite to ^6.3.5 ([!2034](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2034))
- (deps) Update dependency @sentry/vite-plugin to ^3.4.0 ([!2031](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2031))
- (deps) Update eslint-plugins ([!2022](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2022))
- (deps) Update dependency globals to ^16.1.0 ([!2051](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2051))
- (deps) Update linkifyjs monorepo to ^4.3.0 ([!2050](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2050))
- (deps) Update dependency @reduxjs/toolkit to ^2.8.0 ([!2047](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2047))
- (deps) Update dependency @babel/preset-env to ^7.27.2 ([!2045](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2045))
- (deps) Update dependency lint-staged to ^15.5.2 ([!2042](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2042))
- (deps) Update dependency i18next to ^25.1.1 ([!2041](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2041))
- (deps) Update dependency type-fest to ^4.41.0 ([!2040](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2040))
- (deps) Update dependency knip to ^5.55.0 ([!2039](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2039))
- (deps) Update dependency @types/node to ^22.15.14 ([!2037](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2037))
- (deps) Update material-ui monorepo ([!2020](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2020))
- (deps) Update commitlint monorepo to ^19.8.1 ([!2062](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2062))
- (deps) Update dependency @reduxjs/toolkit to ^2.8.1 ([!2061](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2061))
- (deps) Update linkifyjs monorepo to ^4.3.1 ([!2060](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2060))
- (deps) Update dependency web-vitals to v5 ([!2059](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2059))
- (deps) Update dependency knip to ^5.55.1 ([!2063](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2063))
- (deps) Update dependency @types/node to ^22.15.16 ([!2058](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2058))
- (deps) Update dependency msw to ^2.8.0 ([!2071](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2071))
- (deps) Update dependency react-router-dom to v7.6.0 ([!2069](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2069))
- (deps) Update dependency @types/node to ^22.15.17 ([!2068](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2068))
- (deps) Update dependency msw to ^2.8.1 ([!2074](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2074))
- (deps) Update dependency lint-staged to v16 ([!2077](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2077))
- (deps) Update dependency i18next to ^25.1.2 ([!2064](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2064))
- (deps) Update dependency @mui/x-date-pickers to ^7.29.3 ([!2066](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2066))
- (deps) Update dependency @types/react-dom to v19.1.4 ([!2081](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2081))
- (deps) Update dependency msw to ^2.8.2 ([!2076](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2076))
- (deps) Update sentry-javascript monorepo to ^9.17.0 ([!2057](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2057))
- (deps) Update dependency @changesets/cli to ^2.29.4 ([!2082](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2082))
- (deps) Update dependency @reduxjs/toolkit to ^2.8.2 ([!2091](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2091))
- (deps) Update eslint-plugins ([!2084](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2084))
- (deps) Update dependency msw to ^2.8.4 ([!2099](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2099))
- (deps) Update dependency tsup to ^8.5.0 ([!2098](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2098))
- (deps) Update node.js to v22.15.1 ([!2095](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2095))
- (deps) Update dependency i18next to ^25.1.3 ([!2092](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2092))
- (deps) Update dependency i18next to ^25.2.0 ([!2102](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2102))
- (deps) Update dependency knip to ^5.56.0 ([!2090](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2090))
- (deps) Update sentry-javascript monorepo to ^9.20.0 ([!2086](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2086))
- (deps) Update pnpm to v10.11.0 ([!2087](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2087))
- (deps) Update dependency vite-plugin-dts to ^4.5.4 ([!2093](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2093))
- (deps) Update dependency web-vitals to ^5.0.1 ([!2088](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2088))
- (deps) Update @types ([!2085](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2085))
- (deps) Update sentry-javascript monorepo to ^9.21.0 ([!2105](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2105))
- (deps) Update dependency @vitejs/plugin-react to ^4.5.0 ([!2118](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2118))
- (deps) Update dependency react-router-dom to v7.6.1 ([!2124](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2124))
- (deps) Update dependency globals to ^16.2.0 ([!2123](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2123))
- (deps) Update dependency i18next to ^25.2.1 ([!2122](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2122))
- (deps) Update alpine/helm docker tag to v3.18.0 ([!2121](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2121))
- (deps) Update dependency react-i18next to ^15.5.2 ([!2116](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2116))
- (deps) Update dependency @mui/x-date-pickers to ^7.29.4 ([!2115](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2115))
- (deps) Update dependency @sentry/vite-plugin to ^3.5.0 ([!2111](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2111))
- (deps) Update sentry-javascript monorepo to ^9.22.0 ([!2109](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2109))
- (deps) Update dependency @babel/core to ^7.27.3 ([!2126](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2126))
- (deps) Update dependency knip to ^5.58.1 ([!2108](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2108))
- (deps) Update @types ([!2107](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2107))
- (deps) Update node.js to v22.16.0 ([!2113](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2113))
- (deps) Update dependency msw to ^2.8.5 ([!2130](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2130))
- (deps) Update eslint-plugins ([!2129](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2129))
- (deps) Update dependency @types/node to ^22.15.23 ([!2127](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2127))
- (deps) Update dependency lint-staged to ^16.1.0 ([!2128](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2128))

### ⚙ Miscellaneous

- Update renovate package rules ([!1886](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1886))
- Upgrade packages ([!1853](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1853))
- Add react names to sentry report ([!1901](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1901))
- Migrate rtk-rest-api to vite ([!1909](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1909))
- Prevent extra get request after meeting deletion ([!1881](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1881), [#1552](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1552))
- Migrate redux-oidc to vite ([!1918](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1918))
- Sync pnpm version with ci ([!1931](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1931))
- Centralize LiveKit EventListeners in Middleware ([!1875](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1875))
- Implement typecheck in the pipeline ([!1934](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1934))
- Enforce `it` usage in unit tests ([!1996](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1996))
- Simplify breakout room creation form ([!1950](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1950))
- Refactor AccordionItem and unit tests ([!2078](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2078))
- Restructure redux listeners ([!1977](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1977))
- Refactor forms to create and update meetings in the dashboard ([!2080](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2080))
- Unit tests for create and update meeting forms ([!2096](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2096))
- Implement type-safe access to formik fields ([!2103](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2103))
- Add storage upgradable condition ([!2104](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2104))

### Ci

- Add container scanning ([!1942](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1942))

### Test

- (e2e) Add accessibility UI test ([!1654](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1654))
- Extend MediaReconnectionDialog test ([!1866](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1866))
- (e2e) Fix-accessibility-meeting-creation-flaky-in-ci ([!1885](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1885))
- (e2e) Refactor meeting class ([!1870](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1870))
- (unit) Add tests for ModerationSideToolbar ([!1893](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1893))
- (unit) Add useHeader unit tests ([!1904](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1904))
- (unit) Add additional unit test for TalkingStickTabPanel ([!1910](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1910))
- (e2e) TC_003_Dashboard_Home_test_field_functionality_title_detail_password ([!1879](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1879))
- (e2e) Fix ci flaky test for dashboard setting ([!1952](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1952))
- (e2e) Fix-flaky-dashboard-ui-test-in-ci ([!1964](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1964))
- (e2e) Tc_002_Dashboard_Home_Plan new button ([!1853](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1853))
- (e2e) Adding e2e test for TC_004_VideoRoom_ParticipantViewSettings_List_GridView ([!1871](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1871))
- (e2e) Refactor-global-setup-for-setting-and-login-page ([!1891](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1891))
- (e2e) Adding global.setup in include tag inside knip ([!1891](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1891))
- (e2e) Adding e2e test for TC_004_VideoRoom_ParticipantViewSettings_List_GridView ([!1876](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1876))
- (e2e) Refactoring Meeting Room_adjust participant view_v25.1.0 ([!1876](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1876))
- (e2e) Resolving merge conflicts ([!1876](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1876))
- (e2e) Refactoring ([!1876](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1876))
- (e2e) Tc_001_Dashboard_Home_Start new ([!1853](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1853))
- (unit) Add ReconnectionDialog unit tests ([!1994](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1994))
- (e2e) Skipping TC_002_Dashboard_Settings_Profile option ([!2053](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2053))
- (e2e) Refactoring accessibility e2e tests & refactoring of functions that return a page object ([!2036](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2036))
- (e2e) Refactoring dashboard e2e test ([!2032](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2032))
- (e2e) Adding e2e tests for TC_001_Dashboard_Help_User Manual ([!1998](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1998))
- (e2e) Refactoring meeting helpers ([!2094](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2094))
- (e2e) Adding e2e tests for TC_005_VideoRoom_ParticipantViewSettings_List_Sorting ([!1993](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1993))
- (e2e) Adding e2e test for TC_003_VideoRoom_ParticipantViewSettings_List_FullScreen ([!1854](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1854))
- (e2e) Addressing multiple issues that make some tests occasionally fail on CI ([!2125](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2125))
- (e2e) Address issues in e2e tests that make CI frequently fail ([!2131](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2131))
- (e2e) Possible solution to flaky test TC_001_Dashboard_Help_User ([!2132](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2132))
- (e2e) Renaming meetingPlanningPage object ([!2138](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2138))

[2.4.0]: https://git.opentalk.dev/opentalk/frontend/web/web-app/-/compare/v2.2.6...v2.4.0

## [2.4.0] - 2025-03-28

### 🚀 New features

- (a11y) Make `Space` key behaviour consistent ([!1618](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1618))
- Make port and user configurable via envs ([!1796](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1796))
- (a11y) Focus erroneous input filed on form submit ([!1750](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1750))
- (a11y) Replace icon and remove unused logo variant ([!1734](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1734))
- Rework burger menu icons ([!1648](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1648))
- (container) Generate .well-known/opentalk/client file ([!1842](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1842), [#1497](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1497))
- Add training participation report configuration from dashboard ([!1833](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1833), [#2448](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2448))


### Meeting Settings Dialog feature

- Implement mobile version of the meeting settings dialog ([#1931](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1931))
- Implement meeting settings dialog with audio section ([#1915](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1915))

### 🐛 Bug fixes

- Add missing hover color on datetimepicker ([!1609](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1609))
- Enable audio for screenshare ([!1712](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1712))
- Revert livekit-client version to fix self-mute error ([!1795](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1795))
- Background effects not work in lobby after mediapipe update ([!1788](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1788))
- Fixing linting errors ([!1788](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1788))
- Microphone status after being force muted ([!1791](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1791))
- Start media on old browsers ([!1794](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1794))
- (fullscreen) Hide all fullscreen buttons when the feature is unavailable ([!1658](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1658))
- Downgrade media pipe to fix the freezing on firefox ([!1820](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1820))
- More menu export meeting notes is only visible when the module is enabled ([!1818](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1818))
- Asset download button wrongly displayed on deletion ([!1752](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1752))
- Placement of the timer and coffee break popover ([!1736](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1736))
- Missing aria-label on remove invited participant x icon ([!1738](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1738))
- Sip participants can no longer be invited to whisper groups ([!1797](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1797))
- Remove cause of error when receiving a whisper invite ([!1797](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1797))
- Remove aria-current attribute from outside leading links ([!1751](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1751))
- Endless auth loop if the local system time is wrong ([!1809](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1809))
- Avoid media reconnect on waiting room transition ([!1792](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1792))
- Disable media on hangup ([!1817](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1817))
- Video permission disclaimer on missing permissions ([!1785](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1785))
- Prevent media reconnect after leaving a conference ([!1844](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1844))
- Content of the dial-in copy button ([!1737](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1737))

### 📚 Documentation

- (readme) Removed subroom audio configuration variable from template ([!1658](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1658))

### 📦 Dependencies

- (deps) Update babel monorepo to v7.26.9 ([!1619](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1619))
- (deps) Update dependency @rollup/plugin-node-resolve to v15.3.1 ([!1621](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1621))
- (deps) Update renovate rangeStrategy to bump ([!1664](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1664))
- (deps) Update dependency @m-lab/ndt7 to ^0.0.6 ([!1637](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1637))
- (deps) Update dependency @mediapipe/tasks-vision to v0.10.21 ([!1638](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1638))
- (deps) Update babel monorepo ([!1666](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1666))
- (deps) Update dependency @rollup/plugin-commonjs to ^28.0.2 ([!1667](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1667))
- (deps) Update dependency @rollup/plugin-node-resolve to ^15.3.1 ([!1668](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1668))
- (deps) Update dependency @types/dom-mediacapture-transform to ^0.1.11 ([!1671](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1671))
- (deps) Update material-ui monorepo ([!1663](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1663))
- (deps) Update dependency @types/identity-obj-proxy to ^3.0.2 ([!1673](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1673))
- (deps) Update dependency @types/fscreen to ^1.0.4 ([!1672](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1672))
- (deps) Update dependency @types/jest to ^29.5.14 ([!1674](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1674))
- (deps) Update dependency msw to ^1.3.5 ([!1689](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1689))
- (deps) Update dependency dotenv to ^16.4.7 ([!1681](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1681))
- (deps) Update dependency del-cli to ^5.1.0 ([!1680](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1680))
- (deps) Update dependency @types/uuid to ^8.3.4 ([!1678](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1678))
- (deps) Update dependency lint-staged to ^15.4.3 ([!1688](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1688))
- (deps) Update dependency eslint to ^8.57.1 ([!1682](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1682))
- (deps) Update dependency json5 to ^2.2.3 ([!1687](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1687))
- (deps) Update dependency rollup to ^2.79.2 ([!1690](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1690))
- (deps) Update dependency rollup-plugin-dts to ^6.1.1 ([!1691](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1691))
- (deps) Update dependency @rollup/plugin-typescript to ^11.1.6 ([!1669](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1669))
- (deps) Update dependency eslint-plugin-react-refresh to ^0.4.19 ([!1686](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1686))
- (deps) Update dependency eslint-plugin-react to ^7.37.4 ([!1685](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1685))
- (deps) Update dependency whatwg-fetch to ^3.6.20 ([!1699](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1699))
- (deps) Update dependency ts-node to ^10.9.2 ([!1694](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1694))
- (deps) Pnpm recursive update ([!1705](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1705))
- (deps) Change renovate config to group high confidence updates ([!1709](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1709))
- (deps) Update alpine/helm docker tag to v3.17.1 ([!1707](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1707))
- (deps) Change renovate config ([!1711](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1711))
- (deps) Update dependency @types/node to ^18.19.79 ([!1708](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1708))
- (deps) Update dependency i18next to ^21.10.0 ([!1714](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1714))
- (deps) Update dependency react-router-dom to v7.3.0 ([!1726](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1726))
- (deps) Update dependency eslint-config-prettier to v8.10.0 ([!1713](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1713))
- (deps) Update deps ([!1739](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1739))
- (deps) Update dependency regenerator-runtime to ^0.14.1 ([!1717](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1717))
- (deps) Update dependency context-filter-polyfill to ^0.3.22 ([!1725](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1725))
- (deps) Update dependency @fluent/bundle to ^0.18.0 ([!1721](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1721))
- (deps) Update dependency @fluent/syntax to v0.19.0 ([!1722](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1722))
- (deps) Update dependency msw to ^0.49.3 ([!1715](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1715))
- (deps) Update dependency @livekit/components-core to ^0.12.1 ([!1723](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1723))
- (deps) Update mcr.microsoft.com/playwright docker tag to v1.51.0 ([!1718](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1718))
- (deps) Update dependencies ([!1753](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1753))
- (deps) Update pnpm to v10 ([!1755](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1755))
- (deps) Update dependency uuid to v11 ([!1779](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1779))
- (deps) Update dependency @trivago/prettier-plugin-sort-imports to v5 ([!1733](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1733))
- (deps) Update dependency snakecase-keys to v8 ([!1778](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1778))
- (deps) Update dependency @rollup/plugin-node-resolve to ^16.0.1 ([!1772](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1772))
- (deps) Update dependency web-vitals to v4 ([!1781](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1781))
- (deps) Update i18next ([!1784](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1784))
- (deps) Update dependency livekit-client to ^2.9.6 ([!1787](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1787))
- (deps) Update dependency @reduxjs/toolkit to v2 ([!1759](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1759))
- (deps) Remove dependency to `immer` ([!1766](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1766))
- (deps) Update dependency knip to ^5.46.0 ([!1793](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1793))
- (deps) Update dependency vite to ^6.2.2 ([!1800](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1800))
- (deps) Update alpine/helm docker tag to v3.17.2 ([!1799](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1799))
- (deps) Update dependency emoji-picker-react to ^4.12.2 ([!1786](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1786))
- (deps) Update dependency i18next to ^24.2.3 ([!1789](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1789))
- (deps) Lock file maintenance ([!1805](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1805))
- (deps) Update dependency lint-staged to ^15.5.0 ([!1780](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1780))
- (deps) Update pnpm to v10.6.3 ([!1790](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1790))
- (deps) Update dependency rollup to ^4.36.0 ([!1802](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1802))
- (deps) Update dependency @babel/core to ^7.26.10 ([!1771](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1771))
- (deps) Update dependency yup to v1 ([!1783](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1783))
- (deps) Update dependency shx to ^0.4.0 ([!1803](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1803))
- (deps) Update pnpm to v10.6.4 ([!1810](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1810))
- (deps) Update dependency @mui/material to ^6.4.8 ([!1813](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1813))
- (deps) Update mcr.microsoft.com/playwright docker tag to v1.51.1 ([!1812](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1812))
- (deps) Update dependency @livekit/protocol to ^1.35.0 ([!1815](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1815))
- (deps) Update dependency @playwright/test to ^1.51.1 ([!1811](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1811))
- (deps) Update node.js to v22 ([!1754](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1754))
- (deps) Update @types ([!1773](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1773))
- (deps) Update dependency rollup-plugin-dts to ^6.2.0 ([!1819](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1819))
- (deps) Update dependency react-redux to v9 ([!1776](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1776))
- (deps) Update dependency camelcase-keys to v9 ([!1760](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1760))
- (deps) Update dependency vite to ^6.2.3 ([!1836](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1836))
- (deps) Update @types ([!1825](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1825))
- (deps) Update dependency @babel/preset-typescript to ^7.27.0 ([!1837](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1837))
- (deps) Update dependency react-router-dom to v7.4.0 ([!1823](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1823))
- (deps) Update linkifyjs monorepo to v4 ([!1804](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1804))
- (deps) Update pnpm to v10.6.5 ([!1822](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1822))
- (deps) Update rollup ([!1832](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1832))
- (deps) Update dependency type-fest to ^4.38.0 ([!1835](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1835))
- (deps) Update dependency @fluent/bundle to ^0.19.0 ([!1841](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1841))
- (deps) Update dependency eslint to v9 ([!1774](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1774))
- (deps) Update dependency typescript-eslint to ^8.28.0 ([!1843](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1843))
- (deps) Update dependency knip to ^5.46.2 ([!1845](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1845))
- (deps) Update pnpm to v10.7.0 ([!1848](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1848))
- (deps) Update dependency livekit-client to v2.9.9 ([!1801](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1801))
- (deps) Update dependency @types/node to ^22.13.14 ([!1851](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1851))

### ⚙ Miscellaneous

- Add renovate package rules ([!1767](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1767))
- Fix curcular dependencies ([!1659](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1659))
- Memoize redux selectors properly via `createSelector` ([!1798](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1798))
- Add unit tests for layout selection menu ([!1658](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1658))
- Add unit tests for participant list item component ([!1797](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1797))
- Remove deprecated createStore function ([!1834](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1834))
- Fix double meeting creation ([!1855](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1855), [#2601](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2601))

### Ci

- Switch to wildcard-cert and drop www. prefix ([!1770](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1770))
- Detect unused dependencies & files ([!1729](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1729))
- Deploy image via digest hash ([!1578](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1578))
- Verify that commits are signed ([!1551](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1551))
- Configure renovate merge request reviewers ([!1847](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1847))

### Test

- (e2e) Add accessibility UI test ([!1606](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1606))
- (e2e) Add e2e UI tests for TC_001_VideoRoom_ParticipantViewSettings_List ([!1814](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1814))
- (unit) Add test for DataProtectionPage component ([!1826](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1826))
- (unit) Add test for ImprintPage component ([!1824](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1824))
- (e2e) Add e2e UI test for TC_002_VideoRoom_ParticipantViewSettings_List_SpeakerView ([!1829](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1829))
- (unit) Add test for BrowserSupport module ([!1831](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1831))
- (unit) Add test for WhiteboardTab component ([!1830](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1830))
- (unit) Add test for SupportPage component ([!1828](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1828))
- (unit) Add test for WithLinkNotification.tsx component and utils ([!1840](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1840))
- (e2e) Add accessibility for meeting room ([!1649](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1649))
- (e2e) Adding more assertions for TC_002_VideoRoom_ParticipantViewSettings_List_SpeakerView ([!1852](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1852))

## [2.3.0] - 2025-03-06

[2.3.0]: https://git.opentalk.dev/opentalk/frontend/web/web-app/-/compare/v2.2.5...v2.3.0


### 🚀 New features

- Enhance accessibility for meeting notes and whiteboard iframes ([!1529](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1529))
- Prevent autoselection of date time pickers ([!1530](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1530))
- Update waiting room messages and add conference-inactive button variant ([!1535](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1535))
- (a11y) Favorite meetings at mobile view ([!1547](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1547))
- Make three dot menus persistent on screen when opening dialogs ([!1528](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1528))
- (a11y) Accessible svgs in the dashboard ([!1567](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1567), [#2078](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2078))
- (a11y) Announcement of new chat messages ([!1554](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1554), [#2303](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2303))
- Add config flag to enable e2e encryption ([!1579](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1579))
- (a11y) Reading order for include moderator feature ([!1575](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1575), [#2276](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2276))
- Add localized labels for meeting actions in dashboard popover ([!1548](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1548))
- Add aria-active attribute to DurationField for improved accessibility ([!1550](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1550))
- Add burger menu to the lobby page ([!1540](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1540))
- Rework regular notifications to include custom HTML attributes ([!1533](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1533))
- Add dynamic log levels ([!1585](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1585))
- Integrate `ShortcutListDialog` and other burger menu options into drawer ([!1560](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1560))
- Enhance accessibility for hand raised indicator ([!1542](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1542))
- Add bad connection popover ([!1584](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1584))
- (a11y) Accessible svgs in the conference ([!1582](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1582), [#2275](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2275))
- Disable streaming option on encrypted rooms ([!1598](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1598))
- (a11y) Align heading structure for accordions ([!1610](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1610))
- Handle livekit reconnect & add reconnection info dialog ([!1531](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1531))
- (a11y) Inform user on opening new tab for user manual ([!1612](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1612))
- (a11y) `Enter` key should toggle switches ([!1644](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1644))
- (livekit) Added asyncthank and connected with middlware with redux media state ([!1615](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1615))
- Add training participation report ([!1611](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1611), [#2328](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2328))
- (training participation report) Add unit tests ([!1611](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1611))

### 🥰 User experience

- A11y: add focus outline ([!1538](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1538), [#2235](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2235), [#2236](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2236), [#2237](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2237))
- Prevent text wrap on secondary navigation transition ([!1562](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1562), [#2271](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2271))

### 🐛 Bug fixes

- Error on muting while extended tab is open ([!1524](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1524))
- Handle short push-to-talk key presses properly ([!1519](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1519))
- Microphone state after initial push-to-talk press ([!1519](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1519))
- Fullscreen view shows only black screen ([!1539](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1539))
- Microphone toggle via AudioButton ([!1545](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1545))
- Minimize re-renders with E2EE enabled to suppress error/warn logs ([!1527](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1527))
- Show screenshares while participant videos are disabled ([!1549](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1549))
- Hotkey handling after parallel key presses ([!1552](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1552))
- Moderator microphone toggle ([!1543](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1543))
- User video choice reset after joining a conference ([!1557](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1557))
- Activated camera sort order now sorts in order of latest activity ([!1559](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1559))
- (dashboard) Longer content breaks menu ([!1499](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1499))
- Prevent media hotkeys if consent is not given ([!1561](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1561))
- Install kubectl in ci cleanup step ([!1565](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1565))
- Talking stick mute issues ([!1555](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1555))
- Overhaul `MediaChoices` usage ([!1568](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1568), [#2320](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2320), [#opentalk/product/product-management#65](https://git.opentalk.dev/opentalk/product/product-management/-/issues/65))
- Layout of text fields ([!1594](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1594))
- Extend new tab only for participants with stream ([!1595](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1595))
- Run nginx as non root user ([!1597](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1597))
- Qa changes after rebase ([!1572](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1572))
- Qa ([!1572](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1572))
- Small coffee break popover not being pronounced ([!1596](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1596))
- Deactivate cam/mic after user send to waiting room ([!1588](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1588), [#2207](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2207))
- Remove screen share button on mobile devices ([!1592](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1592), [#949](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/949))
- Missing tooltip on video overlay options ([!1603](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1603))
- Background effect gets lost when switching device ([!1587](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1587), [#2336](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2336))
- Use nginx-slim image to reduce the possible attack vector and close #2409 ([!1617](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1617))
- (e2e) Fix infinite extending profile name ([!1643](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1643))
- User pinning in SpeakerView ([!1641](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1641))
- To date field missing error text ([!1651](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1651))
- (a11y) Global chat announcement ([!1614](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1614))
- Add missing action buttons in notifications ([!1607](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1607))
- Remove opacity from the participant invite placeholder ([!1646](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1646))
- Don't show reconnection dialog on page reload ([!1653](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1653))
- (subroomAudio) Last participant remaining in a whisper group leaves automatically ([!1656](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1656))
- Make VideoMenu access independent of the number of devices ([!1650](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1650))

### 📚 Documentation

- (README) Add developer mode instructions for chrome and firefox ([!1611](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1611))

### 🔨 Refactor

- Update grid layout to improve heading hierarchy ([!1546](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1546))
- Copy text field without copy icons ([!1536](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1536))

### 📦 Dependencies

- (deps) Upgrade react & dependent packages ([!1521](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1521))
- (deps) Add renovate.json ([!1608](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1608))
- (deps) Update dependency dotenv to v16.4.7 ([!1626](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1626))
- (deps) Update dependency @mui/material to v6.4.5 ([!1640](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1640))

### ⚙ Miscellaneous

- Remove deprecated enabled_modules and disabled_features fields ([!1462](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1462), [#1435](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1435))
- Modify drawer button to improve accessibility ([!1534](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1534))
- Improve accessibility for three dot menu button ([!1532](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1532))
- (ci) Add profiling mode in vite config ([!1570](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1570))
- (docker) Cleanup docker files and add proper documentation ([!1573](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1573))
- (ci) Upgrade reuse config ([!1577](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1577))
- (ci) Upgrade reuse version ([!1577](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1577))
- Update pre-commit hooks ([!1571](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1571), [#2322](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2322))
- Update @mui/material to v6.x ([!1586](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1586), [#2325](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2325))
- Unify support list ([!1560](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1560))
- Reduce w3c validation errors ([!1572](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1572))
- Remove skip to chat link ([!1601](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1601))
- Cleaning old speakerDetection leftovers ([!1581](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1581), [#2133](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2133))
- Prevent sending empty strings in legal vote start ([!1604](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1604), [#2351](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2351))
- Allow past dates for meetings created in the past ([!1599](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1599), [#2332](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2332))
- Correct ad-hoc typo in meeting details ([!1590](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1590), [#2333](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2333))
- Add circular deps check to the pipeline ([!1655](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1655))

### Test

- (unit tests) Fixing memory leaks ([!1553](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1553))
- (e2e) Switching credentials for review apps ([!1556](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1556))
- (e2e) Running tests just on merge request event ([!1563](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1563))
- (e2e) Adjust dashboard settings cases ([!1564](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1564))
- Rework unit tests ([!1613](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1613))
- Restore skipped tests from livekit migration ([!1657](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1657), [#2434](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2434))

## [2.2.0] - 2024-12-12

### 🚀 New features

- Meeting attendance report ([!1436](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1436), [#1534](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1534))
- (user manual) Replace quickguide with user manual ([!1508](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1508), [#2240](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2240), [#2241](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2241), [#2242](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2242))
- Add optional id prop to ErrorFormMessage component ([!1506](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1506))
- Enhance DateTimePicker accessibility with aria-describedby and error message id ([!1506](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1506))
- Improve navigation accessibility with aria-label and aria-expanded attributes ([!1509](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1509))
- (subroom audio) Introduce subroom audio ([!1503](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1503), [#2259](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2259))
- Add option to unsubscribe remote videos ([!1470](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1470))

### 🥰 User experience

- A11y correct description of People tab ([!1504](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1504))
- A11y: improve headline structure ([!1507](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1507))

### 🐛 Bug fixes

- Add blurring for Firefox to track-processor ([!1486](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1486))
- (Profile) Add missing required field indicator ([!1505](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1505))
- (LegalVote) Update participant selection to use id over index ([!1512](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1512))
- Update focus styles for emoji picker search input ([!1514](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1514))
- Reset timer state on hang up action ([!1513](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1513))
- (ci) Compliance job by using local version of licensee ([!1522](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1522))
- Set active grid page when joining after 9th participant ([!1520](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1520))
- Preserve media choices when joining the conference ([!1518](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1518))
- Worker creation for e2e encryption ([!1523](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1523))
- (auth) Stuck on page after email verification ([!1510](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1510))
- (lobby) Add max character limit for display name ([!1515](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1515))

### ⚙ Miscellaneous

- Introduce hot reload for translation files in dev mode ([!1511](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1511), [#2269](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2269))
- Added track-processor package in the app ([!1486](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1486))

## 2.1.0 - 2024-11-21

### 🚀 New features

- (popout media) Popout media streams into tabs ([!1484](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1484))

### 🥰 User experience

- Moderator receives confirmation notification on moderator grant/revoke and presenter role grant/revoke actions ([!1459](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1459), [#1905](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1905))
- Show notification to users when they have been muted by the moderator ([!1469](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1469), [#2213](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2213))
- (ux) Add download progress to assets ([!1449](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1449), [#2049](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2049))
- Adjusted color contrast of informational text in text inputs and chat ([!1480](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1480), [#2155](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2155))
- Proper marking of required input fields ([!1479](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1479), [#2193](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2193))

### 🐛 Bug fixes

- Ui elements glitch in lobby ([!1473](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1473), [#2214](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2214))
- Remove unnecessary render caused by useMediaQuery hook ([!1447](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1447))
- (dashboard) Don't crash when loading recurrence rules without INTERVAL field ([!1461](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1461), [#2205](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2205))
- Missing error message on poll topic min char length ([!1488](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1488), [#1837](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1837))
- Close emoji picker when the moderator disables the chat ([!1494](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1494), [#2026](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2026))
- (tooling) Always pulling images for review apps ([!1498](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1498))
- Separate assets for recurring events ([!1485](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1485), [#1292](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1292))
- (script) Icons are created as expected and cleanup the icon set ([!1484](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1484))
- (conference) Logo size in lobby and onClick handler ([!1484](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1484))
- Direct messaging sometimes doesn't open up a chat ([!1457](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1457), [#2083](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2083))
- Legal vote error handling ([!1497](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1497), [#2227](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2227))
- Invalid end date crash in custom meeting repetition dialog ([!1487](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1487))

### ⚙ Miscellaneous

- Remove k3k refs & update livekit setup in README/package.json ([!1475](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1475))
- Sync changelog ([!1474](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1474))
- (app) Migrate to vite ([!1393](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1393), [#2067](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2067), [#2057](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2057), [#1438](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1438))
- (a11y) Add aria-controls to dashboard navigation ([!1495](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1495), [#2185](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2185))
- Fix hot module replacement for development ([!1496](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1496), [#2250](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2250))

### Ci

- Cleanup mechanism for review app ([!1482](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1482), [#2090](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2090))
- Introduce changelog bot ([!1483](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1483))
- Update review deployment to new helm chart and livekit ([!1493](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1493))

## 2.0.0

### New Features

- Add toggle to unsubscribe participant videos ([#2196](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2196))
- Add LiveKit support ([#2043](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2043))

### Internal

- Refactor aria-expanded attribute logic ([#2075](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2075))
- Cleanup left over parcel dependencies ([#2152](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2152))
- Extract unrelated code / ui changes from LiveKit branch ([#2088](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2088))
- Migrate from parcel to vite for `18next-fluent` lib ([#1957](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1957))
- Migrate from parcel to vite for `fluent_conv` lib ([#1956](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1956))

### Improvements to the user experience

- A11y: Time displays in dashboard now use the html time component ([#2106](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2106))
- A11y: The mobile moderator drawer menu is now a list ([#2103](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2103))
- Provide german translations for date time pickers ([#2167](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2167))
- Add missing labels on lobby input fields ([#2085](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2085))
- Change datepicker label from paragraph to label tag ([#2105](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2105))
- Change div structure to list element in meeting overview ([#2100](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2100))
- Change favorite meetings on home page from div to list for screen readers ([#2099](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2099))
- Make security monitor in the conference accessible ([#2084](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2084))
- Change incorrectly used paragraphs to appropriate headings in meeting create/update/detail page ([#2097](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2097))
- A11y: Wrap paragraphs in html p tag ([#2107](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2107))

### Internal

- Remove unnecessary render caused by the useMediaQuery hook ([#2139](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2139))

## 1.22.1

### Bug Fixes

- Fix inviting multiple participants to a meeting ([#2147](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2147))

## 1.22.0

### Bug Fixes

- Fix joining user appearing with the avatar of an already present user issue ([#1868](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1868))

### Internal

- Cleanup left over parcel dependencies ([#2152](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2152))
- Extract unrelated code / ui changes from LiveKit branch ([#2088](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2088))
- Migrate from parcel to vite for `18next-fluent` lib ([#1957](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1957))
- Migrate from parcel to vite for `fluent_conv` lib ([#1956](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1956))

### Improvements to the user experience

- Add missing aria attributes to the meetings expand/collapse list elements ([#2076](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2076))
- Add dynamic tab title on page change ([#2074](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2074))
- Selected layout is now marked with the checkmark icon ([#2061](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2061))
- Show notification to users when their name gets changed by the moderator ([#1990](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1990))
- Add missing tooltip on lobby buttons ([#2054](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2054))
- Inform user if vote result is invalid for some reason ([#2006](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/2006))
- Already unmuted participants no longer receive notification to unmute on their talking stick turn ([#2069](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2069))

### Bug Fixes

- A11y: fix contrast of the red color in the conference ([#1996](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1996))

## 1.21.0

### New Features

- Create new sorting mechanims in conference at grid view ([#1994](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1994))

### Internal

- Add missing `setup-pnpm` to the `prepare-artifact:upload-sourcemaps` CI step ([#2079](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2079))
- Fix wrong response type for `getRoomEventInfo` endpoint ([#2064](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2064))
- Rename protocol module to meeting notes ([#1973](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1973))
- Migrate from yarn to pnpm ([#1955](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1955))

### Improvements to the user experience

- Improve mobile header layout on the meetings overview page ([#2039](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2039))
- Add multiple new video background images ([#2052](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2052))
- Remove hover effect and more menu icon disappearing ([#2056](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2056))
- Add new poll answer button is permanently present on screen while creating ([#1980](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1980))
- Add missing h1 tag to all dashboard related pages ([#2002](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2002))

## 1.20.0

### New Features

- Implement multiple choice polls ([#1795](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1795))
- Implement legal vote issue reporting system ([#1903](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1903))

### Improvements to the user experience

- The security badge now provides more detailed information. ([#2042](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2042))
- All users get muted upon talking stick completion ([#1954](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1954))
- Improve german translations for streaming platform([#1357](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1357))
- Improve A11Y of the coffee break timer announcement ([#1997](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1997))
- When creating an adhoc meeting, the invited users are only shown when invites exist. ([#1970](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1970))
- Inlined meetings filters on mobile devices ([#2003](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2003))
- Show meeting details now defaults to true for new events ([#1969](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1969))

### Bug Fixes

- Fix: Legal votes not being stored on join success ([#2024](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2024))
- Fix: missing aria labels on poll and legal vote dialogs ([#1998](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1998))
- Fix: Chat not being visible on certain mobile resolutions ([#1995](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1995))

### Internal

- Setup ESLint react plugin for app module ([#2012](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2012))

## 1.19.0

### New Features

- Include / exclude option for creator in talking stick ([#1953](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1953))
- Enable editing streaming data for existing events([#1946](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1946))
- Add automatic join from waiting room ([#1467](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1467))
- Re-design text fields ([#1772](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1772))

### Improvements to the user experience

- Make waiting room configurable ([#1896](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1896))
- Removed nested roles from the notifications. ([#1710](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1710))
- Apply autofocus on the breakout room notification. ([#1751](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1751))
- Add tooltip for recorder ([#1971](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1971))

### Bug Fixes

- Fix: Screen share is still active during/after coffe break ([#1803](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1803))

### Internal

- Setup ESLint react plugin for app module ([#2012](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/2012))

## 1.18.0

### New Features

- Show disconnected users during Voting ([#1902](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1902))
- Implement custom recurrence dialog ([#1862](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1862))
- Implement disabling microphones ([#1615](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1615))

### Improvements to the user experience

- Changed english "Protocol" label to the "Meeting notes" accross the app ([#1884](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1884))
- Fix shaking meeting timer ([#1702](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1702))
- Emoji picker can be closed using the escape (ESC) key. ([#1898](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1898))

### Bug Fixes

- Hide manual error report button when Glitchtip is not configured ([#1977](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1977))
- Fix: Copy meeting link messsage is deleted ([#1941](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1941))

### Internal

- Move content of common package to main repo ([#1921](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1921))
- Removed internal delete rooms endpoint ([#1845](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1845))
- Fix audit: ws affected by a DoS when handling a request with many HTTP headers ([#1948](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1948))
- Update @mui/material and remove deprecated @mui/styles ([#1939](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/work_items/1939))
- Integrate e2e tests into mono repo ([!1314](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1314))
- Add conventional commit job to ci pipelines ([!1330](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1330))

## 1.17.0

### Stability Improvements

- Field validation error message for setting a meeting date should now behave correctly ([#1873](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1873))
- Implement IceRestart when publisher connections is disconnected. ([#1583](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1583), [#1747](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1747))

### New Features

- Renaming of participants from the list ([#1790](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1790))
- Add share meeting details dialog to conference ([#1685](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1685))
- Implement send to waiting room feature([#1775](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1775))
- Add meeting details switch in the dashboard ([#1808](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1808))

### Improvements to the user experience

- Improve accessibility of the Dashboard Delete Meeting Dialog ([#1809](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1809))
- Added shared folder option when creating event ([#1805](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1805))
- Users have to confirm their choice when participating in the poll using the submit button ([#1850](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1850))
- Add participant notification when granted or revoked presenter rights ([#1779](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1779))
- Implement votes and polls as dialogs ([#1726](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1726))
- Add missing aria labels to close buttons and improve markup structure of dialogs ([#1815](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1815))
- Attempt to delete meeting while offline results in error message being visible ([#1821](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1821))

### Bug Fixes

- Fix non handraised participants being shown as handraised. ([#1819](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1819))
- Loop before meeting if invite link is wrong ([#1820](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1820))
- O logo is cutted in Safari browser on zoom in ([#1825](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1825))
- Fix keyboard focus styling for the toolbar buttons ([#1810](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1810))
- Fix crash on BrowserSupport check (safari) ([#1910](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1910))

### Internal

- Replaced external PKCE library with an internal solution ([#1909](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1909))
- Moved enterprise components to the main repository ([#1920](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1920))
- Add test coverage and unit test summary to ci pipelines ([!1302](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1302))

## 1.16.0

### New Features

- Moderator reset hands of participants now works like mute participants ([#1846](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1846))
- Whiteboard automatically open by creating ([#1814](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1814))
- Show banner in the dashboard for almost full storage ([#1683](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1683))
- Added PKCE to the auth flow ([#1859](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1859))
- Implement storage section in the dashboard navigation ([#1682](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1682))

### Improvements to the user experience

- Show full meeting title with tooltip in dashboard on meeting cards ([#1847](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1847))
- Add the indicator for disabled camera in conference for local and remote video tile ([#1849](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1849))

### Bug Fixes

- Fix video button trigger on Enter key ([#1857](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1857))

## 1.15.0

### New Features

- Added jump links for keyboard users to quickly access certain elements in the conference ([#1253](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1253))
- Implement streaming in conference ([#1586](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1586))

### Improvements to the user experience

- Remove `/join` path to restore old user flow ([#1877](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1877))
- Adjust mobile header for dashboard - startpage ([#1798](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1798))
- Adjust the header navigation in conference for lower resolutions ([#1767](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1767))
- Adjust meeting details for mobile ([#1799](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1799))
- Added summary to shortcuts table along with better shortcut description formatting for cleaner screen reader pronunciation. ([#1742](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1742))
- Restructured dashboard meeting header with filter options as dropdowns. ([#1646](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1646))
- Add label to the duration pickers accross the app with the horizontal alignment. ([#1711](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1711))

### Bug Fixes

- Pagination on leftright corner broken ([#1888](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1888))
- Add the logo to desktop view for conference ([#1879](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1879))

## 1.14.0

### New Features

- Implement manual trigger for Glitchtip error report ([#1713](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1713))

### Improvements to the user experience

- Added focus effect for buttons and improved contrast for hover effect. ([#1752](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1752))
- Improved user experience with dialogs. Most dialogs should be closeable by clicking away or pressing the escape key now. ([#1755](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1755))
- Extract "Poll and Vote" button outside of the clock. ([#1791](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1791))
- Improve accessibility of the emoji button ([#1680](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1680))
- After navigating to the tab as a moderator, related tab content gets focused and pronounced using a screenreader. ([#1754](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1754))
- Improve room UI for medium screen size ([#1242](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1242))
- Add moderator badge to the moderator in the participant list. ([#1768](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1768))
- Moderator can mute participant through the context menu from the participant list. ([#1635](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1635))
- Prevent room creator from being kicked ([#1778](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1778))

### Bug Fixes

- Fix layout of "Setting" and "Update meeting" pages in the dashboard for tablets ([#1644](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1644))
- Fix: When creating a meeting, colliding events would not always be properly detected ([#1794](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1794))
- Fix glitchtip error for unhandled message upon successful room deletion ([#1750](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1750))

### Internal

- E2E dependency - Added data-id to micOff and On elements (https://git.opentalk.dev/opentalk/qa/reports/-/issues/27)
- Add resolution for tar package ([#1827](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1245))

## 1.13.0

### New Features

- Add guest landing page ([#1673](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1673))
- Add join meeting button to dashboard ([#1622](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1622))

### Improvements to the user experience

- Improve accessibility of the Delete Meeting dialog ([#1769](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1769))
- Delete single occurance or all of reccuring events in dashboard ([#1514](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1514))
- Restructure conference lobby page ([#1741](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1741))
- Enable keyboard navigation through participants sort option list. ([#1753](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1753))
- Prevent moderation right revoke from the room owner. ([#1729](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1729))
- Improved vote and poll underlying HTML structure, so it can be better navigated using the screen readers. ([#1708](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1708))
- Mobile users can access ongoing and finished poll and legal vote lists from the drawer ([#1519](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1519))
- Improved the contrast of icon buttons used as adornment for input fields ([#1245](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1245))
- Improved user experience with screen readers for breakout rooms ([#1723](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1723))
- Improved user experience of the end call button popup for moderators ([#1492](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1492))

### Bug Fixes

- Dashboard language switch notification is displayed in the wrong language ([#1773](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1773))
- Translations missing for error in vote title ([#1725](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1725))
- Chat icon no longer shows hover effect when hovering over the input field ([#1720](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1720))
- Calendars now correctly show day names ([#1736](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1736))

## 1.12.0

### Improvements to the user experience

- Improve right corner with burger menu instead of the guide icon ([#1719](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1719))
- Improve accessibility of the breakout room notification header ([#1709](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1709))
- Restyle switches in the meeting creation form ([#1700](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1700))
- Improved conference landmark structure for better experience using screen readers ([#1289](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1289))
- Adjust tab panel title markup for better screen reader experience. ([#1707](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1707))
- Adding new tags for better error report handling ([#1606](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1606))
- Changing error report flow, switch to manual sending report ([#1763](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1763))
- Implement custom error report dialog ([#1737](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1737))

### Bug Fixes

- Support OIDC .well-known/openid-configuration ([#1701](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1701))
- Fix selection of the protocol write permissions ([1706](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1706))
- Fix: The chat gives out some characters twice ([#1612](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1612))
- Fix: audit - ip@npm:2.0.0 vulnerability ([#1735](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1735))
- Fix thumbnail row update on participant leave in speaker view ([#1468](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1468))
- Fix inconsistent order of participants when sorted by the raised hand. ([#1630](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1630))
- Fix frontend version number for glitchtip

### Internal

- Resolve circular dependencies (part 2 - Dashboard) ([#1757](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1757))
- Resolve circular dependencies in the UI components ([#1201](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1201))

## 1.11.0

### New Features

- Add streaming options to create meeting ([#1587](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1587))
- Add ability to turn hotkeys off ([#1251](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1251))

### Improvements to the user experience

- Minor adjustments to the hotkey popup ([#1251](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1251))
- Change German translation for unmuted notification ([#1566](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1566))
- Change wording for invite participants label on the create meeting page ([#1614](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1614))
- Ported waiting room feature to the mobile design. ([#1515](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1515))
- Applied hover styles on the "chat", "participants" and "messages" tabs in the meeting room. ([#1676](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1676))
- End Call button is more prominent now ([#1679](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1679))
- Improved contrast for keyboard focus of toolbar buttons ([#1677](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1677))

## 1.10.0

### Improvements to the user experience

- add appropriate linking between input fields and accessible labels for visually impared users. ([#1642](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1642))
- Improved lobby page markup structure for better experience using screen readers. ([#1649](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1649))
- Opentalk SVG logo can now be interpreted by accessibility tools ([#1636](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1636))
- Change order of moderator tabs ([#1663](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1663))
- Improved english sentence for the chat encrypted message panel. ([#1657](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1657))
- Enhanced profile display name input field with the autocomplete functionality for faster completion. ([#1643](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1643))
- Implement client-side speaker detection and highlight multiple speakers concurrently ([#1498](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1498))
- Protocol feature is now fully available for mobile users ([#1507](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1507))
- Improved user experience for screen reader users in lobby view ([#1640](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1640))
- Improved screen reader usability inside the meeting room ([#1267](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1267))


## 1.9.0

### Improvements to the user experience

- Switch off media devices if user aborts reconnect ([#1531](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1531))
- Improve virtual background quality by introducing confidence thresholds ([#1595](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1595))
- Improved accessibility of dashboard main navigation. ([#1641](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1641))
- More menu buttons on the meetings page are interactive using `space` or `enter` key. ([#1647](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1647))
- Aligned the page language with the chosen application language to enhance the pronunciation accuracy of screen readers. ([#1272](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1272))
- Chat input gets autofocused upon private and group message opening. ([#1287](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1287))
- Hide moderator functionalities from non moderators in the mobile view. ([#1620](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1620))

### Bug Fixes

- Update safari notification warning on language change. ([@1526](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1546))
- Added translation to aria label on the chat emoji button. ([#1275](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1275))
- Fix: Error on late publisher reconnect ([#1583](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1158))
- Fix missing unread global chat message indicator in mobile view. ([#1610](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1610))
- Fix partially visible notification on smaller mobile devices. ([#1568](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1568))
- Fix/refactor recurrence event instance creation ([#1618](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1618))


## 1.8.0

### New Features

- Added granting/revoking the moderator role in dashboard ([#1464](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1429))
- Add quick start guide ([#1525](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1525))

### Improvements to the user experience

- Implementing new auth provider ([#1598](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1598))
- Chat no longer discards draft message when hidden ([#1596](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1596))
- Rework the participants list in dashboard ([#1464](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1464))
- Improved look of participants in the waiting room with user friendlier indicator that there are more participants than shown ([#1570](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1570))

### Bug Fixes

- Fix logic bug in reservation logic, which might lead to 'black' videos. ([#1611](https://git.open  talk.dev/opentalk/frontend/web/web-app/-/issues/1611))
- Remove hardcoded default values for survey feature ([#1605](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1605))


## 1.7.2

### Improvements to the user experience

- Denying recording consent will block media publishing, but notify. ([#1547](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1547))

### Bug Fixes

- Increase heartbeat interval


## 1.7.1

### New Features

- Show voting results of live vote and roll_call even the participant has not yet voted or saved ([#1425](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1425))
- Add mobile drawer ([#1120](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1120))

### Improvements to the user experience

- Mobile users are notified with the indicator when new message occures and/or whiteboard, shared folder or protocol features are available ([#1483](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1483))
- Change invite link generation ([#1420](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1420))
- Show link to recorded file only to explicitly invited users ([#1536](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1536))
- Standardize handraise icon in the toolbar to match other buttons ([#1558](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1558))
- Show Meeting Title in lobby & waiting room ([#1398](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1398))
- Enhanced behavior of the room participant selection ([#1500](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1500))

### Bug Fixes

- Fix Password notification don't disappear ([#1591](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1591))
- Fix popovers in the fullscreen mode for three dot menu and hang up confirmation. ([#1535](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1535))
- Fix notifications not being display on the personal fullscreen mode ([1504](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1504))


## 1.7.0

### New Features

- Show voting results of live vote even the participant has not yet voted or saved ([#1425](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1425))

### Improvements to the user experience

- Improve date time picker behaviour ([#1046](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1046))
- Remove the dialog from Ad-Hoc meetings at the end ([#1113](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1113))
- Safari: change button color for browser notification ([#1485](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1485))
- Change wording for inviting field ([#1533](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1533))
- Change wording of dashboard password field ([#1527](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1527))
- Change allow button color in recording consent dialog ([#1508](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1508))
- Add time to join/leaving event in chat list ([#1510](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1510))
- Remove the redundant login screen - fixed redirect ([#1360, #1463](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1360, https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1463))
- Fix: [Lobby] no feedback for wrong password ([1440](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1440))
- Increase size of toolbar buttons for mobile user ([#1460](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1460))
- Customize Glitchtip user feedback dialog labels ([#1452](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1452))
- Improved loading time of the participant list with over 100 participants in the room. ([#1487](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/work_items/1487))
- Improve performance while scrolling both long personal, group or global chats. ([#1422](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1422))
- Enhanced behavior of the room participant selection ([#1500](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1500))
- Unauthorized users can no longer open meeting details page where they are not invited ([#1540](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1540))

### Bug Fixes

- Fix meeting layout after hangup action in fullscreen mode ([#1032](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1032))
- Fix participant button appearance on meeting edit page to look clickable ([#1457](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1457))
- Fix Password notification don't disappear ([#1591](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1591))
- Updating @babel/traverse to 7.23.2 ([#1569](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1569))
- Implementing ping-pong control protocol with the server to check the websocket connection. ([#1554](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1554))
- Fix waiting participants, which rejoined after debriefing([#1262](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1262))
- Fix push-to-talk functionality ([#1344](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1344))
- Fix handling with disallow custom display name ([!1089](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1089))
- Fix overflowing details on the meeting details page ([#1144](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1144))

### Stability Improvements

- Make meeting room header mobile responsive ([#1447](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1447))

### Internal

- upload source maps for better stacktrace in error reports ([#1081](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/merge_requests/1081))

## 1.6.x

### UI/UX Fixes

- Change the naming for voting in accordance with the municipal code ([#1424](https://git.opentalk.dev/opentalk/frontend/web/web-app/-/issues/1424))
- Fix guest link generation in the dashboard (!1066)
- Fix: future meetings displayed in past tabs (!1057)
- Fix participants timer state in moderators timer tab (!1404)
- Fix functionality to set avatar default image (!1034)
- Remove extra space from url in MeetinPopover.tsx (!1050)
- Add missing documentation for ACCOUNT_MANAGEMENT_URL (!1036)
- Fix error handling on update displayname in dashboard (!1026)
- Fix unhandled shared folder update message (!1010)
- Remove settings if provided by a service provider (!1000)
- Add missing names to toolbar buttons (!988)
- Change tariff to plan in english translation (!1004)
- Fix styling of the voting kind dropdown (!989)
- Fix german term for talking stick (!1012)
- Remove unmute button for already unmuted talking stick participant (!1009)
- Fixed overflowing layout issues in all features (!1011)
- Fix broken breakout room notification (!1024)
- Reverted missing label for invite participates when tariff is not applied (!1037)
- Fix german "Hintergrundfilter" translation (!1038)

### Stability Improvements

- Trigger media reconnect when 'connectionstate' is failed (#1489)
- Rework media stream quality reservation (!1019)
- Cleanup video components (!1067)
- Make pipeline fail on failed tests in packages (!1049)
- Unable to enter the meeting - user gets redirected to Dashbaord (!1053)
- Fix tests in common package (!1007)
- Update the semver package to >=7.5.2 (!1002)
- Fix tests failing after moving accountManagementUrl (!1005)
- Extend hot reload functionality for packages (!966)
- Use single snackbar provider (!994)
- Upgrade test packages to remove unmaintained packaged (!1006)
- Improve sidebar tab definition, types and accessibility (!997)
- Fix WebRTC stats error in Safari for missing remote report (!1014)
- Rework most timer/coffee break related components and slices (!1018)
- Fix rerendering issue with chat and participant tab (!1032)
- "You are next" notification in the talking stick no longer auto close (!1027)
- Optimized lobby field wording (!1028)
- Notification for own message in group chat is no longer shown (!1029)
- Fix hotkeys not working as expected (!1040)
- Fix timer countdown for the moderator (!1031)
- Automatic reconnection attempt every 5 seconds when connection breaks (!1059)

### New Features

- Implement experimental client-side voice detection (!1023)
- Disable editing of display name depending on configuration flag (!1056)
- Add copy meeting link and guest link to dashboard meeting 3-dot menue (!1033)
- Display and pin remote sharedscreen automatically(!998)
- Add legal entry to the dashboard (!1020)
- Add a new call_in field to the room field of events (!999)
- Hide dial-in option when no call-in info is sent (!1001)
- Glitchtip integration (!1016)
- Control talking stick with the shortcut (!1013)
- Add ability to revoke event invitation from invited participant. (!1035)
- Add safari warning notification (!1041)

## 1.5.0

### UI/UX Fixes

- Fix: Redirect user to lobby page after remove participant action (Safari) (!920)
- Fix: Legal vote token not being completely visible (!967)
- Fix: Legal vote results are not visible to every participant (!967)
- Fix: Close the conference when time limit quota is elapsed (!974)
- Fix: Update chat indicator correctly (!975)
- Fix: Add missing focus style on the new message button (!958)
- Fix: Better title in English coffee break screen (!987)
- Fix: new message dialog tab order (!965)
- Fix: automatically open talking stick tab for moderator on start (!960)
- Fix: make clear search button focusable with tab key (!961)
- Add translated labels to emoji and send button (!959)
- Disable time limit notifications in the lobby (!955)
- Fix time limit notification for guests joined at the end (!955)
- Fix emoji picker popover cutoff on small devices (!952)
- Add missing labels to view selection drop-down menu (!951)
- Secure connection information is more eye-catching for the user (!949)
- Fix: Remove console error message when closing a running vote (!996)

### Stability Improvements

- Fix: audio was not working after switching audio device (Safari) (!983)
- Tweak bandwidth control for lossy networks (!985)
- Fix crash on leaving conference after switching between chats (!975)
- Add aria labels to camera and microphone option buttons (!972)
- Improve keyboard accessibility of video and audio context menus (!973)
- Fix: Correct the handling media and connection change events (!976)
- Remove redux from the dependencies (!962)

### New Features

- Add category filters to meeting overview in dashboard (!968)
- Add version badge to Dashboard and 'MoreMenu' (!981)
- Show payment warning in dashboard if there is a payment issue (!982)
- Show imprint and data protection footer in the lobby and waiting room (!984)
- Show meeting title in the meeting header (!986)
- Change wording and add link to recording stopped notification (!969)
- Add shared folder icon button to the meeting header (!943)
- Add shared folder setup to the dashboard (!947)
- Introduced "Talking Stick"-mode as first auto moderation feature (!912)
- Add chat unread indicator to the home icon (!992)

## 1.4.0

### UI/UX Fixes

- Change Icons, size and label for participants list (!964)
- Translation protect for names & shortcuts against browser-plugins (!956)
- Fix:Different participant avatars for chat and voting (!957)
- Fix: Poll/Voting User not able to submit their poll (!936)
- Highlight the protocol icon on first appearance (!934)
- Fix German 'Protokoll ausblenden label' (!933)
- Fix audio/video permission denied message (!931)
- Fix sorting of participants by last active (!929)
- Fix the legal vote token copy text for German users (!935)
- Fix both coffee break and timer tabs being disabled (!918)

### Stability Improvements

- Fix: Guest user unable to join meeting after 401 error handling (!945)
- Forbidden results break the app (!944)
- Fix: failed request will cause endless loop (!928)
- Improving development workflow for external libraries (!908)
- Add separate keys for moderation sidebar tabs (!917)

### New Features

- Rework Notistack integration(!922)
- Add Debriefing in conference (!921)
- Implement dynamic media subscriptions management (!942)

## 1.3.2

### UI/UX Fixes

- Fix legal vote popover layout issues (!927)
- Disable starting of a legal vote/poll when a coffee break is active
- Fix the app crash on moderator join event when media is undefined (!925)
- Disable starting of a legal vote/poll when a coffee break is active (!916)
- Fix minimum allowed value in the poll timer. (!897)
- Fix unresponsive hang up button on participant leave. (!903)
- Fix cross icon showing on timer without ready check (!919)

## 1.3.1

### UI/UX Fixes

- Hide legal vote token for unsubmitted users after vote is finished. (!926)
- Disable remote audio while in coffee break view (!924)

## 1.3.0

### UI/UX Fixes

- Stay in coffee break view when a timer is started (!915)
- Fix error on removing phone users from conference (!896)
- Fix legal vote labels after re-joining a meeting (!902)
- Fix some legal vote wordings for German (!880)
- Show no more outdated meetings in dashboard home (!859)
- Rework protocol UX (!866)
- Change UX for whiteboard access (!841)
- Wording coffee break (!862)
- Fix icons missing in chat field (!854)
- Fix Keyboard shortcuts not disabled in smiley search (!854)
- Fix UI for moderation tabs on the side panel for community features (!853)
- Add details for overlapping event dialog (!868)
- Fix not showing participants in the waiting room when moderator is joining after them (!869)
- Fix coffee break English labels (!881)
- Add HotKeys coffee break when full screen is active (!886)
- Fix missing notification when timer stops (!883)
- Fix create meeting default start/end time (!888)
- Fix browser language detection (!889)
- Polished legal vote UI for unselected participant (!893)
- Remove offline participant from the timer list (!901)
- Title texts Coffee break (!898)
- Fix progress bar display for polls and votes (!894)
- Fix UI consistency for legal vote with other tabs (!878)
- Fix Emoji picker container overflowing (!905)
- Fix unwanted timer submitting (!906)

### Stability Improvements

- Renegotiate media connections when tracks fail with on recovery (!899)
- Reconnect media connections when they fail (!887)
- Add connection information to participant stats panel (!849)
- Fix: flickering local video element when start coffee break (!870)
- Clean-up dispatch of legal vote started action (!864)
- Rework duration field and related types (!855)
- Translated emoji picker categories to German (!854)
- Enhanced DurationField behavior (!884)
- Removed development error showing on the create meeting page. (!892)
- Enhanced behavior of poll temporary save (!891)
- Improved legal vote token message on the popover (!900)
- Fix app not building on Safari (!910)

### New Features

- Add account management tab to the dashboard (!930)
- Feat: show quotas information in dashboard (!865)
- Lobby / Waiting room move button / password (!852)
- Add unread indicator for chat messages (!844)
- Add legal vote token copy field (!836)
- Lobby without password label as invited (!863)
- Notify moderator if participant limit has been reached (!877)
- Show room blocker for a participant, that tries to join a full room (!876)
- Add time limit quotas in conference (!875)
- Deactivate modules according to room tariff info (!873)

## 1.2.0

### UI/UX Fixes

- Fix voting status label between different languages (!850)
- Display only a popup instead of the wrong browser page (!830)
- Fix display of new voting, while viewing results of the previous ones (!846)
- Uncheck all checkboxes in the voting popover on every new voting (!842)
- Centralize date and time format (!831)
- Fix styling issues in duration field (!843)
- Fix own icon in people tab showing incorrectly (!879)

### Stability Improvements

- fix toggling mark as done in timer (!867)
- fix typo `updateParticpantsReady` (!867)

### New Features

- coffee break (!827)

## 1.1.0

### UI/UX Fixes

- Fix display of long vote participant names and avatars (!848)
- Fix layout for vote kind selector (!851)
- Enable share screen button on join success (!834)
- Fix LegalVote user selection (!824)
- Fix DateTimePicker issues on mobile (!832)
- Use correct protocol icon in moderation sidebar (!829)
- Fix wrong placed waiting room list (!825)
- Fix too small waiting room list (!826)
- Add an error message for the case that when you start a voting, another voting is already active (!799)
- Merge eeChat into chat (!786)
- Fix dark mode in lobby page (!794)
- Reword the legal vote label from auto stop to auto close (!791)
- Fix incorrect spelling of successfully (!795)
- Fix filtering of upcoming events (!782)
- Legal voting users are unchecked when a new user join into the room or when token is updated (!783)
- Fix active speaker remains on screen after leaving the room (!787)
- Fix wrong German translation "Medienstrom unterbrochenen" (!792)
- Fix legal vote not starting (!797)
- Fix Moderator triggered notifications cannot be seen in full screen mode (!779)
- Fix closing recording and whiteboard notifications after joining active session (!779)
- Fix invited users showing in ad-hoc meeting creation (!793)
- Fix start and end date validation is running on unscheduled meeting (!796)
- Fix error on switching audio device in the lobby page (816)
- Fix create/update meeting step icon styling (!810)
- Fix visuals on the legal vote and poll preview popover (!812)
- Fix DateTimePicker not opening on mobile (!777)

### Stability Improvements

- Fix Firefox sender quality scaling (!839)
- List of participants include phone users (!783)
- Forked notistack to local version in order to enable fullscreen notifications (!779)
- Topic and subtitle fields are no longer mandatory when creating legal vote (!812)
- Reworked legal vote to use voting tickets for more security (!812)

### New Features

- Add an image next to the participant in the participants list if the participant is protocol editor (!803)
- Change the select participants behaviour (!783)
- Placed legal votes are summarized in the table visible by moderator (!812)
- Active legal vote popover has a ticking timer indicating remaining time to place a vote (!812)
- activate session reconnect (!203)


## 1.0.13

### UI/UX Fixes

- Fix: Change working for possible answers and set default true to allow_abstain (!784)
- Fix mobile menu (!778)
- Add the own user to the participant list (!770)
- Remove chat message error on blur (!769)
- change wording DE in permission for moderator rights (!771)
- Fix grouping meetings by week in dashboard (!773)
- Remove "overlapping event" pop-up when creating unscheduled event (!772)
- Fixed several timer related issues (!781)
- Fix unresponsive back button when previewing a meeting (!755)
- Fix event creation start time is not initially in the future (!774)

### Stability Improvements

- make a resolution of json5 for some libraries (!785)

### New Features

- Add a Dialog to ask if the meeting information should be deleted (!776)
- render a list of users difference by suggested users, invited users and selected users (!775)

## 1.0.12

### UI/UX Fixes

- Fix the wrong percentage calculation of vote results (!767)
- Refine wordings (!764)
- Fix duration string for voting overview panel (!768)
- Improve Waiting Participant List and Item (!890)

### Stability Improvements

- Show session duration time in vote and poll; zero means unlimited time (!762)
- Add translations for poll states (!765)
- Moved hard-coded component color to the theme (!766)

### New Features

## 1.0.11

### UI/UX Fixes

- Hide blur button on safari browsers (!758)
- Fix space key switch also video on / off (!747)
- Add tooltip to the chat input filed when chat is disabled (!739)
- Fix visible background image on dashboard page (!745)
- Fix wrong start/end time in meeting overview (!723)
- Show only unmuted participants in mute-all-list (!736)
- Fix Send feedback without user interaction possible (!744)
- Fix naming and rendering of the protocol module (!740)
- Fix missing chat message timestamp (!742)
- Fix Guest requests to share his screen but moderator doesn't receive a notification (!743)
- Fix Event date format doesn't match input format
- Fix action buttons are overflowing user video thumbnail when sharing screen (!720)
- Fix stopwatch translation (!759)
- Add time information to details page (!746)

### Stability Improvements

- Add eslint-plugin-jsx-a11y package (!748)
- Fix missing key in moderation sidebar (!756)
- Conference room_error - Video channel broken (!761)
- Handle and communicate unexpected webRTC remote connection failures (!38)
- Fix Error when many participants left the room (!738)
- Fix meeting Accept/Decline buttons to not trigger details view (!741)
- Sync with backend API by removing unused event status fields (!737)
- Reimplement config error page (!731)
- Change whiteboard namespace to match backend update (!749)
- Update EE chat interface (!760)
- Removed unused search button from meeting list. (!753)

### New Features

- Sort users in the room by when they joined (!757)
- Add a button for the moderator to create an etherpad pdf (!751)
- Voting result overview table (!750)
- Anonymous voting (!754)
- Add asset table to details page (!752)
- Room recording (!682)

## 1.0.10

### UI/UX Fixes

- Fix incorrect remaining time on timer stop. (!715)
- Fix delete meeting leading to details page (!717)
- Fix create/update/details pages in meetings showing ID (!718)
- Fix missing translation on unregisted suggestion list (!733)
- Fix broken layout when viewing hotkey dialog list in German (!724)
- Fix black videos on iOS (!734)
- Fix timer displaying wrong format (!721)
- Fix allowed click when cursor is outside of the field (!732)

### Stability Improvements

- Fix SpeakerView video quality does not switch (!735)
- Refinement: Remove usage of an index as a key in Tabs (!729)
- Refinement: Password field ignores leading and trailing white-spaces (!728)
- Migrate timestamp format for incoming chat message (!730)

### New Features

- Feat: Delete global chat as moderator (!719)

## 1.0.9

### UI/UX Fixes

- Fix grant presenter role to guest users (!714)
- Fix invites on meeting overflow on long text (!713)
- Fix pending permission request causes flickering toolbar buttons (!709)
- Fix suggested participants had to be clicked twice in the dashboard (!708)
- Fix delayed language switch on dashboard. (!711)
- Fix wrong copy to clipboard notification message for password and dial-in fields (!712)

### Stability Improvements

- Refinement: Adhoc events are excluded on the dashboard. (!700)
- Refinement: Merged date and time pickers in the event creation. (!725)

### New Features

- Grant presenter role (!706)

## 1.0.8

### UI/UX Fixes

- Fix increase character limit for chat messages (!701)
- Fix TimePickers component anchoring (!695)
- Fix missing label on external invitee (!692)
- Reverse logic for time independent meeting switch (!703)
- Fix spelling error in de/echotest-warn-no-echo-cancellation (!704)
- Highlight moderator chat messages (!663)
- Fix mobile views for smartphone sizes (!702)
- Fix uniform naming for "waiting room" in German (!705)
- Fix Microsoft Edge browser support (!707)
- Fix TimePicker locale (!706)

### Stability Improvements

- Add common Error component (!689)
- Fix meet-now page to not generate new events on token refresh (!697)
- Fix invite link selection on event details page (!699)

### New Features

- Make 'change password' configurable (!698)
- Add shortcut keys overview list (!687)

## 1.0.7

### UI/UX Fixes

- Add tooltip to the moderation sidebar timer tab (!683)
- Fix wrong naming of features (!685)
- Change expired invite link message (!674)
- Fix not updating `DebugPanel` stats on participant leave (!676)
- Change the German wording from Breakout Rooms to Breakout-Räume (!667)
- Fix the German wording for breakout rooms (!668)
- Change beta tooltip text and view (!671)
- Fix browser regex for iPhones safari version (!677)
- Show configured error report email in message (!680)
- Fix screen share thumbnail to show the avatar when video is off (!686)
- Fix jumping clock. (!691)
- Fix echo cancelling message shown upon room leaving. (!693)
- Fix password message not visible in the lobby. (!688)

### Stability Improvements

- Change the variable name WHITEBOARD in README.md to FEATURE_WHITEBOARD (!666)
- Change structure for chat message interfaces (!679)
- Fix MeetingView's layout break when additional element is rendered (!675)
- Fix handling of the own user in the participants list (!681)
- Fix invite link not being used for logged in users (!690)
- Fix video resize handler (!694)

### New Features

- Add the moderator as first entry to the participant list of the breakout room (!670)
- Add feature for moderator to reset hand raises (!664)
- Add event details page (!639)
- Add accept/decline meeting buttons to details page (!652)
- Add feature for moderator to enable/disable hand raises (!665)
- Own screen share will be shown in the local video (!672)
- Add toggle for waiting room in create/update event (!678)
- Add feature for moderator to enable/disable chat (!684)
- Prevent reloading app on switching breakout rooms (!736)
- Add a badge on new participants in waiting room (!669)

## 1.0.6

### UI/UX Fixes

- hide all disabled moderator tabs (!651)
- Fix design issues with invite link dateTime picker (!655)
- Reverted missing TimerPopover in the meeting page. (!659)
- Fix SideToolbar Tab component prop (!656)
- Fix overflowing invitees layout. (!661)
- Fix layout bug in the common TextField

### Stability Improvements

- upgrade project dependencies and type fixes for typescript v4.8
- Fix invite link leading to error page (!600)
- Fix hotkeys not working (!658)
- Fix rrule crashing on unsupported timezone value (!653)

### New Features

- Add possibility for moderator to switch between breakout rooms (!709)
- Add Whiteboard (!647)
- Add debug panel (!620)
- Add joinWithoutMedia config flag (!650)
- Add an audio echo test to the Lobby (!654)
- Add chat filtering (!660)

## 1.0.5

### UI/UX Fixes

- Fix notifications in fullscreen (!515)
- Refactor MeetingCard related components and logic (!631)
- Fix grid view overflow (!641)
- Fix ICE notification suggesting the application is broken (!690)
- Remove speaker window transition (!645)

### Stability Improvements

- Set video stream quality based on size of video element (!643)
- Refactored routeHandling for the conference, waiting and lobby page.(!622)
- Extend connectionStatsSlice to store updates as array (!638)
- Fix remote video ref on unmount (!629)

### New Features

- Add Safari support (!635)
- Add a config option to limit the bandwidth for video/screen sharing (!642)
- Fix video off-setting should not switch off screen-share (!644)
- Add decline meeting functionality to MeetingPopover (!631)

## 1.0.4

### UI/UX Fixes

- Fix the error on opening invite link as logged on user (!628)

### Stability Improvements

- Fix racy media subscription due to early publish_complete announcements (!632)
- Fix publisher stats being updated in the stats slice (!630)
- Fix Auth provider keeps sending token renewal requests (!619)
- Fix console warnings (!634)

### New Features

- Add full_trickle support to speed up WebRTC connection establishment (!618)
- Add hotkey bindings (!624)
- Add breakout rooms participants list (!623)

## 1.0.3

### UI/UX Fixes

- Fix the missing stopping of the camera and screen share (!601)
- Add waiting room message into join button (!612)
- Fix toolbar popup in fullscreen mode (!610)
- Fix StartMeeting animation (!609)
- Fix console warning for TextInput and select field (!370)
- Fix DurationField's label not visible (!604)

### Stability Improvements

- Implement a popover menu where the user can see all votes/polls (!589)
- Fix add missing fields to the configuration in setupTests.ts (!656)
- Update the RTK query rooms API (!616)
- Add error handling for failing ICE (!608)
- Change fullscreen implementation (!606)
- Add feature-toggles in config and entrypoint (!614)

### New Features

- Add character-counter to TextFields (!567)
- Add a timer function (!604)

## 1.0.2

### UI/UX Fixes

- Fix SpeedTest button disappears (!574)
- Fix hangup in fullscreen mode for creator/moderator (!579)
- Fix german invitees language (!576)
- Fix SpeakerView not resizing properly (!575)
- Add delete room just for the creator (!572)
- Fix raiseHand button icon. (!583)
- Fix copy button message to the correct translation key. (!580)
- Fix dashboard header in mobile view for event editing. (!578)
- Change main logo to have a white gradient (!589)
- Fix delete-event-dialog (!588)
- Fix poll wrong title (!571)
- Fix close button in poll/vote result positioning broken (!571)
- Add toggle option for sorting by groups in participants list (!582)
- Fix speed test button (safari) (!584)
- Fix timePicker focused style (!592)
- Improve handling of video background effects (!605)

### Stability Improvements

- Fix inconsistent path usage (!570)
- Set dashboard language selection field default (!569)
- Fix MUI fragment error (!573)
- Polish protocol module (!517)
- Prevent race condition error while switching audio and video buttons on Safari (!565)
- Fix logout url parameter (!577)
- Fix sound device selection dropdown for Chrome (!533)
- Remove unused roboto font. (!585)
- Fix parameter initialization for Libravatar. (!594)
- Fix recurrence pattern (!587)
- Fix EventsSlice's events having a racy key (!602)
- Disable video effects in Safari (!598)
- Fix error due to empty id_token and racy login call (!591)
- Add check for audioContext support (!590)

### New features

- Add waiting room feature (!484)

## 1.0.1

### UI/UX Fixes

- Fix position for video overlay icons (!559)
- Fix endless loading loop on user-me fail (!544)
- Fix breakout rooms random distribution (!539)
- Hide edit & delete buttons in more menu for non event creator (!562)
- Fix latency line disappearing (!563)
- Fix background images section showing when empty (!564)
- Add redirect after deleting conference (!568)

### Stability Improvements

- Fix beta release flag config (!558)
- Prevent poll from crashing (!560)
- Check for token refresh error and display Login error page (!546)

### New Features

- Add email field to suggested and invited participants in invite to MeetingPage (!561)
- Grant & revoke moderation rights (!545)
- Add feature for inviting unregistered users (!566)

## 1.0.0
