# Varnish Supervisor Changelog

All notable changes to the `Varnish Supervisor` will be documented here. This includes products built on the Supervisor, like `Varnish Orca`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-02-23

**Varnish version:** [6.0.16r10](https://docs.varnish-software.com/varnish-enterprise/changelog/#varnish-enterprise-6-0-16r10-2026-01-14)

### Added

- Added OTEL logs support via the `otel.logs` configuration block. Logs are exported to a configurable OTLP endpoint and do not require a license.

- Added configurable trace sampling via the `otel.tracing.sampler` configuration option. Supported samplers: `always_on`, `always_off`, `traceidratio`, `parentbased_always_on`, `parentbased_always_off`, `parentbased_traceidratio`. Ratio-based samplers accept an `otel.tracing.sampler_arg` value between `0.0` and `1.0`.

- Added a cache invalidation yKeys for resource types. All objects now get a `resource_manifest`, `resource_package` or `resource_other` key.

**Varnish Orca**

- Added `base_url` option to the virtual registry configuration. This is used whenever the proxy needs to rewrite a response header or body to direct the client back to the virtual registry.

- Added policy for proxying JFrog UI.

### Changed

- Upgraded `varnish-otel` to v2.2.0, which adds trace sampling and OTEL logs support.

- Remote endpoints are now resolved preemptively in `vcl_backend_fetch` using `utils.resolve_backend()`. The Host header is explicitly set based on the remote URL Host. This should not produce a noticeable change.

- Improved cache policy for NPM traffic. All `/-/` endpoints are now marked uncacheable. Manifests are now always marked as must-revalidate, meaning they are not cached, but coalesced and candidates for 304 revalidation and stale-if-error.

- Added stricter checking for undefined configuration options. This should make it easier to catch typos in the YAML config.

- The `WWW-Authenticate` response header is now transparently rewritten when it directs the client to a different domain than the effective `base_url`. The original URL is preserved and used when the client comes back to authenticate. This enables auth when the upstream registry is not directly accessible by the client.

- For `202 Created` responses, the `Location` header is also rewritten in the same fashion as `WWW-Authenticate`. This enables OCI uploads when the upstream registry is not directly accessible by the client.

### Fixed

- Fixed varnish-otel failing to find Varnish shared memory when workdir is not explicitly configured.

- Fixed retrying requests when the load balancer has no remaining healthy and unused backends available.

- Fixed a `beresp.ttl` + `req.ttl` interaction that resulted in objects marked as must-revalidate not being considered for 304 revalidation and stale-if-error.

- Fixed an issue where OCI uploads would fail with a 404 because the registry returns different responses for HEAD and GET. HEAD requests from OCI clients are now proxied through without a lookup in cache.

- Fixed IPv6 client IPs not being considered local for cache invalidation access.

## [0.6.3] - 2025-12-17

**Varnish version:** [6.0.16r8](https://docs.varnish-software.com/varnish-enterprise/changelog/#varnish-enterprise-6-0-16r8-2025-12-03)

### Fixed

- Loosen Varnish version license restrictions to ease installation from deb and rpm packages when a new version of `varnish-plus` is released. Each `varnish-supervisor` release targets a specific minimum version of Varnish, but it should be possible to use a newer version of `varnish-plus` than the minimum version.

## [0.6.2] - 2025-12-01

**Varnish version:** [6.0.16r7](https://docs.varnish-software.com/varnish-enterprise/changelog/#varnish-enterprise-6-0-16r7-2025-11-24)

### Fixed

**Varnish Orca**

- Fixed a syntax error in the VCL.

## [0.6.1] - 2025-12-01

**Varnish version:** [6.0.16r7](https://docs.varnish-software.com/varnish-enterprise/changelog/#varnish-enterprise-6-0-16r7-2025-11-24)

### Fixed

- Fixed the version for the embedded Varnish Orca license.

## [0.6.0] - 2025-11-27

**Varnish version:** [6.0.16r7](https://docs.varnish-software.com/varnish-enterprise/changelog/#varnish-enterprise-6-0-16r7-2025-11-24)

### Added

- Added support for [persisted storage categories](https://docs.varnish-software.com/varnish-enterprise/features/mse_4/categories/).
- Added optional `book_size` to tune the size of persisted storage books.

**Varnish Orca**

- Added `default_ttl`, `default_grace`, and `default_keep` options for Virtual Registries to override the global `varnish.params` with the same name. Like the global params, these only apply to responses that don't have an explicit cache policy or `Cache-Control` header from the remote registry.

### Changed

- The configuration format for `varnish.storage` has changed. While this technically a breaking change, it's a licensed feature that has not been put in production anywhere yet. We saw this as an opportunity to do some final polish on the config format without introducing a real breaking change.
- When possible, requests for package manifests are now coalesced when multiple clients request the same manifest at the same time. This can reduce repeat requests to the remote registry while always keeping the manifests fresh.

**Varnish Orca**

- Artifacts classified as "other" no longer share a cache namespace with artifacts classified with a specific package type. This resulted in inconsistent cache policies being applied to certain objects, giving them a longer than intended lifetime.
- Registries now have separate cache namespaces. This eliminates potential issues with staging/production setups where repositories and packages have the same name but different manifests. Objects with an immutable cache policy still share a global namespace, so cross-registry Docker layer caching will continue tow work as normal.
- Introduced Stale-If-Error for all cacheable objects, delivering stale objects in case the remote registry is unreachable or produces 5xx responses. Access control for private repositories is still maintained, relying on cached per-user, per-artifact authorization for access control.

### Fixed

- Metrics export now works properly without a license.
- Several issues fixed in the `varnish.storage` subsystem. The MSE configuration should now be changed to reflect changes in the storage configuration in all cases.

## [0.5.0] - 2025-11-14

**Varnish version:** [6.0.16r6](https://docs.varnish-software.com/varnish-enterprise/changelog/#varnish-enterprise-6-0-16r6-2025-10-23)

### Added

**Varnish Orca**

- Improved cache policy for PyPi. `*.whl`, `*.tar.gz`, and `*.zip` objects are now cached indefinitely while `*/simple/*` is explicitly treated as uncacheable.

### Fixed

- Files under `/etc/varnish` now has the correct `varnish` owner in Docker.

**Varnish Orca**

- Cache invalidation yKeys for registry name and package type are now created properly.
- Private repositories are no longer treated as public when the private repository caching feature is disabled. Private repository traffic is now passed through the proxy transparently. Does not apply to public OCI repositories, they maintain the previous behavior due to the Authorization header being required.
- Improved cache policy for Maven. Most objects are now cached indefinitely while `maven-metadata.xml` is explicitly treated as uncacheable.

## [0.4.0] - 2025-11-04

**Varnish version:** [6.0.16r4](https://docs.varnish-software.com/varnish-enterprise/changelog/#varnish-enterprise-6-0-16r4-2025-10-03)

### Added

- Initial release.
