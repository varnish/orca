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
- [`storage`](#storage)
  - [`stores` *list*](#stores-list)
  - [`default_category` *string*](#default_category-string)
- [`admin_port` *integer*](#admin_port-integer)
- [`path` *string*](#path-string-1)
- [`params`](#params)

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

## `storage`

*Note: Orca Premium feature*

Configure a persistent cache for Varnish to use. This will generate the appropriate Massive Storage Engine (MSE) 4 configuration and initialize it with `mkfs.mse4`. Changes to the config will be applied upon restart of the Supervisor.

### `stores` *list*

A list of stores for the persisted cache. A [store](https://docs.varnish-software.com/varnish-enterprise/features/mse_4/persisted/#the-store) appears as a single large file on the file system and is used to persist chunks of cached objects.

An auxiliary file called a [book](https://docs.varnish-software.com/varnish-enterprise/features/mse_4/persisted/#the-book) is created alongside the store, which keeps track of where the object chunks in the store are and other metadata such as cache invalidation keys and checksums for durable storage.

Each store must have a `name`, `path` and `size`.

#### `name` *string*

```yaml
varnish:
  storage:
    stores:
    - name: disk1
      path: /etc/varnish-supervisor/storage/disk1
      size: 1000G
```

The unique identifying name for this store.

#### `path` *string*

```yaml
varnish:
  storage:
    stores:
    - name: disk1
      path: /etc/varnish-supervisor/storage/disk1
      size: 1000G
```

Path to a directory where the the store and book files will be created at Supervisor startup. The backing storage must have space to fit `size` bytes.

#### `size` *string*

```yaml
varnish:
  storage:
    stores:
    - name: disk1
      path: /etc/varnish-supervisor/storage/disk1
      size: 1000G
```

Size of the store to create. Available case-insensitive units are `K`, `M`, `G`, and `T`.

The size includes the size of the book (`5G` by default) and filesystem overhead (`1G`), so the size of the store file can be calculated as:

```
store_size = size - book_size - 1G.
```

Must be larger than `book_size` + `1G`.

#### `book_size` *string*

```yaml
varnish:
  storage:
    stores:
    - name: disk1
      path: /etc/varnish-supervisor/storage/disk1
      size: 1000G
      book_size: 2G
```

**Default:** `5G`

Change the size of a store's [book](https://docs.varnish-software.com/varnish-enterprise/features/mse_4/persisted/#the-book). When the size of a book is increased, the size of the store is decreased, and vice versa.

#### `category` *string*

```yaml
varnish:
  storage:
    default_category: other
    stores:
    - name: disk1
      path: /disk1
      size: 1000G
      category: media.video
    - name: disk2
      path: /disk2
      size: 1000G
      category: media.video
    - name: icons
      path: /disk3/icons
      size: 50G
      category: media.images.icons
    - name: pictures
      path: /disk3/pictures
      size: 150G
      category: media.images.pictures
    - name: other
      path: /disk3/other
      size: 800G
      category: other
```

Assign a [category](https://docs.varnish-software.com/varnish-enterprise/features/mse_4/categories/) to the store. This reserves the store to be used exclusively for objects of the same category. Multiple stores can have the same category, in which case objects are spread [evenly](https://docs.varnish-software.com/varnish-enterprise/features/mse_4/persisted/#store-selection) over the stores.

Object category can be set in VCL `sub vcl_backend_response` with the `mse4` VMOD:

```vcl
mse4.set_category("media.video");
```

If no category has been set in VCL, the category defined by `default_category` is used.

Categories are a tree structure, and each store category must be a leaf-node in that tree. This means that if one store has the category `media.images.icons`, another store cannot have the category `media.images`.

When categories are used, all stores must have a category and `default_category` must be set.

### `default_category` *string*

```yaml
varnish:
  storage:
    default_category: blobs
    stores:
    - name: manifests
      path: /disk1/manifests
      size: 100G
      category: manifests
    - name: objects
      path: /disk1/objects
      size: 900G
      category: objects
```

The default category to use if no category have been set in VCL.

Required if categories are used.

## `admin_port` *integer*

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

## `params`

```yaml
varnish:
  params:
    workspace_backend: 128k
```

Parameters for Varnish. See [`params`](./varnish-params.md).
