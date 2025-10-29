# Docker Cache

This tutorial assumes you have Varnish Orca running on your local machine, see [the installation guide](../installation.md) for setup instructions.

The [default configuration](../default-configuration.md) includes a Virtual Registry for DockerHub, which we are going to use and modify during the course of this tutorial.

- [DockerHub is the default registry](#dockerhub-is-the-default-registry)
- [Pull a Docker image through the Virtual Registry](#pull-a-docker-image-through-the-virtual-registry)
- [Configure the Virtual Registry as a DockerHub Mirror](#configure-the-virtual-registry-as-a-dockerhub-mirror)
- [Adding additional registries](#adding-additional-registries)
- [Multiple Registry Remotes](#multiple-registry-remotes)
- [Cache Policy](#cache-policy)
- [Private Docker Registries](#private-docker-registries)

## DockerHub is the default registry

The default Virtual Registry is DockerHub, determined by `default: true`:

```yaml
virtual_registry:
  registries:
  - name: dockerhub
    default: true
    remotes:
    - url: https://docker.io
    - url: https://mirror.gcr.io
```

All traffic is directed to this Virtual Registry unless the request's subdomain matches the name of any of the other registries in the configuration.

## Pull a Docker image through the Virtual Registry

Run the following `docker pull`:

```sh
docker pull localhost/minio/minio
```

*Note: The URL scheme (http:// and https://) should never be included in Docker commands and port is optional when using 80 or 443*

You should see something like following output:

```sh
docker pull localhost/minio/minio
Using default tag: latest
latest: Pulling from minio/minio
b83ce1c86227: Pull complete
f94d28849fa3: Pull complete
81260b173076: Pull complete
f9c0805c25ee: Pull complete
1008deaf6ec4: Pull complete
71e9fc939447: Pull complete
c1bc68842c41: Pull complete
0288b5a0d7e7: Pull complete
34013573f278: Pull complete
Digest: sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e
Status: Downloaded newer image for localhost/minio/minio:latest
localhost/minio/minio:latest
```

The image has now been cached in the Virtual Registry. Remove the image and try pulling it again:

```sh
docker rmi -f localhost/minio/minio
docker pull localhost/minio/minio
```

The following happens behind the scenes:

1. The client re-authenticates against DockerHub (public DockerHub repositories do token authentication behind the scenes)
2. The Virtual Registry checks the `latest` manifest for any changes in the remote
3. All the previously fetched layers are served from cache. If any layers have changes, those are fetched and cached.

This image has 10 layers, so we should see our cache hit count go up by 10 every time the image is pulled. We can verify this by looking at the `ACCG.dockerhub.total.client_hit_count` metric:

```sh
sudo varnishstat -1 | grep ACCG.dockerhub.total.client_hit_count
ACCG.dockerhub.total.client_hit_count                            10         0.00 Number of client request hits
```

## Configure the Virtual Registry as a DockerHub Mirror

For images hosted on Docker Hub (docker.io), it is common to drop the registry host entirely, as the Docker client defaults to pulling images from `https://registry-1.docker.io.

To avoid having to add the address of the Virtual Registry when referencing images in Docker Hub, the `docker` daemon can be configured to use the Virtual Registry as a *registry-mirror*.

*Note: This only works out-of-the-box with DockerHub. If you are using a different registry, the `registry-mirrors` option won't have any effect*

**Step 1:** Open `/etc/docker/daemon.json` in your favorite editor and add the following:

```json
"registry-mirrors": ["http://localhost"]
```

`localhost` here is just an example. If you run the Virtual Registry somewhere else, you should configure a stable DNS name and a TLS certificate.

**Step 2:** Restart the docker daemon:

```sh
sudo systemctl daemon-reload
sudo systemctl restart docker
```

Images in DockerHub can now be pulled from the Virtual Registry transparently:

```sh
docker pull varnish
docker pull minio/minio
```

You may notice that `varnish` in this example does not have a repository name. This is because `varnish` is part of the official DockerHub `library` repository.

If you don't add the Virtual Registry to `"registry-mirrors"`, you will have to pull images in the DokcerHub `library` repository like this:

```sh
docker pull localhost/library/varnish
```

## Adding additional registries

When adding a registry, it is best to choose a relatively short and descriptive name, as the name will appear in logs and metrics. The remote URL should start with `https://`, as most docker registries are HTTPS-only.

There is no need to specify a registry type, as the Virtual Registry detects the request type automatically and selects the appropriate [cache policy](#Cache-Policy).

The default configuration already has an example of this:

```yaml
virtual_registry:
  registries:
  - name: dockerhub
    default: true
    remotes:
    - url: https://docker.io
    - url: https://mirror.gcr.io
  - name: quay
    remotes:
    - url: https://quay.io
```

In this configuration, the Docker Hub registry is set as the default registry, and will be used for all requests unless a different registry is specified. To select a different registry, specify the registry name as the subdomain of the request.

Each registry can be accessed with the registry name as the last subdomain.

```sh
docker pull localhost/library/varnish
```

```sh
docker pull quay.localhost/prometheus/prometheus
```

If the Virtual Registry is not running on `localhost`, the Docker daemon will expect to access the registry with HTTPS. See the [HTTPS configuration](./https.md) for details on how to enable HTTPS for the Virtual Registry.

## Multiple Registry Remotes

A virtual registry can have multiple remotes:

```yaml
virtual_registry:
  registries:
  - name: dockerhub
    default: true
    remotes:
    - url: https://docker.io
    - url: https://mirror.gcr.io
```

This virtual registry will fetch images from the DockerHub by default. But if that registry is unavailable for any reason (fetch error, 5xx response), the Virtual Registry load balancer transparently switches to a DockerHub pull-through cache hosted by Google Artifact Registry.

## Cache Policy

The cache policy for Docker images can be summarized as:

- Manifests referenced by tag, tags, and referrers are never cached.
- `/v2/` and tokens are never cached.
- Manifests referenced by SHA and blobs are cached indefinitely.

In addition, all Docker blobs (image layers) share the same cache namespace as they are keyed on SHA value. This means that a layer from an image in one registry can be used to satisfy a request for a different image in a different registry, increasing cache efficiency.

## Private Docker Registries

*Note: This is an enterprise-only feature.*

The Virtual Registry can also cache Docker images in private registries while maintaining access control. This happens automatically, with no extra configuration required.

When a client tries to access a private Docker image, the Virtual Registry will first query the registry about whether the user has pull access to that image, even if the complete image is already in cache. If the response from the registry is positive, the user gains access to that image for a time determined by the configured `auth_ttl` for that virtual registry. After `auth_ttl` has elapsed, the user credentials are re-authorized against the registry.

During the authorization preflight check, response status 200, 301, 302, and 307 response are considered positive responses, all other are considered negative.

To configure your Docker client to access a private virtual Docker registry, log in with the credentials you would normally use for the actual registry:

```sh

docker login localhost
```
