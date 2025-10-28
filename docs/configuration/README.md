# Configuration Reference

This is the reference documentation for the Supervisor YAML configuration file.

The YAML format is a dictionary where each top level key represents a subsystem within the Supervisor.

## [`virtual_registry`](./virtual-registry.md) / [`remotes`](./remotes.md)

```yaml
virtual_registry:
  registries:
   - name: example
     remotes:
     - url: https://example.com
```

## [`varnish`](./varnish.md) / [`params`](./varnish-params.md)

```yaml
varnish:
  http:
  - port: 80
  params:
    workspace_backend: 128k
```

## [`otel`](./otel.md)

```yaml
otel:
  service_name: example
  metrics:
    endpoint: http://prometheus:9090/api/v1/otlp/v1/metrics
```

## [`supervisor`](./supervisor.md)

```yaml
supervisor:
  log_level: error
```

## [`acme`](./acme.md)

```yaml
acme:
  email: foo@example.com
  domains:
  - example.com
```

## [`license`](./license.md)

```yaml
license:
  file: /etc/varnish-supervisor/license.lic
```
