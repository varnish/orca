# OpenTelemetry Configuration

Configuration for the integrated OpenTelemetry exporter. A recognizable `service_name` should be set, and at least one `endpoint`. All other parameters are optional.

```yaml
otel:
  service_name: example
  metrics:
    endpoint: http://prometheus:9090/api/v1/otlp/v1/metrics
```

**`otel:`**

- [`service_name` *string*](#service_name-string)
- [`metrics`](#metrics)
  - [`endpoint` *string*](#endpoint-string)
  - [`protocol` *string*](#protocol-string)
  - [`export_interval` *integer*](#export_interval-integer)
- [`tracing`](#tracing)
  - [`endpoint` *string*](#endpoint-string-1)
  - [`protocol` *string*](#protocol-string-1)
  - [`export_interval` *integer*](#export_interval-integer-1)

## `service_name` *string*

```yaml
otel:
  service_name: example
```

**Default:** `varnish-supervisor`

Service name for metrics identification

## `metrics`

Metrics exporter configuration.

### `endpoint` *string*

```yaml
otel:
  metrics:
    endpoint: http://prometheus:9090/api/v1/otlp/v1/metrics
```

OpenTelemetry endpoint URL for metrics export.

### `protocol` *string*

```yaml
otel:
  metrics:
    protocol: grpc
```

**Default:** `http/protobuf`

Options:

- `http/protobuf`
- `grpc`
- `http/json`

Protocol to use when exporting metrics.

### `export_interval` *integer*

```yaml
otel:
  metrics:
    export_interval: 30
```

**Default:** `60`

Metrics export interval in seconds.

## `tracing`

*Note: Orca Premium feature*

### `endpoint` *string*

```yaml
otel:
  tracing:
    endpoint: http://prometheus:9090/api/v1/otlp/v1/metrics
```

OpenTelemetry endpoint URL for trace export.

### `protocol` *string*

```yaml
otel:
  tracing:
    protocol: grpc
```

**Default:** `http/protobuf`

Options:

- `http/protobuf`
- `grpc`
- `http/json`

Protocol to use when exporting traces.

### `export_interval` *integer*

```yaml
otel:
  tracing:
    export_interval: 5
```

**Default:** `5`

Tracing batch export interval in seconds.
