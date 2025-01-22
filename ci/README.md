[TOC]

# building docker container

## pnpm

### production (local)

```
pnpm docker:prod
```

This will create a container with the tag `web-app:local`.

### profiling (local)

```
pnpm docker:profiling
``` 

This will create a container with the tag `web-app:local-profiling`.

## docker

### production

```
pnpm build
```

```
docker build -f ./ci/Dockerfile -t YOUR_CONTAINER_TAG .
```

### profiling

```
pnpm build:profiling
```

```
docker build -f ./ci/Dockerfile --build-arg DIST_FOLDER=dist-profiling -t YOUR_CONTAINER_TAG .
```

# use the container images

To run the container, use a command similar to:

```bash
podman run --rm -p 127.0.0.1:3000:80/tcp -e CONTROLLER_HOST=YOUR_CONTROLLER_HOST -e OIDC_ISSUER=YOUR_OIDC_ISSUER -e OIDC_CLIENT_ID=YOUR_OIDC_CLIENT_ID web-app:local
```

or using docker:

```bash
docker run -p 127.0.0.1:3000:80/tcp -e CONTROLLER_HOST=YOUR_CONTROLLER_HOST -e OIDC_ISSUER=YOUR_OIDC_ISSUER -e OIDC_CLIENT_ID=YOUR_OIDC_CLIENT_ID web-app:local
```

The frontend will then be available via <http://localhost:3000>
