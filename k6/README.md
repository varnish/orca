# Automated k6 tests for Varnish Orca

You can run the two k6 scripts directly through `k6 run artifactory.js` and `k6 run docker_pull.js`. However, there is a shell script that injects environment variables from a `.env` file, and that reduces the number of metrics that are tracked:

- To simulate `docker pull` requests, run `./k6_docker.sh`
- To synthetically overload an Artifactory server, run `./k6_artifactory.sh`

## Environment variables

You can set the following environment variables to configure the registry that the k6 scripts are connecting to:

```shell
REGISTRY_URL=http://docker.localhost
REGISTRY_NAME=docker
AUTH_USERNAME=username
AUTH_PASSWORD=password
```

Just set the environment variables in a `.env` file, and the `*.sh` helper scripts will parse them.

If you're using the the Docker Hub, the `REGISTRY_NAME` environment variable can be left empty.

For Artifactory setups, just create a generic registry in Artifactory and set it through the `REGISTRY_NAME` environment variable. Make sure you have a Virtual Registry entry in your Orca configuration file for your Artifactory setup.

The following environment variables can be used for an Artifactory test:

```shell
REGISTRY_URL=http://artifactory.localhost
REGISTRY_NAME=test-generic
AUTH_USERNAME=admin
AUTH_PASSWORD=password
```

These enviroment variables assume there is a Virtual Registry entry named `artifactory`. The `artifactory.localhost` URL resolves to `127.0.0.1`. The name of the generic Artifactory registry that is used in the tests is called `test-generic`. The authenticate, use the `admin`, `password` credentials.

By switching the value of `REGISTRY_URL` between the Virtual Registry and the actual registry, you can see the before and after.

### Optional OpenTelemetry environment variables

K6 has OpenTelemetry support. You can add the relevant environment variables to `.env` to configure OpenTelemetry.

Here's an example:

```shell
K6_OTEL_SERVICE_NAME=k6-service
K6_OTEL_METRIC_PREFIX=k6-
K6_OTEL_EXPORT_INTERVAL=5s
K6_OTEL_EXPORTER_PROTOCOL=http/protobuf
K6_OTEL_HTTP_EXPORTER_INSECURE=true
K6_OTEL_EXPORTER_ENDPOINT=http://localhost:4318
K6_OTEL_HTTP_EXPORTER_URL_PATH=/v1/metrics
```

Add `-o opentelemetry` to your `k6 run` command to use `k6` OpenTelemetry metrics.