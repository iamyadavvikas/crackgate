terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # Separate state from prod — same bucket + lock table, different key.
  # Prod stays at prod/terraform.tfstate and is never touched by this module.
  backend "s3" {
    bucket         = "crackgate-tfstate"
    key            = "staging/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "crackgate-tflock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "crackgate"
      Env       = "staging"
      ManagedBy = "terraform"
      Owner     = "vikas"
    }
  }
}
