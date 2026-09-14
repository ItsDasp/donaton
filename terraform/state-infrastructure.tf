# State Infrastructure - S3 Bucket and DynamoDB Table
# These resources are assumed to already exist for AWS Academy
# Terraform will use existing resources instead of creating new ones

# Reference existing S3 bucket for Terraform state
data "aws_s3_bucket" "terraform_state" {
  bucket = var.terraform_state_bucket
}

# Reference existing DynamoDB table for state locking
data "aws_dynamodb_table" "terraform_lock" {
  name = var.terraform_lock_table
}