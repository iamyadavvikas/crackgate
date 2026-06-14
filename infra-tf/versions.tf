terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state. Bootstrap the bucket + lock table manually ONCE:
  #   aws s3api create-bucket --bucket crackgate-tfstate --region ap-south-1 \
  #     --create-bucket-configuration LocationConstraint=ap-south-1
  #   aws s3api put-bucket-versioning --bucket crackgate-tfstate \
  #     --versioning-configuration Status=Enabled
  #   aws dynamodb create-table --table-name crackgate-tflock \
  #     --attribute-definitions AttributeName=LockID,AttributeType=S \
  #     --key-schema AttributeName=LockID,KeyType=HASH \
  #     --billing-mode PAY_PER_REQUEST --region ap-south-1
  backend "s3" {
    bucket         = "crackgate-tfstate"
    key            = "prod/terraform.tfstate"
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
      Env       = "prod"
      ManagedBy = "terraform"
      Owner     = "vikas"
    }
  }
}

# Route 53 health-check metrics (HealthCheckStatus) are ONLY published to
# CloudWatch in us-east-1, so the uptime alarm + its SNS topic must live there.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "crackgate"
      Env       = "prod"
      ManagedBy = "terraform"
      Owner     = "vikas"
    }
  }
}
