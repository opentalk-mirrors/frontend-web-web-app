# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

FROM node:16-alpine AS Build
ARG BUILD_TYPE=build

WORKDIR /app

COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn
COPY app/package.json ./app/package.json
COPY app/tsconfig.hot.json ./app/tsconfig.hot.json
COPY app/tsconfig.dev.json ./app/tsconfig.dev.json
COPY packages/fluent_conv/package.json ./packages/fluent_conv/package.json
COPY packages/i18next-fluent/package.json ./packages/i18next-fluent/package.json
COPY packages/i18next-fluent/tsconfig.json ./packages/i18next-fluent/tsconfig.json
COPY packages/rtk-rest-api/package.json ./packages/rtk-rest-api/package.json
COPY packages/rtk-rest-api/tsconfig.json ./packages/rtk-rest-api/tsconfig.json
COPY packages/rtk-rest-api/example/package.json ./packages/rtk-rest-api/example/package.json
COPY packages/track-processors-js-main/package.json ./packages/track-processors-js-main/package.json

RUN yarn install --silent
COPY app ./app
COPY packages ./packages
RUN yarn $BUILD_TYPE

FROM nginx:alpine
COPY --from=Build /app/dist /usr/share/nginx/html

ENV CONTROLLER_HOST=localhost:8000
ENV INSECURE=false
ENV BASE_URL=http://localhost:3000
ENV OIDC_ISSUER=localhost:8080
ENV OIDC_CLIENT_ID=Frontend

COPY ./ci/entrypoint.sh /docker-entrypoint.d/40-configure-app.sh
RUN chmod +x /docker-entrypoint.d/40-configure-app.sh
COPY ./ci/nginx.conf /etc/nginx/conf.d/default.conf
