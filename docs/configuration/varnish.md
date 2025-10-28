# Varnish Configuration

```yaml
varnish:
  http:
  - port: 80
```

General configuration for Varnish. At least one `http` or `https` listen endpoint must be specified, all other parameters are optional.

**`varnish:`**

- [`http` *list*](#http-list)
  - [`port` *integer*](#port-integer)
  - [`address` *string*](#address-string)
- [`https` *list*](#https-list)
  - [`port` *integer*](#port-integer-1)
  - [`address` *string*](#address-string-1)
  - [`certificates` *list*](#certificates-list)
- [`storage` *list*](#storage-list)
  - [`location` *string*](#location-string)
  - [`size` *string*](#size-string)
- [`admin_port`](#admin_port)
- [`path` *string*](#path-string)
- [`params` *list*](#params-list)


## `http` *list*

A list of HTTP ports for Varnish to bind and listen to. Varnish needs at least one `http` port or one `https` port.

### `port` *integer*

```yaml
varnish:
  http:
  - port: 80
```

The port number to listen to. If `address` is not also specified, varnish will listen on all available interfaces.

### `address` *string*

```yaml
varnish:
  http:
  - address: 127.0.0.1:80
```

The interface address to bind to. Can specify both address and port, or used in combination with `port`.

## `https` *list*

A list of HTTPS listeners for Varnish to bind to. Each listener must have at least one certificate.

### `port` *integer*

```yaml
varnish:
  https:
  - port: 443
    certificates:
    - self_singed: example.com
```

The port number to listen to. If `address` is not also specified, varnish will listen on all available interfaces.

### `address` *string*

```yaml
varnish:
  http:
  - address: 127.0.0.1:443
    certificates:
    - self_singed: example.com
```

The interface address to bind to. Can specify both address and port, or used in combination with `port`.

### `certificates` *list*

The certificates to use for this HTTPS listener.

#### `combined` *string*

```yaml
varnish:
  https:
  - port: 443
    certificates:
    - combined: /tmp/combined.pem
```

Path to a combined certificate and private key PEM file. Mutually exclusive with `cert` and `private_key`.

#### `cert` *string*

```yaml
varnish:
  https:
  - port: 443
    certificates:
    - cert: /etc/varnish-supervisor/cert.crt
      private_key: /etc/varnish-supervisor/private.key
```

Path to a certificate PEM file. If specified, a `private_key` must be specified as well.

#### `private_key` *string*

```yaml
varnish:
  https:
  - port: 443
    certificates:
    - cert: /etc/varnish-supervisor/cert.crt
      private_key: /etc/varnish-supervisor/private.key
```

Path to a private key PEM file. If specified, a `cert` must be specified as well.

#### `self_signed` *string*

```yaml
varnish:
  https:
  - port: 443
    certificates:
    - self_signed: "localhost"
    - self_signed: "*.localhost"
    - self_signed: "example.com"
```

Generate a self-signed certificate. This is useful for testing with clients that accept non-trusted certificates. Supports wildcards for wildcard TLS certificates.

For automatic trusted TLS, see [ACME](acme.md).

## `storage` *list*

*Note: Enterprise feature*

Configure a persistent cache for Varnish to use. This will generate the appropriate MSE 4 configuration and initialize it with `mkfs.mse4`. Changes to the config will be applied upon restart of the Supervisor.

### `location` *string*

```yaml
varnish:
  storage:
  - location: /etc/varnish-supervisor/storage/disk1
    size: 1000G
```

Path to directory where the the storage should be created. The backing storage must have space to fit `size` bytes. Each storage must have a `location` and a `size`.

### `size` *string*

```yaml
varnish:
  storage:
  - location: /etc/varnish-supervisor/storage/disk1
    size: 1000G
```

The size of storage to create. Appropriate MSE 4 books and store sizes are calculated based on this number. Each storage must have a `location` and a `size`.

## `admin_port`

```yaml
varnish:
  admin_port: 1234
```

**Default:** `1092`

Target port for the reverse admin interface.

## `path` *string*

```yaml
varnish:
  path: /path/to/varnishd
```

**Default:** Derived from system `$PATH`

Path to the `varnishd` binary to use.

## `params` *list*

```yaml
varnish:
  params:
    workspace_backend: 128k
```

Parameters for Varnish. See [`params`](./varnish-params.md).
