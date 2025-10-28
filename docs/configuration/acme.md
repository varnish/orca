
# ACME Configuration

Configuration for the ACME automated TLS certificate resolver.

```yaml
acme:
  email: foo@example.com
  domains:
  - example.com
```

**`acme:`**

- [`email` *string*](#email-string)
- [`domains` *list*](#domains-list)
- [`ca_server` *string*](#ca_server-string)
- [`http_port` *integer*](#http_port-integer)
- [`renew_before_days` *integer*](#renew_before_days-integer)
- [`fetch_timeout_sec` *integer*](#fetch_timeout_sec-integer)


## `email` *string*

```yaml
acme:
  email: foo@example.com
```

Email address for ACME account registration.

**Type:** String

## `domains` *list*

```yaml
acme:
  domains:
  - example.com
```

Domains to obtain certificates for.

**Type:** List of strings

## `ca_server` *string*

```yaml
acme:
  ca_server: staging
```

**Default:** `production`

ACME CA server URL.

Options:

* `production`: LetsEncrypt production server (https://acme-v02.api.letsencrypt.org/directory)
* `staging`: LetsEncrypt staging server (https://acme-staging-v02.api.letsencrypt.org/directory)
* Custom URL

## `http_port` *integer*

```yaml
acme:
  http_port: 6080
```

**Default:** `80`

Port for ACME HTTP-01 challenge server.

## `renew_before_days` *integer*

```yaml
acme:
  renew_before_days: `15`
```

**Default:** `30`

Days before expiry to renew certificates.

## `fetch_timeout_sec` *integer*

```yaml
acme:
  fetch_timeout_sec: 150
```

**Default:** `300`

Timeout for initial certificate fetching.
