# How to register a custom Varnish Orca license

Registering a custom Orca license is quite straightforward, and involves modifying the YAML configuration file.

Here's how you register the license on the various supported platforms.

## Docker

If you installed Orca with the standard configuration by running `docker run --rm -p 80:80 --name orca --platform linux/amd64 varnish/orca`, you'll have to change your `docker run` command and mount a configuration file and a license file:

```sh
docker run --rm -p 80:80 --name orca --platform linux/amd64 \
    -v $(pwd)/config.yaml:/app/config.yaml:ro \
    -v $(pwd)/license.lic:/app/license.lic:ro \
    varnish/orca --config /app/config.yaml
```

This example command will mount `config.yaml` and `license.lic` from your current directory into the container in the `/app` directory. It will also ensure the `/app/config.yaml` file is loaded by Orca.

If you already loaded a custom configuration file, you can skip that step and continue editing your configuration file.

To register a custom license, you have to add the following content to your Orca config file:

```yaml
license:
  file: /app/license.lic
```

Assuming you mounted the license file, Orca will load the licese and use it to unlock the extra features.

## Docker Compose

If you're running Orca with `docker compose`, make sure your `docker-compose.yaml` file has a `volumes` section that mounts the custom configuration file and the license file:

```yaml
services:
  orca:
    image: varnish/orca
    ports:
      - "80:80"
    volumes:
        - ./config.yaml:/app/config.yaml:ro
        - ./license.lic:/app/license.lic:ro
```

Before running `docker compose up`, make sure the following lines are added to `config.yaml`:

```yaml
license:
  file: /app/license.lic
```

## Kubernetes (using the Helm Chart)

If you deployed Orca to a Kubernetes cluster using the Helm Chart, you can upload the license as a Kubernetes secret by running the following `kubectl` command:

```sh
kubectl create secret generic orca-license \
--from-file=./license.lic
```

And then simply add a `license` section to the `supervisorConfig` of your `values.yaml` file and point it to the secret you just created:

```yaml
supervisorConfig:
  license:
    secret: orca-license
```

Re-deploy the Helm release and the secret containing the license should be mounted into the pod and used by Orca.

Alternatively, you could add a `--set "supervisorConfig.license.secret=orca-license"` argument directly to your `helm install` command.

## Linux

If you installed Orca on a Linux server using the DEB or RPM packages, you can edit the configuration file manually with the editor of your choice.

Add the following section to `/etc/varnish-supervisor/default.yaml`:

```yaml
license:
  file: /etc/varnish-supervisor/license.lic
```

Make sure `/etc/varnish-supervisor/license.lic` exists and contains the license, and restart the `varnish-supervisor` process with the following command:

```sh
sudo systemctl restart varnish-supervisor
```

## Example config file with the license included

Here's an example of an Orca configuration file that has the license stored in `/etc/varnish-supervisor/license.lic`:

```yaml
varnish:
  http:
  - port: 80
license:
  file: /etc/varnish-supervisor/license.lic
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
  - name: go
    remotes:
    - url: https://proxy.golang.org
  - name: github
    remotes:
    - url: https://github.com
  - name: gitlab
    remotes:
    - url: https://gitlab.com
```

## How do I know if my license was loaded by Orca?

Orca uses *Varnish Supervisor* under the hood to manage the service. Varnish Supervisor logs to *STDOUT*.

Your *STDOUT* may contain the following log lines:

```
time=2025-11-03T10:00:36.058+01:00 level=INFO msg="License: Private registry cache enabled"
time=2025-11-03T10:00:36.058+01:00 level=INFO msg="License: Persistent cache enabled"
time=2025-11-03T10:00:36.058+01:00 level=INFO msg="License: OpenTelemetry tracing enabled"
time=2025-11-03T10:00:36.058+01:00 level=INFO msg="License: Custom registry VCL enabled"
time=2025-11-03T10:00:36.058+01:00 level=INFO msg="License: Git Mirror enabled"
time=2025-11-03T10:00:36.058+01:00 level=INFO msg="License: Expires 2026-10-09"
```

These logs lines mention the extra capabilities that are enabled, along with the expiration date of the license.

Extracting this information from Orca depends on the deployment platform that was used:

* In a Docker container you can run `docker logs orca` to display the license information
* In a `docker compose` setup you can run `docker compose logs orca` to display the license information
* In a Kubernetes setup you can run `kubectl logs <pod>` where `<pod>` refers to the name of the pod
* On a standard Linux server you can run `journalctl -u varnish-supervisor` to display the license information