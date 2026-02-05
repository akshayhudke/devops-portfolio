# Deployment and Operations Guide

This document covers end-to-end operation for the portfolio: local Docker runs,
CI/CD flow, GitHub settings, and Render deployment.

## 1. Local Run With Docker (no compose)

### Backend image (FastAPI)
Build the backend image from the repo root so `resume.yaml` is included.

```
docker build -f backend/Dockerfile -t devops-portfolio-api .
```

Run the container and mount the resume file from the host:

```
docker run --rm -p 8000:8000 \
  -e RESUME_PATH=/app/resume.yaml \
  -e CORS_ORIGINS=http://localhost:8080 \
  -e BUILD_TIME=local \
  -e GIT_COMMIT=local \
  -v "$(pwd)/resume.yaml:/app/resume.yaml:ro" \
  devops-portfolio-api
```

Verify:
```
curl http://localhost:8000/health
curl http://localhost:8000/api/resume
```

### Frontend image (React + Vite)
Build the frontend image from the `frontend` directory with build args.

Mac/Windows:
```
docker build -f frontend/Dockerfile -t devops-portfolio-web frontend \
  --build-arg VITE_API_BASE=http://host.docker.internal:8000 \
  --build-arg VITE_GITHUB_REPO=your-handle/devops-portfolio \
  --build-arg VITE_GIT_COMMIT=local \
  --build-arg VITE_BUILD_TIME=local \
  --build-arg VITE_BASE_PATH=/
```

Linux (use host-gateway):
```
docker build -f frontend/Dockerfile -t devops-portfolio-web frontend \
  --build-arg VITE_API_BASE=http://host.docker.internal:8000 \
  --build-arg VITE_GITHUB_REPO=your-handle/devops-portfolio \
  --build-arg VITE_GIT_COMMIT=local \
  --build-arg VITE_BUILD_TIME=local \
  --build-arg VITE_BASE_PATH=/

docker run --rm -p 8080:80 --add-host=host.docker.internal:host-gateway devops-portfolio-web
```

Run (Mac/Windows):
```
docker run --rm -p 8080:80 devops-portfolio-web
```

Open:
```
http://localhost:8080
```

## 2. Environment Variables Reference

Backend runtime env:
- `RESUME_PATH`: Path inside the container to the YAML file. Default is repo root `resume.yaml`.
- `CORS_ORIGINS`: Comma-separated list of allowed origins (your Pages URL + local dev).
- `BUILD_TIME`: Build/deploy timestamp string (optional).
- `GIT_COMMIT`: Git commit SHA string (optional).

Frontend build args (Vite uses these at build time):
- `VITE_API_BASE`: Public backend URL.
- `VITE_GITHUB_REPO`: `owner/repo` for CI badge and metadata.
- `VITE_GIT_COMMIT`: Commit SHA used for UI footer.
- `VITE_BUILD_TIME`: Build timestamp string for UI footer.
- `VITE_BASE_PATH`: Base path for GitHub Pages (usually `/<repo-name>/`).

## 3. Local Run With Docker Compose (optional)
```
docker-compose up --build
```

Frontend:
```
http://localhost:8080
```

Backend:
```
http://localhost:8000
```

## 4. What Happens After You Push to GitHub

1. `ci.yml` runs on every push and pull request.
2. `deploy-frontend.yml` runs on pushes to `main` or `master` and publishes the frontend to GitHub Pages.
3. `deploy-backend-render.yml` is manual and triggers a Render deploy hook when you run it.

## 5. GitHub Settings You Must Configure

### GitHub Pages
In the repo settings, open Pages and set the publishing source to GitHub Actions so
`deploy-frontend.yml` can publish the site.

### Repository variable
Add the repository variable used by the frontend deployment:
- `API_BASE_URL`: The public Render URL for the FastAPI service.
Path: Settings -> Secrets and variables -> Actions -> Variables tab -> New repository variable.

### GitHub Actions secret
Add the deploy hook secret for Render:
- `RENDER_DEPLOY_HOOK_URL`: The full deploy hook URL from Render.
Path: Settings -> Secrets and variables -> Actions -> Secrets tab -> New repository secret.

## 6. Render Setup (Backend)

1. Create a new Render Web Service and connect this GitHub repository.
2. Choose the Docker runtime and select the branch you want to deploy from.
3. Set the Dockerfile path to `backend/Dockerfile`.
4. Keep the repo root as the build context so the Dockerfile can copy `resume.yaml` from the root.
5. Set environment variables in Render.
```
RESUME_PATH=/app/resume.yaml
CORS_ORIGINS=<your GitHub Pages URL>
BUILD_TIME=<optional>
GIT_COMMIT=<optional>
```
If BUILD_TIME or GIT_COMMIT are unset, `/health` will report `unknown` for those values.
6. Create a deploy hook and store it as `RENDER_DEPLOY_HOOK_URL` in GitHub Actions secrets.
7. Deploy using either Render auto-deploys on new commits or by running `Deploy Backend (Render)`.

## 7. Quick Troubleshooting

- CORS errors: ensure `CORS_ORIGINS` includes the exact GitHub Pages URL.
- Resume not loading: confirm `resume.yaml` is copied into the image and mounted locally.
- API shows `unknown` build info: set `BUILD_TIME` and `GIT_COMMIT` on the backend.
