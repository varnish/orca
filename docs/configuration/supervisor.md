# Supervisor Configuration

Configuration for the Varnish Supervisor itself.

**`supervisor:`**

- [`log_output` *string*](#log_output-string)
- [`log_level` *string*](#log_level-string)
- [`work_dir` *string*](#work_dir-string)


## `log_output` *string*

```yaml
supervisor:
  log_output: stderr
```

**Default:** `stdout`

Where to write Supervisor (control plane) logs.

Options:

* `stdout`: Log to stdout
* `stderr`: Log to stderr
* `discard`: Discard logs
* file path: Write logs to a file

## `log_level` *string*

```yaml
supervisor:
  log_level: warn
```

**Default:** `stdout`

Change the log level of the Supervisor (control plane) logs.

Options:

* `info`: Log at info level.
* `warn`: Log at warning level.
* `error`: Log at error level.
* `debug`: Log at debug level.

## `work_dir` *string*

```yaml
supervisor:
  work_dir: /tmp/varnish-supervisor
```

**Default:** `/var/lib/varnish-supervisor`

The working directory for storing state, logs, and other runtime files.
