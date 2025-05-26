#!/bin/bash
# Setup Tokens Script for DigitName
# This script helps you set up API tokens for various services

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR" || { echo "Error: Could not change to project directory"; exit 1; }

# Check if virtual environment exists, create if it doesn't
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing required packages..."
    pip install --upgrade pip
    pip install -e .
else
    source venv/bin/activate
fi

# Run the Python token setup script
python3 "$SCRIPT_DIR/setup_tokens.py"

echo -e "\n${GREEN}Token setup complete!${NC}"
echo "Your .env file has been updated with the provided information."
echo "Don't forget to keep your tokens secure and never commit them to version control!"
