# Installation

- [Docker](#docker)
	- [Step 1: Run the container](#step-1-run-the-container)
	- [Step 2: Customize configuration (Optional)](#step-2-customize-configuration-optional)
- [Docker Compose](#docker-compose)
	- [Step 1: Clone this git repository](#step-1-clone-this-git-repository)
	- [Step 2: Start the docker compose](#step-2-start-the-docker-compose)
- [Install on Debian/Ubuntu](#install-on-debianubuntu)
	- [Step 1: Configure the repository](#step-1-configure-the-repository)
	- [Step 2: Install the package](#step-2-install-the-package)
	- [Step 3: Customize configuration (Optional)](#step-3-customize-configuration-optional)
- [Install on RHEL/CentOS](#install-on-rhelcentos)
	- [Step 1: Configure the repository](#step-1-configure-the-repository-1)
	- [Step 2: Install the package](#step-2-install-the-package-1)
	- [Step 3: Start the service](#step-3-start-the-service)
	- [Step 4: Customize configuration (Optional)](#step-4-customize-configuration-optional)
- [Troubleshooting](#troubleshooting)
	- [Check that Varnish is accepting traffic](#check-that-varnish-is-accepting-traffic)

## Docker

### Step 1: Run the container

```sh
docker run -p 80:80 varnish/orca
```

Varnish should now be listening to port 80 with the [default configuration]().

### Step 2: Customize configuration (Optional)

Create `config.yaml` and mount it into the container at `/etc/varnish-supervisor/default.yaml`:

```sh
docker run -p 80:80 -v $(pwd)/config.yaml:/etc/varnish-supervisor/default.yaml varnish/orca
```

When using multiple configuration files, it is better to mount a directory into the container like so:

```sh
docker run -p 80:80 -v $(pwd):/cfg varnish/orca --config /cfg/config1.yaml:/cfg/config2.yaml
```

## Docker Compose

### Step 1: Clone this git repository

```sh
git clone https://github.com/varnish/orca.git && cd orca
```

### Step 2: Start the docker compose

```sh
docker compose up
```

## Install on Debian/Ubuntu

To install Varnish Orca on a Debian-based system, you can install the `varnish-supervisor` DEB package. This package is in fact installed in the `varnish/orca` Docker image, and the only difference is that `varnish/orca` comes with additional default configuration.

### Step 1: Configure the repository

```
curl -s https://packagecloud.io/install/repositories/varnishplus/60-enterprise/script.deb.sh | sudo bash
```

### Step 2: Install the package

```sh
sudo apt -y install varnish-supervisor
```

Verify successful installation:

```sh
varnish-supervisor --version
```

The `varnish-supervisor` service should start automatically:

```sh
systemctl status varnish-supervisor
```

### Step 3: Customize configuration (Optional)

The package installs a default configuration file in `/etc/varnish-supervisor/default.yaml`. You can either edit this file directly (it won't be replaced when upgrading the package), or change the ``--config` argument to a different path:

```sh
sudo systemctl edit --full varnish-supervisor
```

To have the changes take effect, restart the service:

```sh
sudo systemctl restart varnish-supervisor
```

## Install on RHEL/CentOS

To install Varnish Orca on a RHEL-based system, you can install the `varnish-supervisor` RPM package.

### Step 1: Configure the repository

```
curl -s https://packagecloud.io/install/repositories/varnishplus/60-enterprise/script.rpm.sh | sudo bash
```

### Step 2: Install the package

```sh
sudo yum -y install varnish-supervisor
```

To verify successful installation, run:

```sh
varnish-supervisor --version
```

### Step 3: Start the service

On RHEL-based systems, services should not be started automatically during installation, so you have to enable it explicitly:

```sh
sudo systemctl enable varnish-supervisor && sudo systemctl enable varnish-supervisor
```

Check that `systemd` service started successfully:

```sh
systemctl status varnish-supervisor
```

### Step 4: Customize configuration (Optional)

The package installs a default configuration file in `/etc/varnish-supervisor/default.yaml`. You can either edit this file directly (it won't be replaced when upgrading the package), or change the ``--config` argument to a different path:

```sh
sudo systemctl edit --full varnish-supervisor
```

To have the changes take effect, restart the service:

```sh
sudo systemctl restart varnish-supervisor
```

## Troubleshooting

### Check that Varnish is accepting traffic

Varnish has a health-check endpoint at `/healthz`, and will respond with a `200 OK` to all requests on that path regardless of `Host`.

```sh
curl http://localhost/healthz -I

HTTP/1.1 200 OK
Date: Wed, 29 Oct 2025 16:17:17 GMT
Content-Length: 0
Accept-Ranges: bytes
Connection: keep-alive
```

The default configuration has Varnish listening for HTTP traffic on port `80`. If you have changed this to a different port, make sure to curl the right port and protocol (use `https://` for HTTPS endpoints).

### Unsecure Registry
On Mac (and probably Windows), where docker is actually a linux-vm under the hood, you have to add `localhost` as a unsecure registry.

**On docker host**
`/etc/docker/daemon.json`
{
	"insecure-registries": ["localhost:80","docker.localhost:80"]
}

**Colima**
`.colima/default/colima.yaml`
```
docker:
  insecure-registries:
    - localhost:80
    - docker.localhost:80
```
