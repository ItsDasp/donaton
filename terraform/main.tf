terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  # AWS Academy credentials may use session tokens
  # These will be configured via environment variables in GitHub Actions
}

# Data source to get latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Data source to get default VPC
data "aws_vpc" "default" {
  default = true
}

# Data source to get default subnet
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group for EC2 instance
resource "aws_security_group" "donaton_sg" {
  name        = "${var.project_name}-${var.environment}-sg"
  description = "Security group for Donaton application"
  vpc_id      = data.aws_vpc.default.id

  # Allow HTTP access for frontend (port 4173)
  ingress {
    from_port   = 4173
    to_port     = 4173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP access for API Gateway (port 8080)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTP access for Needs service (port 8084)
  ingress {
    from_port   = 8084
    to_port     = 8084
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# EC2 Instance
resource "aws_instance" "donaton_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = data.aws_subnets.default.ids[0]
  
  # Use the security group we created
  vpc_security_group_ids = [aws_security_group.donaton_sg.id]
  
  # User data script to install Docker and deploy the application
  user_data = templatefile("${path.module}/user_data.sh", {
    repository_url = var.repository_url
    branch_name    = var.branch_name
  })
  
  # Ensure instance has a public IP
  associate_public_ip_address = true
  
  tags = {
    Name        = "${var.project_name}-${var.environment}-server"
    Environment = var.environment
    Project     = var.project_name
  }
}