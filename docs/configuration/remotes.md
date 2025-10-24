# Remotes configuration

`remotes` are configured per [Vritual Registry](./virtual-registry.md
)`:

```yaml
virtual_registry:
  registries:
   - name: example
     remotes:
     - url: https://example.com
```

Remotes are selected according to the defined `load_balancer` policy (`fallback` by default). When a remote does not respond, or responds with response status 5xx, a different remote is selected and the fetch is retried. Fetches are retried until one of the following conditions are met:

- We get a non-5xx response from the remote.
- We have retried `varnish.params.max_retries` times.
- We have tried all the remotes.

## `url` *string*

```yaml
# (...)
     remotes:
     - url: https://example.com
```

URL of the remote, on the form `scheme://host:port`.

Scheme can be `http` or `https`. If omitted, defaults to `https` if port has been set to `443`, defaults to `http` otherwise.

Host can be an IP address or a domain name. If the domain name resolves to multiple IP addresses, traffic is load balanced evenly over them.

## `priority` *integer*

```yaml
# (...)
     remotes:
     - url: https://example.com
       priority: 2
```

**Default:** `1`

Priority can be used to divide a list of remotes into distinct load balancer groups. A remote from the highest priority group is always chosen first, and groups with lower priority are only selected if none of the higher priority give a successful response.

Priority increases with a *lower* numerical value. `1` is the highest possible priority.

## `weight` *number*

```yaml
# (...)
     remotes:
     - url: https://example.com
       weight: 10
```

**Default:** `1`

Weight can be used to shift the traffic distribution over the list of remotes. Has no effect when the `failover` load balancer policy is used.

Weight increases with a *higher* numerical value. `1` is the lowest possible weight.

## `probe`

Configuration for a health check probe to monitor the availability of a remote.

### `url` *string*

```yaml
# (...)
     remotes:
     - url: https://example.com
       probe:
         url: /healthz
```

URL of the remote, on the form `/path`. It is mandatory to set either `url` or `tcponly`, and they are mutually exclusive.

### `interval` *number*

**Default:** 5

The number of seconds between health checks.

### `timeout` *number*

```yaml
# (...)
     remotes:
     - url: https://example.com
       probe:
         url: /healthz
         interval: 5
```

**Default:** 2

The timeout in seconds for each health check.

### `expected_response` *integer*

```yaml
# (...)
     remotes:
     - url: https://example.com
       probe:
         url: /healthz
         expected_response: 404
```

**Default:** `200`

Expected HTTP status code from the health check endpoint.

### `window` *integer*

```yaml
# (...)
     remotes:
     - url: https://example.com
       probe:
         url: /healthz
         window: 5
```

**Default:** 8

The number of most recent health check results to consider when determining health.

### `threshold` *integer*

```yaml
# (...)
     remotes:
     - url: https://example.com
       probe:
         url: /healthz
         threshold: 4
```

**Default:** 3

The minimum number of successful checks in the window required to be considered healthy

### `tcponly` *boolean*

```yaml
# (...)
     remotes:
     - url: https://example.com
       probe:
         tcponly: true
```

**Default:** `false`

Perform a TCP health check instead of HTTP.
