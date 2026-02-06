# Backend API Guide

This document explains how to test the backend API locally and on Render, plus
what responses to expect.

## Base URLs

Local (Docker or local uvicorn):
- `http://localhost:8000`

Render (production):
- `https://devops-portfolio-iagu.onrender.com`

## Endpoints

### 1) Health Check

**Route**
- `GET /health`

**Purpose**
- Confirms the service is running and shows build metadata.

**Expected status**
- `200 OK`

**Expected JSON**
```json
{
  "status": "ok",
  "service": "resume-api",
  "timestamp": "2026-02-05T14:09:08.304454+00:00",
  "build_time": "2026-02-05T13:56:45Z",
  "git_commit": "1a8c407"
}
```
Notes:
- `build_time` and `git_commit` may be `"unknown"` if not provided as env vars.

**Local test**
```bash
curl http://localhost:8000/health
```

**Render test**
```bash
curl https://devops-portfolio-iagu.onrender.com/health
```

---

### 2) Resume Data

**Route**
- `GET /api/resume`

**Purpose**
- Returns resume data loaded from `resume.yaml`.

**Expected status**
- `200 OK`

**Expected JSON (shape)**
```json
{
  "meta": {
    "updated": "2026-02-05",
    "build_badge_workflow": "ci.yml"
  },
  "basics": {
    "name": "Akshay Hudke",
    "role": "Platform / Site Reliability Engineer",
    "summary": "...",
    "email": "hudkeakshay@gmail.com",
    "phone": "+91-7769858656",
    "linkedin": "https://linkedin.com/in/akshayhudke",
    "location": {
      "city": "Pune",
      "region": "Maharashtra",
      "country": "India"
    }
  },
  "highlights": ["..."],
  "skills": [
    {
      "category": "Cloud",
      "items": ["AWS", "Azure", "EKS"]
    }
  ],
  "experience": [
    {
      "company": "Volkswagen Group Digital Solutions",
      "role": "DevOps Engineer",
      "start": "2023-10",
      "end": "Present",
      "bullets": ["..."]
    }
  ],
  "education": [
    {
      "institution": "Priyadarshini College of Engineering",
      "degree": "Bachelor of Engineering",
      "end": 2019,
      "location": "Nagpur, India"
    }
  ],
  "certifications": [
    {
      "name": "Microsoft Certified: Azure Fundamentals (AZ-900)",
      "issuer": "Microsoft",
      "year": 2023
    }
  ]
}
```

**Local test**
```bash
curl http://localhost:8000/api/resume
```

**Render test**
```bash
curl https://devops-portfolio-iagu.onrender.com/api/resume
```

---

## Error Cases

### Missing resume file
**Status**: `404`

Response:
```json
{
  "detail": "Missing resume file at /app/resume.yaml"
}
```

### Invalid resume YAML (not a map)
**Status**: `400`

Response:
```json
{
  "detail": "Resume YAML must be a mapping at the root level."
}
```

## Render Tips

- Render free services can cold-start after inactivity; first request may be slower.
- Ensure `RESUME_PATH=/app/resume.yaml` is set in Render.
- Ensure `CORS_ORIGINS=https://akshayhudke.github.io` for GitHub Pages.
