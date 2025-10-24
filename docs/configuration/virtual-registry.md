# `virtual_registry`

```yaml
virtual_registry:
  registries:
   - name: example
     remotes:
     - url: https://example.com
```

Configuration for the Virtual Registry. A registry should have a `name` and must have a `remote`, all other parameters are optional.

## `registries` *list*

List of virtual registries.

### `name` *string*

```yaml
virtual_registry:
  registries:
  - name: example
```

**Default:** `default`

The registry name should be short, unique, and recognizable. It is used for subdomain routing when there are multiple registries and metrics are segmented on registry name.

### `default` *boolean*

```yaml
virtual_registry:
  registries:
  - name: example
    default: true
```

**Default:** `false`

If set to `true`, all requests that don't match any other registry subdomain will be handled by this registry. Only one registry can be the default registry.

If only one registry is specified, it automatically becomes the default registry.

### `load_balancer` *string*

```yaml
virtual_registry:
  registries:
  - name: example
    load_balancer: random
```

**Default:** `fallback`

The load balancing policy to use when there are multiple remotes.

- `fallback`: Use remotes in order of appearance. The first remote is selected first, then retries go down through the list.
- `random`: Balance traffic to remotes evenly. A random remote is selected from the list and retries never pick the same backend twice for a given fetch.
- `hash`: Pick the same remote for the same cache key. A consistent hashing algorithm is used to select a remote and retries pick new remotes in a consistent order.

### `auth_ttl` *number*

*Note: Enterprise feature*

```yaml
virtual_registry:
  registries:
  - name: example
    auth_ttl: 3600
```

**Default:** `3600`

The number of seconds to cache each users authorization per artifact. Setting this to `0` causes the users authorization to be checked against the remote registry on every request.

### `remotes` *list*

```yaml
virtual_registry:
  registries:
   - name: example
     remotes:
     - url: https://example.com
```

List of remotes. See [remotes configuration](./remotes.md).
