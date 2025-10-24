# Varnish Configuration

```yaml
varnish:
  http:
  - port: 80
```

General configuration for Varnish. At least one `http` or `https` listen endpoint must be specified, all other parameters are optional.

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

## `params`

Configuration for Varnish parameters.

### `accept_filter` *boolean*

```yaml
varnish:
  params:
    accept_filter:: true
```

**Default:** `true`

Enable kernel accept-filters.

### `acceptor_sleep_decay` *number*

```yaml
varnish:
  params:
    acceptor_sleep_decay:: 0.9
```

**Default:** `0.9`

Sleep duration reduction for each successful accept (0.9 = reduce by 10%).

### `acceptor_sleep_incr` *number*

```yaml
varnish:
  params:
    acceptor_sleep_incr:: 0
```

**Default:** `0`

How much longer we sleep, each time we fail to accept a new connection.

### `acceptor_sleep_max` *number*

```yaml
varnish:
  params:
    acceptor_sleep_max:: 0.05
```

**Default:** `0.05`

Maximum sleep duration between attempts to accept new connections.

### `auto_restart` *boolean*

```yaml
varnish:
  params:
    auto_restart:: true
```

**Default:** `true`

Automatically restart the child/worker process if it dies.

### `backend_cooloff` *number*

```yaml
varnish:
  params:
    backend_cooloff:: 60
```

**Default:** `60`

How long we wait before cleaning up deleted backends.

### `backend_idle_timeout` *number*

```yaml
varnish:
  params:
    backend_idle_timeout:: 60
```

**Default:** `60`

Timeout before we close unused backend connections.

### `backend_local_error_holddown` *number*

```yaml
varnish:
  params:
    backend_local_error_holddown:: 10
```

**Default:** `10`

Prevent connection attempts after local resource shortage errors.

### `backend_remote_error_holddown` *number*

```yaml
varnish:
  params:
    backend_remote_error_holddown:: 0.25
```

**Default:** `0.25`

Prevent connection attempts after remote connection errors.

### `backend_wait_limit` *integer*

```yaml
varnish:
  params:
    backend_wait_limit:: 0
```

**Default:** `0`

Maximum transactions that can queue waiting for a backend connection.

### `backend_wait_timeout` *number*

```yaml
varnish:
  params:
    backend_wait_timeout:: 0
```

**Default:** `0`

Default time transactions wait for backend connections before giving up.

### `ban_cutoff` *integer*

```yaml
varnish:
  params:
    ban_cutoff:: 0
```

**Default:** `0`

Expurge long tail content to keep bans below this value. 0 disables.

### `ban_dups` *boolean*

```yaml
varnish:
  params:
    ban_dups:: true
```

**Default:** `true`

Eliminate older identical bans when a new ban is added.

### `ban_lurker_age` *number*

```yaml
varnish:
  params:
    ban_lurker_age:: 60
```

**Default:** `60`

The ban lurker will ignore bans until they are this old.

### `ban_lurker_batch` *integer*

```yaml
varnish:
  params:
    ban_lurker_batch:: 1000
```

**Default:** `1000`

Ban lurker sleeps after examining this many objects.

### `ban_lurker_holdoff` *number*

```yaml
varnish:
  params:
    ban_lurker_holdoff: 0.01
```

**Default:** `0.01`

How long ban lurker sleeps when giving way to lookup due to lock contention.

### `ban_lurker_sleep` *number*

```yaml
varnish:
  params:
    ban_lurker_sleep:: 0.01
```

**Default:** `0.01`

How long ban lurker sleeps after examining objects.

### `between_bytes_timeout` *number*

```yaml
varnish:
  params:
    between_bytes_timeout:: 60
```

**Default:** `60`

Seconds to wait between bytes received from backend before giving up.

### `cli_limit` *string*

```yaml
varnish:
  params:
    cli_limit:: 128k
```

**Default:** `128k`

Maximum size of CLI response.

### `cli_timeout` *number*

```yaml
varnish:
  params:
    cli_timeout:: 60
```

**Default:** `60`

Timeout for child replies to CLI requests from management.

### `clock_skew` *integer*

```yaml
varnish:
  params:
    clock_skew: 10
```

**Default:** `10`

How much clockskew we accept between backend and our own clock.

### `clock_step` *number*

```yaml
varnish:
  params:
    clock_step:: 10
```

**Default:** `10`

How much observed clock step we accept before we panic.

