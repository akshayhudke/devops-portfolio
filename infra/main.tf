terraform {
  required_version = ">= 1.6.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = ">= 3.2.0"
    }
  }
}

locals {
  project_name = "devops-portfolio"
  purpose      = "Documentation-only infrastructure scaffold"
  backend_host = "render"
  frontend_host = "github pages"
}

output "architecture_notes" {
  value = {
    project  = local.project_name
    purpose  = local.purpose
    frontend = local.frontend_host
    backend  = local.backend_host
  }
}
