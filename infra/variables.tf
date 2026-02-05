variable "frontend_url" {
  type        = string
  description = "Public URL for the GitHub Pages frontend."
  default     = ""
}

variable "backend_url" {
  type        = string
  description = "Public URL for the Fly.io or Railway backend."
  default     = ""
}
