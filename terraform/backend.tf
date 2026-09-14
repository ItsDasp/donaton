# Terraform Backend Configuration
# 
# Using local state for simplicity with AWS Academy temporary credentials
# Local state is stored in .terraform/ directory (ignored by git)
# 
# To migrate to S3 backend in the future:
# 1. Create S3 bucket and DynamoDB table manually or via Terraform
# 2. Uncomment and configure the backend below
# 3. Run: terraform init -migrate-state

# terraform {
#   backend "s3" {
#     bucket         = "your-bucket-name"
#     key            = "donaton/dev/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "your-lock-table"
#   }
# }