### `connect_timeout` *number*

```yaml
varnish:
  params:
    connect_timeout:: 3.5
```

**Default:** `3.5`

Default connection timeout for backend connections.

### `critbit_cooloff` *number*

```yaml
varnish:
  params:
    critbit_cooloff:: 180
```

**Default:** `180`

How long critbit hasher keeps deleted objheads on cooloff list.

### `debug` *string*

```yaml
varnish:
  params:
    debug:: ""
```

**Default:** `""`

Enable/Disable various kinds of debugging.

### `default_grace` *number*

```yaml
varnish:
  params:
    default_grace:: 10
```

**Default:** `10`

Default grace period for expired objects.

### `default_keep` *number*

```yaml
varnish:
  params:
    default_keep:: 0
```

**Default:** `0`

Default keep period for objects after grace.

### `default_ttl` *number*

```yaml
varnish:
  params:
    default_ttl:: 120
```

**Default:** `120`

TTL assigned to objects if neither backend nor VCL assigns one.

### `epitaphs` *integer*

```yaml
varnish:
  params:
    epitaphs:: 3
```

**Default:** `3`

Maximum messages child can add to its gravestone.

### `esi_iovs` *integer*

```yaml
varnish:
  params:
    esi_iovs:: 10
```

**Default:** `10`

Number of io vectors to allocate on thread workspace for ESI requests.

### `esi_limit` *integer*

```yaml
varnish:
  params:
    esi_limit:: 10
```

**Default:** `10`

Limit for ESI fragments processed in parallel at each ESI level.

### `experimental` *string*

```yaml
varnish:
  params:
    experimental:: ""
```

**Default:** `""`

Enable/Disable experimental features.

### `feature` *string*

```yaml
varnish:
  params:
    feature:: +http2
```

**Default:** `+http2`

Enable/Disable various minor features.

### `fetch_chunksize` *string*

```yaml
varnish:
  params:
    fetch_chunksize:: 16k
```

**Default:** `16k`

Default chunksize used by fetcher.

### `fetch_maxchunksize` *string*

```yaml
varnish:
  params:
    fetch_maxchunksize:: 0.25G
```

**Default:** `0.25G`

Maximum chunksize we attempt to allocate from storage.

### `first_byte_timeout` *number*

```yaml
varnish:
  params:
    first_byte_timeout:: 60
```

**Default:** `60`

Default timeout for receiving first byte from backend.

### `gzip_buffer` *string*

```yaml
varnish:
  params:
    gzip_buffer:: 32k
```

**Default:** `32k`

Size of malloc buffer used for gzip processing.

### `gzip_level` *integer*

```yaml
varnish:
  params:
    gzip_level:: 6
```

**Default:** `6`

Gzip compression level: 0=debug, 1=fast, 9=best.

### `gzip_memlevel` *integer*

```yaml
varnish:
  params:
    gzip_memlevel:: 6
```

**Default:** `6`

Gzip memory level 1=slow/least, 9=fast/most compression.

### `h2_header_table_size` *string*

```yaml
varnish:
  params:
    h2_header_table_size:: 4k
```

**Default:** `4k`

HTTP2 header table size.

### `h2_initial_window_size` *string*

```yaml
varnish:
  params:
    h2_initial_window_size:: 65535b
```

**Default:** `65535b`

HTTP2 initial flow control window size.

### `h2_max_concurrent_streams` *integer*

```yaml
varnish:
  params:
    h2_max_concurrent_streams: 100
```

**Default:** `100`

HTTP2 maximum number of concurrent streams.

### `h2_max_frame_size` *string*

```yaml
varnish:
  params:
    h2_max_frame_size:: 16k
```

**Default:** `16k`

HTTP2 maximum per frame payload size.

### `h2_max_header_list_size` *string*

```yaml
varnish:
  params:
    h2_max_header_list_size:: 0b
```

**Default:** `0b`

HTTP2 maximum size of uncompressed header list.

### `h2_rapid_reset` *number*

```yaml
varnish:
  params:
    h2_rapid_reset:: 1
```

**Default:** `1`

Threshold for treating RST_STREAM as suspect after HEADERS.

### `h2_rapid_reset_limit` *integer*

```yaml
varnish:
  params:
    h2_rapid_reset_limit:: 100
```

**Default:** `100`

Maximum allowed stream resets over time period.

### `h2_rapid_reset_period` *number*

```yaml
varnish:
  params:
    h2_rapid_reset_period:: 60
```

