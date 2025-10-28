# Varnish Orca Documentation

Welcome to the documentation for **Varnish Orca**. This documentation will help you install, configure, and operate Varnish Orca in your environment.

## Table Of Contents

- [Getting Started](./getting-started.md)

- [Installation](./installation.md)
  - [Docker](./installation.md#docker)
  - [Docker Compose](./installation.md#docker-compose)
  - [Kubernetes](./installation.md#kubernetes)
  - [Debian/Ubuntu](./installation.md#install-on-debianubuntu)
  - [RHEL/CentOS](./installation.md#install-on-rhelcentos)

- [Configuration Reference](./configuration/README.md)
  - [Virtual Registry](./configuration/virtual-registry.md)
  - [Remotes](./configuration/remotes.md)
  - [Supervisor](./configuration/supervisor.md)
  - [Varnish](./configuration/varnish.md)
  - [Varnish Parameters](./configuration/varnish-params.md)
  - [ACME TLS](./configuration/acme.md)
  - [OpenTelemetry](./configuration/otel.md)
  - [License](./configuration/license.md)

## Configuration

The following configuration file is installed at `/etc/varnish-supervisor/orca.yaml`:

```yaml
varnish:
  http:
  - port: 80
  https:
  - port: 443
    certificates:
    - self_signed: example.com
virtual_registry:
  registries:
  - name: dockerhub
    remotes:
    - url: https://docker.io
```

This configuration is used by default, both by the Docker container and `systemd` service.

## Environment

The Supervisor can be configured with the following Environment variable:

### `SUPERVISOR_CONFIG`

Path to the Supervisor YAML configuration. Overridden by `--config`.

## Command Line

The configuration file is passed to the Supervisor with the `--config` command line option:

```sh
supervisor --config /etc/varnish-supervisor/default.yaml
```

Multiple configuration files can be specified, separated by `:`:

```sh
supervisor --config ./example-config.yaml:./additional-config.yaml
```

Configuration files are applied in order of appearance. If two config files define the same option, the latter overwrites the former. Objects are merged and lists are replaced.

## systemd

The default configuration and a systemd service file is installed by the DEB/RPM packages. The service file starts the Supervisor with `/etc/varnish-supervisor/default.yaml`.
