# Grafana Observability Tutorial

Monitor Varnish Orca with Prometheus, Tempo, and Grafana. Track cache performance, registry traffic, and artifact metrics.

- [Prerequisites](#prerequisites)
- [Overview](#overview)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose-recommended)
- [Configure Existing Orca Installation](#configure-existing-orca-installation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker and Docker Compose installed

**Note:** If using the complete docker-compose example below, Orca is included - no separate installation needed. 
If you're setting up monitoring for an existing Orca installation, see [the installation guide](../installation.md).

## Overview

Varnish Orca includes built-in OpenTelemetry (OTLP) support for exporting metrics and traces.
 This tutorial sets up a complete observability stack:

- **Varnish Orca** pushes metrics and traces via OTLP
- **Prometheus** receives and stores metrics
- **Tempo** receives distributed traces
- **Grafana** visualizes metrics with pre-built dashboards

**Licensing:**
- **Metrics** export is available in the free version (no license required)
- **Tracing** requires a license with `sup-otel` and `vmod-otel` addons (Premium feature)
- Get a trial license at: https://info.varnish-software.com/orca

The dashboard provides insights into:
- Cache hit rates (overall and per virtual registry)
- Request rates and bandwidth by registry and artifact type
- Backend health and error rates
- Storage usage and memory management
- Ykey cache invalidation metrics

## Quick Start with Docker Compose (Recommended)

Everything is pre-configured. Just clone and run:

```sh
git clone https://github.com/varnish/orca.git
cd orca/docs/tutorials/grafana
docker compose up -d
```

This starts:
- Varnish Orca with metrics and tracing configured
- Prometheus with OTLP receiver
- Tempo for distributed tracing
- Grafana with dashboard pre-loaded

**Metrics work immediately.** To enable tracing, uncomment the volumes and license config in `docker-compose.yaml` and mount your license file (needs `sup-otel` and `vmod-otel` addons). See the [license tutorial](../license.md) for details.

Generate some traffic, then open Grafana at http://localhost:3000 (admin/admin).

## Configure Existing Orca Installation

If you already have Orca running and want to add monitoring:

1. **Configure OTLP export** in your Orca config file (typically `/etc/varnish-orca/config.yaml`):
   ```yaml
   otel:
     service_name: varnish-orca
     metrics:
       enabled: true
       endpoint: http://your-prometheus:9090/api/v1/otlp/v1/metrics
       protocol: http/protobuf
   ```

2. **(Optional) Enable tracing** by adding a license with `sup-otel` and `vmod-otel` addons and configuring the tracing endpoint.

See the [OTEL configuration reference](../configuration/otel.md) for all available options and the [license tutorial](../license.md) for how to add a license.

Restart Orca:
```sh
sudo systemctl restart varnish-orca
```

Then set up Prometheus, Tempo, and Grafana using the [example configs](./grafana/) as reference.

## Troubleshooting

### No metrics in Grafana

**Check Prometheus is receiving data:**
```sh
curl http://localhost:9090/api/v1/query?query=varnish_main_client_requests
```

**Docker Compose setup:**
```sh
# Check Orca is running
docker compose ps

# Check Prometheus logs
docker compose logs prometheus

# Check Orca is pushing metrics
docker compose logs orca | grep -i otlp
```

### Common issues

**No data in dashboard:**
- Wait 15 seconds for first metrics export
- Check the `job` label matches what your dashboard expects (set via `service_name` in config)

**Connection refused:**
- Docker Compose: Use service names (`http://prometheus:9090`)
- Host install: Use `http://localhost:9090` or actual hostname