**Default:** `60`

Sliding window duration for h2_rapid_reset_limit.

### `h2_rx_window_increment` *string*

```yaml
varnish:
  params:
    h2_rx_window_increment: 1M
```

**Default:** `1M`

HTTP2 receive window increments.

### `h2_rx_window_low_water` *string*

```yaml
varnish:
  params:
    h2_rx_window_low_water: 10M
```

**Default:** `10M`

HTTP2 receive window low water mark.

### `h2_rxbuf_storage` *string*

```yaml
varnish:
  params:
    h2_rxbuf_storage: Transient
```

**Default:** `Transient`

Storage backend for HTTP/2 receive buffers.

### `h2_window_timeout` *number*

```yaml
varnish:
  params:
    h2_window_timeout: 5
```

**Default:** `5`

HTTP2 time limit without window credits.

### `http_brotli_support` *boolean*

```yaml
varnish:
  params:
    http_brotli_support: true
```

**Default:** `true`

Enable brotli support.

### `http_gzip_support` *boolean*

```yaml
varnish:
  params:
    http_gzip_support: true
```

**Default:** `true`

Enable gzip support.

### `http_max_hdr` *integer*

```yaml
varnish:
  params:
    http_max_hdr: 64
```

**Default:** `64`

Maximum number of HTTP header lines.

### `http_range_support` *boolean*

```yaml
varnish:
  params:
    http_range_support: true
```

**Default:** `true`

Enable support for HTTP Range headers.

### `http_req_hdr_len` *string*

```yaml
varnish:
  params:
    http_req_hdr_len: 8k
```

**Default:** `8k`

Maximum length of any HTTP client request header.

### `http_req_size` *string*

```yaml
varnish:
  params:
    http_req_size: 32k
```

**Default:** `32k`

Maximum bytes of HTTP client request.

### `http_resp_hdr_len` *string*

```yaml
varnish:
  params:
    http_resp_hdr_len: 8k
```

**Default:** `8k`

Maximum length of any HTTP backend response header.

### `http_resp_size` *string*

```yaml
varnish:
  params:
    http_resp_size: 32k
```

**Default:** `32k`

Maximum bytes of HTTP backend response.

### `idle_send_timeout` *number*

```yaml
varnish:
  params:
    idle_send_timeout: 60
```

**Default:** `60`

Send timeout for individual pieces of data on client connections.

### `last_byte_timeout` *number*

```yaml
varnish:
  params:
    last_byte_timeout: 0
```

**Default:** `0`

Maximum time to wait for complete backend response.

### `listen_depth` *integer*

```yaml
varnish:
  params:
    listen_depth: 1024
```

**Default:** `1024`

Listen queue depth.

### `lru_interval` *number*

```yaml
varnish:
  params:
    lru_interval: 2
```

**Default:** `2`

Grace period before object moves on LRU list.

### `max_esi_depth` *integer*

```yaml
varnish:
  params:
    max_esi_depth: 5
```

**Default:** `5`

Maximum depth of esi:include processing.

### `max_restarts` *integer*

```yaml
varnish:
  params:
    max_restarts: 4
```

**Default:** `4`

Upper limit on how many times a request can restart.

### `max_retries` *integer*

```yaml
varnish:
  params:
    max_retries: 4
```

**Default:** `4`

Upper limit on how many times a backend fetch can retry.

### `max_vcl` *integer*

```yaml
varnish:
  params:
    max_vcl: 100
```

**Default:** `100`

Threshold of loaded VCL programs.

### `max_vcl_handling` *integer*

```yaml
varnish:
  params:
    max_vcl_handling: 1
```

**Default:** `1`

Behaviour when attempting to exceed max_vcl loaded VCL.

### `memory_arenas` *integer*

```yaml
varnish:
  params:
    memory_arenas: 0
```

**Default:** `0`

Number of jemalloc arenas for object payload storage.

### `memory_stat_interval` *number*

```yaml
varnish:
  params:
    memory_stat_interval: 0.1
```

**Default:** `0.1`

Interval between memory usage statistics updates.

### `memory_target` *string*

```yaml
varnish:
  params:
    memory_target: 80%
```

**Default:** `80%`

Target RssAnon memory usage when memory governor is active.

### `nuke_limit` *integer*

```yaml
varnish:
  params:
    nuke_limit: 50
```

**Default:** `50`

Maximum objects we attempt to nuke to make space.

