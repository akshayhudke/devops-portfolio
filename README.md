# DevOps Portfolio

[![CI](https://github.com/akshayhudke/devops-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/akshayhudke/devops-portfolio/actions/workflows/ci.yml)
[![Deploy Frontend](https://github.com/akshayhudke/devops-portfolio/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/akshayhudke/devops-portfolio/actions/workflows/deploy-frontend.yml)
[![Deploy Backend](https://github.com/akshayhudke/devops-portfolio/actions/workflows/deploy-backend-render.yml/badge.svg)](https://github.com/akshayhudke/devops-portfolio/actions/workflows/deploy-backend-render.yml)

A production-grade, data-driven portfolio that uses the same stack it
advertises: React + Tailwind on the frontend, FastAPI on the backend, and
container-first delivery with GitHub Actions.

## Stack
- Frontend: React (Vite), Tailwind, dark mode
- Backend: FastAPI (async)
- Data: resume.yaml
- CI/CD: GitHub Actions
- Containers: Docker, docker-compose
- Hosting: GitHub Pages (frontend), Render (backend)
- IaC: Terraform/OpenTofu (structure + documentation)

## Architecture
- `frontend` is a static SPA built by Vite and served from GitHub Pages.
- `backend` is a FastAPI service that serves `GET /api/resume` and `GET /health`.
- `resume.yaml` is the single source of truth for the UI.
- Build metadata (`BUILD_TIME`, `GIT_COMMIT`) is injected via GitHub Actions.

## Repo Structure
```
.
├── backend
├── frontend
├── infra
├── .github/workflows
├── resume.yaml
├── docker-compose.yml
└── LICENSE
```

## Local Development
Backend:
- `cd backend`
- `python -m venv .venv && source .venv/bin/activate`
- `pip install -r requirements.txt`
- `uvicorn main:app --reload`

Frontend:
- `cd frontend`
- `npm install`
- `VITE_API_BASE=http://localhost:8000 npm run dev`

Or run both via Docker:
- `docker-compose up --build`
- Frontend: http://localhost:8080
- Backend: http://localhost:8000

## CI/CD
- `ci.yml` builds both frontend and backend on every push and PR.
- `deploy-frontend.yml` ships the static site to GitHub Pages.
- `deploy-backend-render.yml` triggers a Render deploy hook for the backend.

## Deploy Notes
GitHub Pages:
- Enable Pages for the repo.
- Set repository variable `API_BASE_URL` to your backend URL.

Render:
- Create a Render Web Service (Docker runtime) and connect this repo.
- Set Dockerfile path to `backend/Dockerfile` with repo root as the build context.
- Set environment variables `RESUME_PATH=/app/resume.yaml` and `CORS_ORIGINS=<your GitHub Pages URL>`.
- Add a deploy hook URL as the GitHub Actions secret `RENDER_DEPLOY_HOOK_URL`.
- Run the workflow `Deploy Backend (Render)` when you want a manual deploy trigger.

## Tradeoffs
- No database to keep the stack free and fast to deploy.
- Resume data is file-backed for simplicity and auditability.
- Separate frontend/backend hosting keeps GitHub Pages free and reliable, with Render handling the API.
- Render free services can spin down on inactivity, causing cold starts.

## Customize the Resume
Edit `resume.yaml`. The UI and API will update automatically once deployed.
