# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

FROM nginx:alpine-slim
ARG DIST_FOLDER=dist
COPY /$DIST_FOLDER /usr/share/nginx/html

ENV CONTROLLER_HOST=localhost:8000
ENV INSECURE=false
ENV BASE_URL=http://localhost:3000
ENV OIDC_ISSUER=localhost:8080
ENV OIDC_CLIENT_ID=Frontend

COPY ./ci/entrypoint.sh /docker-entrypoint.d/40-configure-app.sh
RUN chmod +x /docker-entrypoint.d/40-configure-app.sh
COPY ./ci/nginx.conf /etc/nginx/nginx.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /etc/nginx

USER nginx

CMD ["nginx", "-g", "daemon off;"]
