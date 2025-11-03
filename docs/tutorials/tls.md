# Enabling TLS
The main Varnish Orca examples use plain HTTP. In production or in certain test setups, you'll need an encrypted connection. This tutorial explains how to enable TLS for Varnish Orca on the supported platforms.

## Orca configuration for HTTPS and TLS certificates

Enabling TLS requires defining an `https` port in the `varnish` section of your Orca configuration and defining one or more TLS certificates.

There are different ways to register TLS certificates:

* Load a combined PEM file that contains the certificate and the private key.
* Load the certificate file and the private key separately.
* Automatically generate self-signed certificates based on a domain name.
* Automatically generate ACME certificates through LetsEncrypt.

### Custom certificates

Here's an example that combines the first 3 options:

```yaml
varnish:
  http:
  - port: 80
  https:
  - port: 443
    certificates:
    - combined: /certs/combined.pem  # Use this if your certificate & private key are combined in one file
    - cert: /certs/tls.crt # Use this if your certificate is stored separately
      private_key: /certs/tls.key # Use this if your private key is stored separately
    - self_signed: docker.localhost # Use this to generate self-signed certificates
```

* This example will load a combined PEM file that is stored in `/certs/combined.pem`.
* It will load another certificate from `/certs/tls.crt` for which the private key is stored in `/certs.tls.key`.
* A third certificate will be generated and self-signed for the `docker.localhost` domain.

Orca's SNI feature will ensure the right certificate is matched for the requested hostname.

*Don't forget to add a `virtual_registry` section to your Orca config to tell Orca which registries to proxy the requests to.*
### LetsEncrypt certificates

