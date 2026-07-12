# Product Catalogue Microservice - DevOps Assignment

A REST API for managing a product catalogue, containerized with Docker and deployed in
**3 versions simultaneously** to Kubernetes, with namespace isolation, autoscaling, and
an automated CI/CD pipeline.

---

## Tech Stack
- Node.js + Express
- Docker (multi-stage build)
- Kubernetes (Minikube)
- GitHub Actions (CI/CD)

---

## API Versions

| Version | Endpoints |
|---------|-----------|
| v1.0.0  | `GET /health`, `GET /products` |
| v1.1.0  | + `GET /products/search?keyword=` |
| v2.0.0  | + `GET /products/search?category=&minPrice=&maxPrice=` with validation/error handling, `GET /products/:id` |

Full history in [`CHANGELOG.md`](./CHANGELOG.md).

---

## Part A: Run Locally (no Docker/K8s)

```bash
npm install
npm run dev
```
Server runs at `http://localhost:4000`. Test with:
```bash
node tests/test.js
```

---

## Part B: Run with Docker

```bash
docker build -t product-catalogue-service:v2.0.0 --build-arg APP_VERSION=2.0.0 .
docker run -p 4000:4000 product-catalogue-service:v2.0.0
```

---

## Part C: Deploy to Kubernetes (Minikube)

### 1. Start Minikube
```bash
minikube start
minikube addons enable ingress
```

### 2. Build the Docker image inside Minikube's environment
So Kubernetes can find the image without needing a registry:
```bash
minikube docker-env | Invoke-Expression      # PowerShell
# or: eval $(minikube docker-env)             # Mac/Linux

docker build -t product-catalogue-service:v1.0.0 --build-arg APP_VERSION=1.0.0 .
docker build -t product-catalogue-service:v1.1.0 --build-arg APP_VERSION=1.1.0 .
docker build -t product-catalogue-service:v2.0.0 --build-arg APP_VERSION=2.0.0 .
```

> Note: update the `image:` field in each `k8s/*.yaml` file to just
> `product-catalogue-service:v1.0.0` (etc.) instead of `DOCKERHUB_USERNAME/...` when
> testing locally with Minikube, since the image is now local, not on Docker Hub.
> Also add `imagePullPolicy: Never` under each container spec so Kubernetes doesn't try
> to pull from the internet.

### 3. Apply the manifests
```bash
kubectl apply -f k8s/00-namespaces.yaml
kubectl apply -f k8s/v1-deployment.yaml
kubectl apply -f k8s/v1.1-deployment.yaml
kubectl apply -f k8s/v2-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify everything is running
```bash
kubectl get pods -n product-v1
kubectl get pods -n product-v1-1
kubectl get pods -n product-v2
kubectl get ingress
```

### 5. Access the service
```bash
minikube tunnel
```
Then visit:
- `http://localhost/v1/products`
- `http://localhost/v1.1/products/search?keyword=mouse`
- `http://localhost/v2/products/search?category=Electronics&minPrice=500`

---

## CI/CD Pipeline

Defined in [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml):

1. **On every push/PR** - installs dependencies, checks syntax, builds the Docker image,
   runs it, and smoke-tests `/health`.
2. **On pushing a version tag** (e.g. `git tag v2.0.0 && git push --tags`) - builds and
   pushes the image to Docker Hub, then applies the Kubernetes manifests and confirms
   rollout.

### Required GitHub repo secrets (Settings → Secrets and variables → Actions):
- `DOCKERHUB_USERNAME` - your Docker Hub username
- `DOCKERHUB_TOKEN` - a Docker Hub access token
- `KUBE_CONFIG` - base64-encoded kubeconfig for your cluster (only needed if deploying
  to a real remote cluster; can be skipped if only demoing locally with Minikube)

---

## Project Structure

```
product-catalogue-service/
├── src/
│   ├── server.js
│   ├── routes/products.js
│   └── data/products.js
├── k8s/
│   ├── 00-namespaces.yaml
│   ├── v1-deployment.yaml
│   ├── v1.1-deployment.yaml
│   ├── v2-deployment.yaml
│   └── ingress.yaml
├── version_snapshots/          # reference copies of v1.0 and v1.1 route code
├── tests/test.js
├── .github/workflows/ci-cd.yml
├── Dockerfile
├── CHANGELOG.md
├── SYSTEM_DESIGN.md
└── README.md
```

---

## Versioning Workflow (Git)

```bash
# v1.0.0
git add . && git commit -m "v1.0: base version with health + products"
git tag v1.0.0

# v1.1.0 (after adding search endpoint)
git add . && git commit -m "v1.1: add products search by keyword"
git tag v1.1.0

# v2.0.0 (after enhancing search + error handling)
git add . && git commit -m "v2.0: enhanced search with filters and validation"
git tag v2.0.0

git push origin main --tags
```
