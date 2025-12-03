# Varnish Supervisor Changelog

All notable changes to the `Varnish Supervisor` will be documented here. This includes products built on the Supervisor, like `Varnish Orca`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