### `numa_aware` *boolean*

```yaml
varnish:
  params:
    numa_aware: false
```

**Default:** `false`

Become NUMA aware for better CPU utilization.

### `object_mutex_slots` *integer*

```yaml
varnish:
  params:
    object_mutex_slots: 4096
```

**Default:** `4096`

Number of mutex and condvar slots for per object signalling.

### `pcre_match_limit` *integer*

```yaml
varnish:
  params:
    pcre_match_limit: 10000
```

**Default:** `10000`

Limit for calls to internal match() function in pcre_exec().

### `pcre_match_limit_recursion` *integer*

```yaml
varnish:
  params:
    pcre_match_limit_recursion: 20
```

**Default:** `20`

Recursion depth-limit for internal match() function.

### `ping_interval` *integer*

```yaml
varnish:
  params:
    ping_interval: 3
```

**Default:** `3`

Interval between pings from parent to child.

### `pipe_timeout` *number*

```yaml
varnish:
  params:
    pipe_timeout: 60
```

**Default:** `60`

Idle timeout for PIPE sessions.

### `pool_req` *string*

```yaml
varnish:
  params:
    pool_req: 10,100,10
```

**Default:** `10,100,10`

Parameters for per worker pool request memory pool.

### `pool_sess` *string*

```yaml
varnish:
  params:
    pool_sess: 10,100,10
```

**Default:** `10,100,10`

Parameters for per worker pool session memory pool.

### `pool_sslbuffer` *string*

```yaml
varnish:
  params:
    pool_sslbuffer: 10,100,10
```

**Default:** `10,100,10`

Parameters for the SSL buffer pool (min_pool, max_pool, max_age).

### `pool_vbo` *string*

```yaml
varnish:
  params:
    pool_vbo: 10,100,10
```

**Default:** `10,100,10`

Parameters for per worker pool VBO memory pool.

### `prefer_ipv6` *boolean*

```yaml
varnish:
  params:
    prefer_ipv6: false
```

**Default:** `false`

Prefer IPv6 address when connecting to backends.

### `rush_exponent` *integer*

```yaml
varnish:
  params:
    rush_exponent: 3
```

**Default:** `3`

How many parked requests we start for each completed request on an object.

### `reuseport` *boolean*

```yaml
varnish:
  params:
    reuseport: false
```

**Default:** `false`

Enable SO_REUSEPORT socket option.

### `send_timeout` *number*

```yaml
varnish:
  params:
    send_timeout: 600
```

**Default:** `600`

Total timeout for ordinary HTTP1 responses.

### `shortlived` *number*

```yaml
varnish:
  params:
    shortlived: 10
```

**Default:** `10`

Objects created with TTL shorter than this are not subject to LRU.

### `shutdown_close` *boolean*

```yaml
varnish:
  params:
    shutdown_close: false
```

**Default:** `false`

Control if listen sockets should be closed during `shutdown_delay` upon reception of SIGTERM.

### `shutdown_delay` *number*

```yaml
varnish:
  params:
    shutdown_delay: 0
```

**Default:** `0`

Delay before shutting down the management process upon reception of SIGTERM.

### `sigsegv_handler` *boolean*

```yaml
varnish:
  params:
    sigsegv_handler: true
```

**Default:** `true`

Install a signal handler to dump debug info on segmentation faults, bus errors, and abort signals.

### `slicer_excess_ratio` *number*

```yaml
varnish:
  params:
    slicer_excess_ratio: 0.5
```

**Default:** `0.5`

How much larger than the configured segment size the last segment is allowed to be.

### `ssl_buffer` *string*

```yaml
varnish:
  params:
    ssl_buffer: 20k
```

**Default:** `20k`

Size of the SSL buffer.

### `startup_timeout` *number*

```yaml
varnish:
  params:
    startup_timeout: 600
```

**Default:** `600`

How long to wait for child startup.

### `syslog_cli_traffic` *boolean*

```yaml
varnish:
  params:
    syslog_cli_traffic: true
```

**Default:** `true`

Log all CLI traffic to syslog(LOG_INFO).

### `tcp_fastopen` *boolean*

```yaml
varnish:
  params:
    tcp_fastopen: false
```

**Default:** `false`

Enable the TCP Fast Open extension.

### `tcp_keepalive_intvl` *number*

```yaml
varnish:
  params:
    tcp_keepalive_intvl: 75
```

**Default:** `75`

