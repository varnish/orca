# License Configuration

Configuration for the Premium License. The license unlocks Orca Premium functionality not available in the free version.

```yaml
license:
  file: /etc/varnish-supervisor/license.lic
```

**`license:`**
- [`text` *string*](#text-string)
- [`file` *string*](#file-string)

## `text` *string*

```yaml
license:
  text: |
    <License>
```

Provide a license as text in the configuration.

## `file` *string*

```yaml
license:
  file: /etc/varnish-supervisor/license.lic
```

Provide a path to the license.
