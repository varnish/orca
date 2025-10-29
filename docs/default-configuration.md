# Default Configuration

The default configuration included in the `varnish/orca` Docker image is:

```yaml
varnish:
  http:
  - port: 80
virtual_registry:
  registries:
  - name: dockerhub
    default: true
    remotes:
    - url: https://docker.io
    - url: https://mirror.gcr.io
  - name: quay
    remotes:
    - url: https://quay.io
  - name: ghcr
    remotes:
    - url: https://ghcr.io
  - name: k8s
    remotes:
    - url: https://registry.k8s.io
  - name: npmjs
    remotes:
    - url: https://registry.npmjs.org
  - name: github
    remotes:
    - url: https://github.com
  - name: gitlab
    remotes:
    - url: https://gitlab.com
```

See the [installation guide](./installation.md) for how to customize your configuration and the [configuration reference](./configuration/README.md) for the available options.
