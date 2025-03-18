# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

FROM nginxinc/nginx-unprivileged:alpine-slim

USER root

ARG DIST_FOLDER=dist
COPY /$DIST_FOLDER /usr/share/nginx/html

ENV CONTROLLER_HOST=localhost:8000
ENV INSECURE=false
ENV BASE_URL=http://localhost:3000
ENV OIDC_ISSUER=localhost:8080
ENV OIDC_CLIENT_ID=Frontend
ENV USERID=1000
ENV GROUPID=1000
ENV PORT=80

COPY ./ci/entrypoint.sh /docker-entrypoint.d/40-configure-app.sh
RUN chmod +x /docker-entrypoint.d/40-configure-app.sh
COPY ./ci/nginx-default.conf.template /etc/nginx/templates/default.conf.template
COPY ./ci/nginx.conf /etc/nginx/

RUN chown -R nobody:nobody /usr/share/nginx/html && \
        chmod -R 777 /usr/share/nginx/html && \
        chown -R nobody:nobody /var/cache/nginx && \
        chown -R nobody:nobody  /var/log/nginx && \
        chown -R nobody:nobody  /etc/nginx && \
        chmod -Rf 777  /etc/nginx

USER $USERID:$GROUPID

CMD ["nginx", "-g", "daemon off;"]
