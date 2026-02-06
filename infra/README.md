# Infrastructure (OpenTofu/Terraform)

This folder is a documentation-first scaffold that mirrors production structure
without provisioning paid resources. It captures the intended topology and
configuration surfaces for the portfolio.

## Intended topology
- Frontend: GitHub Pages (static site)
- Backend: Render (Dockerized FastAPI)
- CI/CD: GitHub Actions

## Why no resources?
This repo stays 100% free and open-source. The OpenTofu/Terraform files are
meant to communicate structure and provide a starting point if you later decide
to wire real providers.

## Usage
```
cd infra
terraform init
terraform plan
```

Set `frontend_url` and `backend_url` to document where the services run.
