# Configuration Overview

The following configuration file is installed at `/etc/varnish-supervisor/default.yaml` (in Docker as well):

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

The configuration file is passed to the Supervisor with the  `--config` command line option:

```sh
./supervisor --config /etc/varnish-supervisor/default.yaml
```

Multiple configuration files can be specified, separated by `:`:

```sh
./supervisor --config ./example-config.yaml:./additional-config.yaml
```

Configuration files are applied in order of appearance. If two config files define the same option, the latter overwrites the former. Objects are merged and lists are replaced.

## YAML Configuration

The YAML configuration is divided into the following sections:

### [`virtual_registry`](./vitual-registry.md)

Configure one or more virtual registries.

- [`registries`](./vitual-registry.md#registries-list)

### [`remotes`](./remotes.md)

Configure remote endpoints for virtual registries.

- [`url`](./remotes.md#url-string)
- [`priority`](./remotes.md#priority-integer)
- [`weight`](./remotes.md#weight-number)
- [`probe`](./remotes.md#probe)

### [`varnish`](./varnish.md)

Configure Varnish.

- [`http`](./varnish.md#http-list)
- [`https`](./varnish.md#https-list)
- [`storage`](./varnish.md#storage-list)
- [`admin_port`](./varnish.md#admin-port)
- [`path`](./varnish.md#path-string)
- [`params`](./varnish.md#params)

### [`otel`](./otel.md)

Configure OpenTelemetry metrics and traces exporter.

- [`service_name`](./otel.md#service-name-string)
- [`metrics`](./otel.md#metrics)
- [`tracing`](./otel.md#tracing)

### [`supervisor`](./supervisor.md)

Configure the Supervisor process.

- [`log_output`](./supervisor.md#log-output-string)
- [`log_level`](./supervisor.md#log-level-string)
- [`work_dir`](./supervisor.md#work-dir-string)

### [`acme`](./acme.md)

Configure automatic TLS with ACME.

- [`email`](./acme.md#email-string)
- [`domains`](./acme.md#domains-list)
- [`ca_server`](./acme.md#ca-server-string)
- [`http_port`](./acme.md#http-port-integer)
- [`renew_before-days`](./acme.md#renew-before-days-integer)
- [`fetch_timeout_sec`](./acme.md#fetch-timeout-sec-integer)

### [`license`](./license.md)

Add an Enterprise License.

- [`text`](./license.md#text-string)
- [`file`](./license.md#file-string)

# Environment

The Supervisor can be configured with the following Environment variable:

## `SUPERVISOR_CONFIG`

Path to the Supervisor YAML configuration. Overridden by `--config`.