The number of seconds between TCP keep-alive probes.

### `tcp_keepalive_probes` *integer*

```yaml
varnish:
  params:
    tcp_keepalive_probes: 9
```

**Default:** `""`

Maximum number of TCP keep-alive probes to send before killing the connection.

### `tcp_keepalive_time` *number*

```yaml
varnish:
  params:
    tcp_keepalive_time: 7200
```

**Default:** `""`

Seconds a connection must be idle before TCP sends keep-alive probes.

### `thread_pool_add_delay` *number*

```yaml
varnish:
  params:
    thread_pool_add_delay: 0
```

**Default:** `0`

Wait at least this long after creating a thread.

### `thread_pool_destroy_delay` *number*

```yaml
varnish:
  params:
    thread_pool_destroy_delay: 1
```

**Default:** `1`

Wait at least this long after destroying a thread pool.

### `thread_pool_fail_delay` *number*

```yaml
varnish:
  params:
    thread_pool_fail_delay: 0.2
```

**Default:** `0.2`

Wait at least this long after a failed thread creation.

### `thread_pool_max` *integer*

```yaml
varnish:
  params:
    thread_pool_max: 5000
```

**Default:** `5000`

Maximum number of worker threads in each pool.

### `thread_pool_min` *integer*

```yaml
varnish:
  params:
    thread_pool_min: 100
```

**Default:** `100`

Minimum number of worker threads in each pool.

### `thread_pool_reserve` *integer*

```yaml
varnish:
  params:
    thread_pool_reserve: 0
```

**Default:** `0`

The number of worker threads reserved for vital tasks.

### `thread_pool_stack` *string*

```yaml
varnish:
  params:
    thread_pool_stack: 48k
```

**Default:** `48k`

Worker thread stack size.

### `thread_pool_timeout` *number*

```yaml
varnish:
  params:
    thread_pool_timeout: 300
```

**Default:** `300`

Thread idle threshold for destroying threads.

### `thread_pool_track` *boolean*

```yaml
varnish:
  params:
    thread_pool_track: false
```

**Default:** `false`

Keep track of running worker threads and tasks queued in the pools.

### `thread_pool_watchdog`  *number*

```yaml
varnish:
  params:
    thread_pool_watchdog: 60
```

**Default:** `60`

If no queued work has been released for this long, the worker process panics itself.

### `thread_pools` *integer*

```yaml
varnish:
  params:
    thread_pools: 2
```

**Default:** `2`

Number of worker thread pools.

### `thread_queue_limit` *integer*

```yaml
varnish:
  params:
    thread_queue_limit: 0
```

**Default:** `0`

Permitted request queue length per thread-pool.

### `thread_stats_rate` *integer*

```yaml
varnish:
  params:
    thread_stats_rate: 10
```

**Default:** `10`

Worker thread statistics update rate limit.

### `timeout_idle` *number*

```yaml
varnish:
  params:
    timeout_idle: 5
```

**Default:** `5`

Idle timeout for client connections.

### `timeout_linger` *number*

```yaml
varnish:
  params:
    timeout_linger: 0.05
```

**Default:** `0.05`

How long to linger on connections when close requested.

### `timeout_req` *number*

```yaml
varnish:
  params:
    timeout_req: 5
```

**Default:** `5`

Max time to receive client request.

### `timeout_reqbody` *number*

```yaml
varnish:
  params:
    timeout_reqbody: 0
```

**Default:** `0`

Maximum time to receive a client request body.

### `tls_handshake_timeout` *number*

```yaml
varnish:
  params:
    tls_handshake_timeout: 8
```

**Default:** `8`

Default timeout for completion of the TLS handshake.

### `tls_ja3` *boolean*

```yaml
varnish:
  params:
    tls_ja3: false
```

**Default:** `false`

Enable JA3 fingerprint.

### `tls_ocsp_auto` *boolean*

```yaml
varnish:
  params:
    tls_ocsp_auto: false
```

**Default:** `false`

Enable automatic OCSP staple configuration.

### `tls_ocsp_default_ttl` *number*

```yaml
varnish:
  params:
    tls_ocsp_default_ttl: 7200
```

**Default:** `7200`

How long to consider an OCSP response fresh if it lacks a `nextUpdate` property.

### `tls_ocsp_dir` *string*

```yaml
varnish:
  params:
    tls_ocsp_dir: /var/lib/varnish-ocsp
```

**Default:** `/var/lib/varnish-ocsp`

