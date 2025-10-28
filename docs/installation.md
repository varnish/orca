# Installation

## Docker

**Step 1:** Run the container:

```sh
docker run -it --rm --name orca -p 80:80 -p 443:443 varnish/orca:latest
```

**Step 2:** Check that Varnish is ready and accepting traffic:

```sh
curl localhost/healthz
```

**Step 3:**

### Custom Config

Create `config.yaml` and mount it into the container at `/etc/varnish-supervisor/default.yaml`:

```sh
docker run -it --rm --name orca -p 80:80 -v config.yaml:/etc/varnish-supervisor/default.yaml varnish/orca:latest
```

## Docker Compose

TODO

## Kubernetes

TODO

## Install on Debian/Ubuntu

Configure the repository:

```
curl -s https://packagecloud.io/install/repositories/varnishplus/60-enterprise/script.deb.sh | sudo bash
```

Install:

```sh
sudo apt -y install varnish-supervisor
```

Verify successful installation:

```sh
varnish-supervisor --version
```

Check that `systemd` service started successfully:

```sh
systemctl status varnish-supervisor
```

## Install on RHEL/CentOS

Configure the repository:

```
curl -s https://packagecloud.io/install/repositories/varnishplus/60-enterprise/script.rpm.sh | sudo bash
```

Install:

```sh
sudo yum -y install varnish-orca
```

Enable and start `systemd` service:

```sh
sudo systemctl enable varnish-supervisor && sudo systemctl enable varnish-supervisor
```

Check that `systemd` service started successfully:

```sh
systemctl status varnish-supervisor
```
