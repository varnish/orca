# Grafana Dashboards

Pre-built Grafana dashboards for monitoring Varnish Orca.

## Varnish Metrics Dashboard

**File:** `varnish_metrics.json`

Comprehensive dashboard with panels covering:
- Cache hit rates (overall and per virtual registry)
- Request rates and bandwidth by registry and artifact type
- Backend health and error monitoring
- Storage and memory usage
- Ykey cache invalidation metrics

## Usage

### Quick Import

If you already have Grafana and Prometheus set up:

1. Download `varnish_metrics.json`
2. In Grafana: Dashboards → Import → Upload JSON file
3. Select your Prometheus datasource
4. Import

The dashboard uses the `${DS_PROMETHEUS}` variable for datasource portability.

### Complete Setup

For a complete working example with Prometheus, Tempo, and Grafana:

**See the [Grafana Observability Tutorial](../docs/tutorials/grafana.md)**

The tutorial includes a ready-to-use docker-compose stack with the dashboard pre-configured.

## Requirements

- Prometheus with OTLP write receiver enabled
- Varnish Orca configured to export OTLP metrics
- Grafana 9.0+
