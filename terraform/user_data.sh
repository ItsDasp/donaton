#!/bin/bash
set -e

echo "=== Starting Donaton Deployment ==="

# Update system packages
echo "Updating system packages..."
sudo apt-get update -y

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker ubuntu
else
    echo "Docker already installed"
fi

# Install Git
echo "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
else
    echo "Git already installed"
fi

# Clone repository
echo "Cloning repository..."
REPO_URL="${repository_url}"
BRANCH_NAME="${branch_name}"

if [ -d "/home/ubuntu/donaton" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd /home/ubuntu/donaton
    sudo -u ubuntu git fetch origin
    sudo -u ubuntu git checkout $BRANCH_NAME
    sudo -u ubuntu git pull origin $BRANCH_NAME
else
    echo "Cloning repository for the first time..."
    sudo -u ubuntu git clone -b $BRANCH_NAME $REPO_URL /home/ubuntu/donaton
fi

# Navigate to project directory
cd /home/ubuntu/donaton

# Create .env file if it doesn't exist
echo "Creating .env file..."
if [ ! -f ".env" ]; then
    sudo -u ubuntu bash -c 'cat > .env << EOF
AZURE_TENANT_ID=common
AZURE_CLIENT_ID=dummy-client-id
EOF'
    echo ".env file created"
else
    echo ".env file already exists"
fi

# Build and start Docker containers
echo "Building and starting Docker containers..."
sudo -u ubuntu docker compose down 2>/dev/null || true
sudo -u ubuntu docker compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
sleep 60

# Check container status
echo "Container status:"
sudo -u ubuntu docker compose ps

echo "=== Deployment Complete ==="
echo "Application should be accessible at:"
echo "Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):4173"
echo "Gateway: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"