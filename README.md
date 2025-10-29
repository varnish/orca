# Varnish Orca

Varnish Orca is a *Virtual Registry Manager* designed to proxy public and private artifact registries (DockerHub, NPM, PyPi, GitHub, Artifactory, etc.) and cache them close to developers and CI/CD pipelines.

## Getting Started

```sh
docker run -p 80:80 varnish/orca
```

Then try pulling the `node` Docker image twice:

```sh
for i in {1..2}; do docker rmi localhost/library/node &>/dev/null; time docker pull localhost/library/node; done
```

Unless you have a very fast connection to DockerHub, you should see the second pull take significantly less time as it's served from cache.

This works out-of-the-box because Varnish Orca includes configuration for a DockerHub Virtual Registry, which looks like this:

```yaml
virtual_registry:
  registries:
  - name: dockerhub
    default: true
    remotes:
    - url: https://docker.io
    - url: https://mirror.gcr.io

```

This is using `docker.io` as the main registry with a fallback to Google's mirror in case DockerHub goes down. You can change the default registry or add additional registries to the list, which become available at subdomains determined by their `name`.

See [the installation guide](./docs/installation.md) for deploying the Docker image or installing on Debian/Ubuntu and RHEL/CentOS.

## Feature Highlights

- **Always up to date:** The requested artifact's manifest is checked for changes in the remote registry.
- **Resilient:** Keep serving from cache and zero-error failover to mirrors.
- **Push and pull:** Uploads are proxied through Varnish while downloads are streamed to the client and cached at the same time.
- **Deploy anywhere:** Runs on pretty much any x86-based linux machine.
- **Extensive artifact support**: Support for OCI, NPM, Git, Go, and many more.
- **Automatic TLS:** Built-in ACME certificate resolver and updater.
- **Observability:** Integrated OpenTelemetry metrics exporter.

### Enterprise:

- **Cache private repositories:** Automatic access control integration for private repositories.
- **Persisted cache:** Extend and persist the memory cache with Massive Storage Engine (MSE).
- **OpenTelemetry Tracing:** Observe requests as they flow through your network.
- **Programmable:** Apply your own logic to the request handling with Varnish Configuration Language (VCL).

## Behind the scenes

Varnish Orca is built with two distinct components:

- **Varnish Enterprise**: [High performance](https://www.varnish-software.com/about-us/press/varnish-intel-achieve-breakthrough-in-cdn-efficiency/) cache and reverse proxy, written in C.
- **Varnish Supervisor**: Control process and integration layer, written in go.

The process tree looks like this: the `supervisor` starts `varnishd`, which in turn starts `cache-main`:

```
supervisor───varnishd───cache-main
```

Varnish Orca is a subsystem of the Supervisor containing all the logic needed to operate Varnish as a Virtual Registry. See the [virtual_registry](./docs/configuration/virtual-registry.md) configuration section for how to configure Virtual Registries.

## Why use a Virtual Registry?

**Developers** prefer using Virtual Registries because dependency downloads and CI Pipelines complete faster, meaning less waiting and less friction.

**Platform Engineers** deploy Virtual Registries because they scale to virtually any size, control exposure to the internet, and make migrating from one service to another easy.

**CTOs** choose Virtual Registries because they reduce egress fees, license costs, and increase developer productivity.

## Upgrade to Enterprise

The cost model is simple: Varnish Orca is free to use for public registries, with an Enterprise edition supporting private registries and features like Persisted Cache, OpenTelemetry Tracing and programmability with VCL.

Contact sales@varnish-software.com for a quote.

## Contributing

For the time being, both Varnish Supervisor and Varnish Enterprise are closed-source, but feel free to open an issue if you have any problems or suggestions.
