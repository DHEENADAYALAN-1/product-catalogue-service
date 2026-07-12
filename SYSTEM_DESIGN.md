# System Design

## Overview
This microservice manages a product catalogue and is deployed across three versions
simultaneously to a Kubernetes cluster, each isolated in its own namespace, with
autoscaling, resource limits, and path-based routing through a single Ingress.

## Architecture Diagram (conceptual)

```
                        ┌─────────────────────┐
                        │   NGINX Ingress      │
                        │  (default namespace) │
                        └──────────┬───────────┘
              /v1              /v1.1              /v2
                │                  │                  │
        ┌───────▼──────┐  ┌────────▼───────┐  ┌───────▼──────┐
        │ ExternalName  │  │ ExternalName   │  │ ExternalName │
        │ v1-router     │  │ v1-1-router    │  │ v2-router    │
        └───────┬──────┘  └────────┬───────┘  └───────┬──────┘
                │                  │                  │
     ┌──────────▼─────────┐┌───────▼────────────┐┌────▼──────────────┐
     │ namespace: product- ││ namespace: product- ││ namespace: product-│
     │ v1                  ││ v1-1                ││ v2                 │
     │                     ││                     ││                    │
     │ Deployment (2 pods) ││ Deployment (2 pods) ││ Deployment (2 pods)│
     │ Service (ClusterIP) ││ Service (ClusterIP) ││ Service (ClusterIP)│
     │ HPA (2-5 replicas)  ││ HPA (2-5 replicas)  ││ HPA (2-5 replicas) │
     └─────────────────────┘└─────────────────────┘└────────────────────┘
```

## Key Decisions

### 1. Namespace isolation
Each version (`v1.0.0`, `v1.1.0`, `v2.0.0`) runs in its own Kubernetes namespace
(`product-v1`, `product-v1-1`, `product-v2`). This gives full isolation of resources,
scaling policies, and lifecycle per version - a new version can be deployed, tested, or
rolled back without touching the others.

### 2. Cross-namespace routing via ExternalName services
Kubernetes Ingress objects can only route to Services within their own namespace. Since
we need one Ingress routing to three different namespaces, small `ExternalName` "router"
services are created in the `default` namespace, each pointing at the real service's
internal DNS name (`<service>.<namespace>.svc.cluster.local`). The Ingress then routes
path-based traffic (`/v1`, `/v1.1`, `/v2`) to these router services.

### 3. Horizontal Pod Autoscaler (HPA)
Each version scales independently between 2 and 5 replicas based on CPU utilization
(target 70%), so a spike in traffic to one version doesn't affect the others' resource
allocation.

### 4. Resource requests/limits
Every pod requests 100m CPU / 64Mi memory and is capped at 250m CPU / 128Mi memory,
preventing any single version from starving the cluster of resources.

### 5. Health checks
- Docker `HEALTHCHECK` verifies the container itself is responsive.
- Kubernetes `livenessProbe` restarts a pod if it stops responding.
- Kubernetes `readinessProbe` ensures traffic is only sent to pods that are ready.

### 6. CI/CD flow
- Every push/PR to `main` runs a build + smoke test (build-and-test job).
- Pushing a version tag (e.g. `v2.0.0`) triggers building and pushing a tagged Docker
  image to Docker Hub, then applies the Kubernetes manifests and waits for rollout
  confirmation.

### 7. Multi-stage Docker build
The Dockerfile uses a `builder` stage to install dependencies and a slim `alpine`-based
`production` stage that only copies over what's needed to run - keeping the final image
small and reducing attack surface. The container also runs as a non-root user.
