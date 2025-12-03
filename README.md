<p align="center">
  <img src="https://raw.githubusercontent.com/varnish/orca/refs/heads/main/media/varnish-orca.svg" width="250" alt="Varnish Orca Logo">
</p>

# Varnish Orca

Varnish Orca is a **Virtual Registry Manager**: a fast pull-through cache for artifact registries.

Deploy it close to your developers and CI/CD pipelines to reduce build times and egress costs.

**But why Orca?**

Orca outperforms traditional repository managers by leveraging Varnish Enterprise to cache packages directly at the HTTP layer.

- **No database:** Cutting out the database simplifies setup and removes the most common bottleneck.

- **Transparent:** A Virtual Registry behaves just like its remote counterpart, except downloads complete much faster.

- **Secure:** Keep using your existing credentials, the Virtual Registry automatically checks client authorization with the remote registry.

- **Never runs out of space:** Memory and disk caches are self-regulating. A full cache is a healthy cache.

- **Always up to date:** Package manifests are revalidated against the remote registry every time, instantly detecting changes.

Varnish Orca is free to use. A Premium license is available, which enables private repository caching, a persistent disk cache, and additional enterprise features.

## Getting Started

*Note: This is a tutorial for users running Linux on an x86 platform.*

As an example of what you can do with Orca, we will use the pre-configured Virtual Registry for DockerHub to cache `docker pull`s.

First, configure your Docker daemon use a registry mirror on `http://localhost`. Open or create `/etc/docker/daemon.json` and add the following JSON:

```json
{
  "registry-mirrors": ["http://localhost"]
}
```

Restart the Docker daemon for the changes to take effect:

```sh
sudo systemctl restart docker
```

Now we are ready to run Orca:

```sh
docker run -p 80:80 varnish/orca
```

In another terminal window, run the following command:

```sh
for i in {1..2}; do docker rmi node &>/dev/null; time docker pull node; done
```

Unless you have a very fast connection to DockerHub, you should see the second pull take significantly less time as it's served from cache:

First Pull:

```
Using default tag: latest
latest: Pulling from library/node
708274aafe49: Pull complete
8cdff261ed5c: Pull complete
078b2eece9b2: Pull complete
a1208d53eb06: Pull complete
78c780840163: Pull complete
435cbc1d6a03: Pull complete
29dd662fc17f: Pull complete
73d86704c819: Pull complete
Digest: sha256:7478f3725ef76ce6ba257a6818ea43c5eb7eb5bd424f0c3df3a80ff77203305e
Status: Downloaded newer image for node:latest
docker.io/library/node:latest

real    0m32,442s
user    0m0,087s
sys     0m0,068s
```

Second pull:

```
Using default tag: latest
latest: Pulling from library/node
708274aafe49: Pull complete
8cdff261ed5c: Pull complete
078b2eece9b2: Pull complete
a1208d53eb06: Pull complete
78c780840163: Pull complete
435cbc1d6a03: Pull complete
29dd662fc17f: Pull complete
73d86704c819: Pull complete
Digest: sha256:7478f3725ef76ce6ba257a6818ea43c5eb7eb5bd424f0c3df3a80ff77203305e
Status: Downloaded newer image for node:latest
docker.io/library/node:latest

real    0m11,030s
user    0m0,024s
sys     0m0,022s
```

The remaining time is consumed by the Docker daemon doing a single threaded decompression of each layer. This is done by the Docker daemon, which is why the `user` CPU seconds seems low here.

This works because Orca's [default configuration](./docs/default-configuration.md) includes a Virtual Registry for DockerHub, which looks like this:

```yaml
virtual_registry:
  registries:
  - name: dockerhub
    default: true
    remotes:
    - url: https://docker.io
    - url: https://mirror.gcr.io
```

This is using `docker.io` as the main registry with a fallback to Google's mirror in case DockerHub goes down.

## Installation

🐋 **Docker**

```sh
docker pull varnish/orca
```

⎈ **Helm**

```sh
helm pull oci://docker.io/varnish/orca-chart
```

Orca is also available as installable packages for Debian and RHEL based systems. See [the installation guide](./docs/installation.md).

## Configuration

Orca is configured with a YAML. The Orca-specific configuration can be found under the [virtual_registry](./docs/configuration/virtual-registry.md) configuration, while more general configuration have their own sections in the same file.

Here is an example:

```yaml
varnish:
  params:
    workspace_backend: 128k
  https:
  - port: 443
    certificates:
    - cert: /path/to/cert.crt
      private_key: /path/to/private.key
otel:
  service_name: orca
  metrics:
    endpoint: http://prometheus:9090/api/v1/otlp/v1/metrics
virtual_registry:
  registries:
  - name: npmjs
    default: true
    remotes:
    - url: https://registry.npmjs.org
```

For more options, see the full [configuration reference](./docs/configuration/README.md).

## Documentation

The documentation for Orca is currently hosted in this repo under [docs](./docs/README.md).

## License

Each release of Varnish Orca has a free embedded license that lasts for one year after release date. To keep using Orca for free, you have to upgrade Orca at least once per year.

If you have purchased a Premium license, see [instructions for installing the license](./docs/tutorials/license.md).

## Upgrade to Premium

Varnish Orca is free to use for public registries, with a Premium edition supporting private registries and features like Persisted Cache, OpenTelemetry Tracing and programmability with VCL.

Contact orca@varnish-software.com for a quote.

## Contributing

For the time being, both Varnish Supervisor and Varnish Enterprise are closed-source, but feel free to open an issue if you have any problems or suggestions.

You can also contact us directly at orca@varnish-software.com.