Directory where Varnish keeps a cache of OCSP responses.

### `tls_ocsp_fetch_limit` *integer*

```yaml
varnish:
  params:
    tls_ocsp_fetch_limit: 10
```

**Default:** `10`

Upper limit for the number of OCSP responses fetched in parallel.

### `tls_ocsp_force_ttl` *number*

```yaml
varnish:
  params:
    tls_ocsp_force_ttl: 0
```

**Default:** `0`

Force TTL for OCSP responses.

### `tls_ocsp_refresh_ratio` *number*

```yaml
varnish:
  params:
    tls_ocsp_refresh_ratio: 0.5
```

**Default:** `0.5`

Specifies when to refresh an OCSP response given as a ratio of its lifetime.

### `transit_buffer` *string*

```yaml
varnish:
  params:
    transit_buffer: 0
```

**Default:** `0`

The default prefetch amount used during a single private transaction.

### `uncacheable_ttl` *number*

```yaml
varnish:
  params:
    uncacheable_ttl: 120
```

**Default:** `120`

The TTL assigned to uncacheable objects by the built-in VCL.

### `vcc_err_unref` *boolean*

```yaml
varnish:
  params:
    vcc_err_unref: false
```

**Default:** `false`

Unreferenced VCL objects are errors, not warnings.

### `vcl_cooldown` *number*

```yaml
varnish:
  params:
    vcl_cooldown: 600
```

**Default:** `600`

How long a VCL is kept warm after being replaced as the active VCL.

### `vsl_buffer` *string*

```yaml
varnish:
  params:
    vsl_buffer: 4k
```

**Default:** `4k`

VSL buffer size.

### `vsl_mask` *string*

```yaml
varnish:
  params:
    vsl_mask: -Debug,-ObjProtocol,-ObjStatus,-ObjReason,-ObjHeader,-VCL_trace,-ExpKill,-WorkThread,-Hash,-VfpAcct,-H2RxHdr,-H2RxBody,-H2TxHdr,-H2TxBody
```

**Default:** `-Debug,-ObjProtocol,-ObjStatus,-ObjReason,-ObjHeader,-VCL_trace,-ExpKill,-WorkThread,-Hash,-VfpAcct,-H2RxHdr,-H2RxBody,-H2TxHdr,-H2TxBody`

VSL tag mask.

### `vsl_reclen` *integer*

```yaml
varnish:
  params:
    vsl_reclen: 4084b
```

**Default:** `4084b`

Maximum number of bytes in SHM log record.

### `vsl_space` *string*

```yaml
varnish:
  params:
    vsl_space: 80M
```

**Default:** `80M`

The amount of space to allocate for the VSL fifo buffer.

### `vsm_free_cooldown` *number*

```yaml
varnish:
  params:
    vsm_free_cooldown: 60
```

**Default:** `60`

How long VSM memory is kept warm after a deallocation.

### `vsm_publish_interval` *number*

```yaml
varnish:
  params:
    vsm_publish_interval: 1
```

**Default:** `1`

The minimum interval that new VSM segment indexes are published.

### `vst_space` *string*

```yaml
varnish:
  params:
    vst_space: 10M
```

**Default:** `10M`

The amount of space to allocate for a VST memory segment.

### `workspace_backend` *string*

```yaml
varnish:
  params:
    workspace_backend: 64k
```

**Default:** `64k`

Bytes of HTTP protocol workspace for backend HTTP req/resp.

### `workspace_client` *string*

```yaml
varnish:
  params:
    workspace_client: 64k
```

**Default:** `64k`

Bytes of HTTP protocol workspace for clients HTTP req/resp.

### `workspace_session` *string*

```yaml
varnish:
  params:
    workspace_session: 0.75k
```

**Default:** `0.75k`

Bytes of session workspace.

### `workspace_thread` *string*

```yaml
varnish:
  params:
    workspace_thread: 2k
```

**Default:** `2k`

Bytes of auxiliary workspace per thread.

### `ykey_mem_digest_split_bits` *integer*

```yaml
varnish:
  params:
    ykey_mem_digest_split_bits: 4
```


**Default:** `4`

Number of bits used to select a tree set based on the ykey hash for non-persisted objects.

### `ykey_mem_tree_split` *integer*

```yaml
varnish:
  params:
    ykey_mem_tree_split: 7
```

**Default:** `7`

Number of trees to spread ephemeral objects with the same hash across.
