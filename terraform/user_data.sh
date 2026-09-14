#!/bin/bash
set -x

echo "=== Starting Donaton Deployment ==="

# Detect the default user
DEFAULT_USER="ubuntu"
if id "ubuntu" &>/dev/null; then
    DEFAULT_USER="ubuntu"
elif id "ec2-user" &>/dev/null; then
    DEFAULT_USER="ec2-user"
elif id "admin" &>/dev/null; then
    DEFAULT_USER="admin"
else
    DEFAULT_USER="root"
fi

echo "Detected default user: $DEFAULT_USER"

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
    sudo usermod -aG docker $DEFAULT_USER
    sudo systemctl enable docker
    sudo systemctl start docker
else
    echo "Docker already installed"
    sudo systemctl enable docker
    sudo systemctl start docker
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

if [ "$DEFAULT_USER" != "root" ]; then
    HOME_DIR="/home/$DEFAULT_USER"
else
    HOME_DIR="/root"
fi

if [ -d "$HOME_DIR/donaton" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd $HOME_DIR/donaton
    sudo -u $DEFAULT_USER git fetch origin || true
    sudo -u $DEFAULT_USER git checkout $BRANCH_NAME || true
    sudo -u $DEFAULT_USER git pull origin $BRANCH_NAME || true
else
    echo "Cloning repository for the first time..."
    sudo -u $DEFAULT_USER git clone -b $BRANCH_NAME $REPO_URL $HOME_DIR/donaton || {
        echo "Failed to clone with specific branch, trying default branch..."
        sudo -u $DEFAULT_USER git clone $REPO_URL $HOME_DIR/donaton
        cd $HOME_DIR/donaton
        sudo -u $DEFAULT_USER git checkout $BRANCH_NAME || true
    }
fi

# Navigate to project directory
cd $HOME_DIR/donaton

# Create .env file if it doesn't exist
echo "Creating .env file..."
if [ ! -f ".env" ]; then
    if [ "$DEFAULT_USER" != "root" ]; then
        sudo -u $DEFAULT_USER bash -c 'cat > .env << EOF
AZURE_TENANT_ID=common
AZURE_CLIENT_ID=dummy-client-id
EOF'
    else
        bash -c 'cat > .env << EOF
AZURE_TENANT_ID=common
AZURE_CLIENT_ID=dummy-client-id
EOF'
    fi
    echo ".env file created"
else
    echo ".env file already exists"
fi

# Build and start Docker containers
echo "Building and starting Docker containers..."
if [ "$DEFAULT_USER" != "root" ]; then
    sudo -u $DEFAULT_USER docker compose down 2>/dev/null || true
    sudo -u $DEFAULT_USER docker compose up -d --build
else
    docker compose down 2>/dev/null || true
    docker compose up -d --build
fi

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
for i in {1..12}; do
    echo "Wait cycle $i/12..."
    sleep 30
    if [ "$DEFAULT_USER" != "root" ]; then
        sudo -u $DEFAULT_USER docker compose ps
    else
        docker compose ps
    fi
done

# Check container status
echo "Final container status:"
if [ "$DEFAULT_USER" != "root" ]; then
    sudo -u $DEFAULT_USER docker compose ps
else
    docker compose ps
fi

# Check if frontend container is running
echo "Checking frontend container..."
if [ "$DEFAULT_USER" != "root" ]; then
    sudo -u $DEFAULT_USER docker compose ps frontend-app
else
    docker compose ps frontend-app
fi

echo "=== Deployment Complete ==="
echo "Application should be accessible at:"
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Frontend: http://$PUBLIC_IP:4173"
echo "Gateway: http://$PUBLIC_IP:8080"
echo "User: $DEFAULT_USER"
echo "Home directory: $HOME_DIR"