Orca also supports [LetsEncrypt](https://letsencrypt.org/) certificates. These are mutually exclusive with the regular certificate configuration. Using LetsEncrypt in Orca requires an `acme` configuration definition and an adjustment to the listening ports.

Here's an example configuration that uses LetsEncrypt:

```yaml
varnish:
  https:
  - port: 443
acme:
  email: user@domain.com
  domains:
    - your-domain.com
    - www.your-domain.com
    - sub.your-domain.com
  ca_server: production
```

* Make sure that all domains in the `domains` configuration property resolve to the IP address of your Orca server.
* The `http` port of the `varnish` section needs to be removed, because the AMCE implementation needs it for HTTP validation and HTTPS redirection.
* The `email` property should contain a valid e-mail address.
* The `domains` property contains a list of domains for which a TLS certificate needs to be generated.
* The `ca_server` property should either be `production` or `staging`.

When you start Orca with these settings, the TLS certificates are automatically generated and made available on port `443` for HTTPS access. Although not explicitly defined, port `80` is managed by the ACME service and will redirect all plain HTTP requests to their HTTPS equivalent.

## Docker

If you're running Orca inside a Docker container, you have to add the `-p 443:443` parameter to ensure your container actually forwards port `443` from your host system to the container.

This is what your `docker run` command would look like, assuming your Orca config file is stored as `example-config.yaml`:

```sh
docker run --rm -p 80:80 -p 443:443 \
  --name orca --platform linux/amd64 \
  -v $(pwd)/example-config.yaml:/app/config.yaml:ro \
  varnish/orca --config /app/config.yaml
```

To load custom certificates, you need to mount them using the `-v` option in `docker run`. Here's an example of a `combined.pem` file being loaded:

```sh
docker run --rm -p 80:80 -p 443:443 \
  --name orca --platform linux/amd64 \
  -v $(pwd)/example-config.yaml:/app/config.yaml:ro \
  -v $(pwd)/combined.pem:/app/combined.pem:ro \
  varnish/orca --config /app/config.yaml
```

This command will load `combined.pem` in your current directory to `/app/combined.pem` in the Docker container. Make sure your Orca config loads `/app/combined.pem` by adding a `combined` property to your `certificates` entry.

If the certificate and private key are stored in separate files, your `docker run` command looks like this:

```sh
docker run --rm -p 80:80 -p 443:443 \
  --name orca --platform linux/amd64 \
  -v $(pwd)/example-config.yaml:/app/config.yaml:ro \
  -v $(pwd)/tls.crt:/app/tls.crt:ro \
  -v $(pwd)/tls.key:/app/tls.key:ro \
  varnish/orca --config /app/config.yaml
```

This command will load `tls.crt` and `tls.key` in your current directory to `/app/tls.crt` and `/app/tls.key` in the Docker container. Make sure your Orca config loads these files by adding a `certificates` entry with the `cert` and `private_key` properties.

## Docker Compose

If you're running Orca with `docker compose`, make sure your `docker-compose.yaml` file has a `volumes` section that mounts the custom configuration file and the certificate files:

```yaml
services:
  orca:
    image: varnish/orca
    ports:
      - "80:80"
      - "443:443"
    volumes:
        - ./config.yaml:/app/config.yaml:ro
        - ./combined.pem:/app/combined.pem:ro # Use this if your certificate & private key are combined in one file
        - ./tls.crt:/app/tls.crt:ro # Use this if your certificate is stored separately
        - ./tls.key:/app/tls.key:ro # Use this if your private key is stored separately
```

Make sure you load these certificate files in your Orca config by adding either a `combined` property to your `certificates` entry, or `cert` and `private_key` properties.

## Kubernetes (using the Helm Chart)

If you're deploying Orca to a Kubernetes cluster, there are various ways to handle TLS:

 - Use [Ingress TLS](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls)
 - Generate self-signed certificates inside the Orca pod
 - Load custom certificates inside the Orca pod with [TLS secrets](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_secret_tls/)
 - Use LetsEncrypt certificates inside the Orca pod

### Ingress TLS
If you expose Orca to the outside world through Ingress, you can specify a TLS secret in the Orca Ingress definition and either load a custom certificate, or use [cert-manager](https://cert-manager.io/) to generate LetsEncrypt certificates.

Here's a scenario where a custom certificate is uploaded to your Kubernetes cluster as a TLS secret:

```sh
kubectl create secret tls tls-secret --cert=cert.crt --key=private.key
```

The secret name `tls-secret` can be referenced in the Ingress definition. You can add the following configuration to your `values.yaml` file to support Ingress with TLS:

```yaml
ingress:
  enabled: true
  className: nginx
  tls:
  - hosts:
      - docker.localhost
      - npmjs.localhost
    secretName: tls-secret
  hosts:
    - host: docker.localhost
      paths:
        - path: /
          pathType: Prefix
    - host: npmjs.localhost
      paths:
        - path: /
          pathType: Prefix
```

This Ingress configuration will make `docker.localhost` and `npmjs.localhost` available to the outside world on ports `80` and `443`. The certificate is loaded from the `tls-secret` Kubernetes secret. Requests to the Ingress will be proxied to the Orca service on port `80`.

Run the appropriate `helm install` or `helm upgrade` command to activate Ingress.

### Self-signed certificates

Configuring self-signed certificates in Orca requires the following `varnish` config in your `values.yaml` file:

```yaml
service:
  https:
    enabled: true
orca:
  varnish:
    http:
    - port: 80
    https:
    - port: 443
      certificates:
      - self_signed: docker.localhost
      - self_signed: npmjs.localhost
```

This config will make the Kubernetes service listen on port `443`, while also enabling traffic on port `443` within the Orca pod. Self-signed certificates will be generated for `docker.localhost` and `npmjs.localhost`.

Access to Orca happens using the Kubernetes service. By default the service is of the type `ClusterIP`, but you can also use the `NodePort`, `LoadBalancer` or `ExternalName` service type.

Run the appropriate `helm install` or `helm upgrade` command to activate self-signed certificates.

### Custom certificates

The Orca Helm Chart also supports custom certificates. The implementation leverages [TLS secrets](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_secret_tls/) in Kubernetes.

This means you can run the following command to upload your custom certificate to the Kubernetes cluster:

```sh
kubectl create secret tls tls-secret --cert=cert.crt --key=private.key
```

Use the following config in your `values.yaml` file to load the certificate from the `tls-secret` Kubernetes secret:

```yaml
service:
  https:
    enabled: true
orca:
  varnish:
    http:
    - port: 80
    https:
    - port: 443
      certificates:
      - secret: tls-secret
```

This config will make the Kubernetes service listen on port `443`, while also enabling traffic on port `443` within the Orca pod. The custom certificate will be loaded from the `tls-secret`.

Run the appropriate `helm install` or `helm upgrade` command to activate custom certificates.

### LetsEncrypt

The Orca Helm Chart supports LetsEncrypt certificate generation inside the pod. The following `values.yaml` configuration is required to enable LetsEncrypt support:

```yaml
service:
  https:
    enabled: true
orca:
  varnish:
    https:
    - port: 443
  acme:
    email: user@domain.com
    domains:
      - your-domain.com
      - www.your-domain.com
      - sub.your-domain.com
    ca_server: production
```

Run the appropriate `helm install` or `helm upgrade` command to activate LetsEncrypt certificates. Make sure the DNS records for the domains point to the Orca service, and that the service is accessible over HTTP from the outside world.

## Linux

If you're running Orca on a standard Linux server and you used our `DEB` or `RPM` packages to install it, configuring TLS is just a matter of changing your Supervisor config file.

Edit the `/etc/varnish-supervisor/default.yaml` config file, add the `certificates` config or use `acme`, and restart the Supervisor service using the following command:

```sh
sudo systemctl restart varnish-supervisor
```