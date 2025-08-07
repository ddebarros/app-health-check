#!/bin/bash

# DigitalOcean Container Registry deployment script
# Make sure you have doctl installed and authenticated

# Configuration
REGISTRY_NAME="ddebarros"  # Your DigitalOcean registry name
IMAGE_NAME="health-check-app"
TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🏗️  Building Docker image...${NC}"

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${YELLOW}🏷️  Tagging image for DigitalOcean Container Registry...${NC}"

# Tag the image for DigitalOcean Container Registry
docker tag $IMAGE_NAME:$TAG registry.digitalocean.com/$REGISTRY_NAME/$IMAGE_NAME:$TAG

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image tagged successfully${NC}"
else
    echo -e "${RED}❌ Image tagging failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Pushing image to DigitalOcean Container Registry...${NC}"

# Push the image to DigitalOcean Container Registry
docker push registry.digitalocean.com/$REGISTRY_NAME/$IMAGE_NAME:$TAG

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image pushed successfully to DigitalOcean Container Registry${NC}"
    echo -e "${GREEN}📋 Image URL: registry.digitalocean.com/$REGISTRY_NAME/$IMAGE_NAME:$TAG${NC}"
else
    echo -e "${RED}❌ Image push failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "   1. Create a DigitalOcean App Platform app"
echo -e "   2. Use the image: registry.digitalocean.com/$REGISTRY_NAME/$IMAGE_NAME:$TAG"
echo -e "   3. Set PORT environment variable to 8080" 