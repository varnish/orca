# Varnish Supervisor Changelog

All notable changes to the `Varnish Supervisor` will be documented here. This includes products built on the Supervisor, like `Varnish Orca`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
