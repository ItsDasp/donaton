output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = length(aws_instance.donaton_server) > 0 ? aws_instance.donaton_server[0].public_ip : data.aws_instance.existing_server.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = length(aws_instance.donaton_server) > 0 ? aws_instance.donaton_server[0].id : data.aws_instance.existing_server.id
}

output "application_url" {
  description = "Complete URL to access the frontend application"
  value       = length(aws_instance.donaton_server) > 0 ? "http://${aws_instance.donaton_server[0].public_ip}:4173" : "http://${data.aws_instance.existing_server.public_ip}:4173"
}

output "gateway_url" {
  description = "URL to access the API Gateway"
  value       = length(aws_instance.donaton_server) > 0 ? "http://${aws_instance.donaton_server[0].public_ip}:8080" : "http://${data.aws_instance.existing_server.public_ip}:8080"
}

output "needs_service_url" {
  description = "URL to access the Needs service directly"
  value       = length(aws_instance.donaton_server) > 0 ? "http://${aws_instance.donaton_server[0].public_ip}:8084" : "http://${data.aws_instance.existing_server.public_ip}:8084"
}

output "terraform_state_bucket" {
  description = "S3 bucket name for Terraform state"
  value       = data.aws_s3_bucket.terraform_state.id
}

output "terraform_lock_table" {
  description = "DynamoDB table name for state locking"
  value       = data.aws_dynamodb_table.terraform_lock.name
}