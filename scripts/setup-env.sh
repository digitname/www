#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up development environment...${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating .env file from .env.example${NC}"
    cp .env.example .env
else
    echo -e "${YELLOW}.env file already exists, skipping...${NC}"
fi

# Create config directories if they don't exist
CONFIG_DIRS=("config/github" "config/npm" "config/pypi" "config/docker" "config/gitlab")
for dir in "${CONFIG_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${GREEN}Creating $dir directory${NC}"
        mkdir -p "$dir"
    fi
    
    # Create .gitkeep if directory is empty
    if [ -z "$(ls -A $dir 2>/dev/null)" ]; then
        touch "$dir/.gitkeep"
    fi
done

# Set permissions for scripts
echo -e "${YELLOW}Setting up script permissions...${NC}"
chmod +x scripts/*.sh

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
make deps

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Please edit the .env file with your credentials and run 'make build' to build the project.${NC}"
