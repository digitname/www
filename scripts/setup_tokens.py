#!/usr/bin/env python3
"""
Token Setup Assistant for DigitName

This script helps you generate and configure API tokens for various services
and updates your .env file automatically.
"""

import os
import webbrowser
import json
from pathlib import Path
from typing import Dict, List, Optional

# ANSI color codes for terminal output
COLORS = {
    'HEADER': '\033[95m',
    'BLUE': '\033[94m',
    'CYAN': '\033[96m',
    'GREEN': '\033[92m',
    'WARNING': '\033[93m',
    'FAIL': '\033[91m',
    'ENDC': '\033[0m',
    'BOLD': '\033[1m',
    'UNDERLINE': '\033[4m',
}

# Service configurations
SERVICES = {
    'github': {
        'name': 'GitHub',
        'token_url': 'https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=DigitName+Access',
        'scopes': ['repo', 'read:user', 'user:email'],
        'env_vars': ['GITHUB_USERNAME', 'GITHUB_TOKEN', 'GITHUB_EMAIL'],
        'instructions': [
            '1. Log in to your GitHub account if you\'re not already logged in',
            '2. Enter a descriptive name for the token (e.g., "DigitName Access")',
            '3. Select the following scopes:',
            '   - repo (full control of private repositories)',
            '   - read:user (read user profile data)',
            '   - user:email (read user email addresses)',
            '4. Click "Generate token" at the bottom of the page',
            '5. Copy the generated token (you won\'t be able to see it again!)',
        ]
    },
    'npm': {
        'name': 'NPM',
        'token_url': None,  # Will be set dynamically after getting username
        'env_vars': ['NPM_USERNAME', 'NPM_EMAIL', 'NPM_TOKEN'],
        'instructions': [
            '1. Log in to your NPM account',
            '2. Click on your profile picture and select "Access Tokens"',
            '3. Click "Generate New Token"',
            '4. Select "Automation" token type',
            '5. Give it a descriptive name (e.g., "DigitName")',
            '6. Click "Generate Token"',
            '7. Copy the generated token (you won\'t be able to see it again!)',
        ],
        'get_token_url': lambda: f"https://www.npmjs.com/settings/{input('Enter your NPM username: ').strip()}/tokens/new"
    },
    'pypi': {
        'name': 'PyPI',
        'token_url': 'https://pypi.org/manage/account/token/',
        'env_vars': ['PYPI_USERNAME', 'PYPI_TOKEN', 'PYPI_EMAIL'],
        'instructions': [
            '1. Log in to your PyPI account',
            '2. Go to Account Settings > API tokens',
            '3. Click "Add API token"',
            '4. Enter a name (e.g., "DigitName")',
            '5. For scope, select "Entire account (all projects)" or limit to specific projects',
            '6. Click "Add token"',
            '7. Copy the generated token (you won\'t be able to see it again!)',
            '   Note: Use this token as your password when uploading packages',
            '   Example: `python -m twine upload -u __token__ -p pypi-XXXXXXXXXXXXXXXX dist/*`',
        ]
    },
    'docker': {
        'name': 'Docker Hub',
        'token_url': 'https://hub.docker.com/settings/security',
        'env_vars': ['DOCKERHUB_USERNAME', 'DOCKERHUB_TOKEN'],
        'instructions': [
            '1. Log in to your Docker Hub account',
            '2. Go to Account Settings > Security',
            '3. Click "New Access Token"',
            '4. Enter a description (e.g., "DigitName Access")',
            '5. Set the permissions (read & write access is recommended)',
            '6. Click "Generate"',
            '7. Copy the generated token (you won\'t be able to see it again!)',
        ]
    },
    'gitlab': {
        'name': 'GitLab',
        'token_url': 'https://gitlab.com/-/profile/personal_access_tokens',
        'scopes': ['read_user', 'read_api', 'read_repository', 'write_repository'],
        'env_vars': ['GITLAB_USERNAME', 'GITLAB_TOKEN', 'GITLAB_EMAIL'],
        'instructions': [
            '1. Log in to your GitLab account',
            '2. Click on your profile picture and select "Preferences"',
            '3. Go to "Access Tokens" in the left sidebar',
            '4. Enter a name (e.g., "DigitName")',
            '5. Set an expiration date (optional but recommended)',
            '6. Select the following scopes:',
            '   - read_user',
            '   - read_api',
            '   - read_repository',
            '   - write_repository',
            '7. Click "Create personal access token"',
            '8. Copy the generated token (you won\'t be able to see it again!)',
        ]
    }
}

def print_header():
    """Print the script header."""
    print(f"{COLORS['HEADER']}{COLORS['BOLD']}")
    print("=" * 60)
    print("DigitName Token Setup Assistant".center(60))
    print("=" * 60)
    print(f"{COLORS['ENDC']}")
    print("This script will help you generate and configure API tokens for various services.")
    print("Follow the instructions in your web browser and return here to enter the tokens.\n")


def get_env_path() -> Path:
    """Get the path to the .env file."""
    env_path = Path(__file__).parent.parent / '.env'
    if not env_path.exists():
        # Try to create from .env.example if it exists
        example_path = Path(__file__).parent.parent / '.env.example'
        if example_path.exists():
            with open(example_path, 'r') as src, open(env_path, 'w') as dst:
                dst.write(src.read())
        else:
            # Create a basic .env file
            with open(env_path, 'w') as f:
                f.write("# DigitName Environment Variables\n\n")
    return env_path


def update_env_file(updates: Dict[str, str]):
    """Update the .env file with new values."""
    env_path = get_env_path()
    
    # Read existing content
    lines = []
    if env_path.exists():
        with open(env_path, 'r') as f:
            lines = f.readlines()
    
    # Update or add new values
    updated = set()
    for i, line in enumerate(lines):
        if '=' in line and not line.strip().startswith('#'):
            key = line.split('=')[0].strip()
            if key in updates:
                lines[i] = f"{key}={updates[key]}\n"
                updated.add(key)
    
    # Add any new variables that weren't in the file
    for key, value in updates.items():
        if key not in updated:
            lines.append(f"{key}={value}\n")
    
    # Write back to the file
    with open(env_path, 'w') as f:
        f.writelines(lines)
    
    print(f"{COLORS['GREEN']}✓ Updated .env file with new values{COLORS['ENDC']}")


def get_service_choice() -> str:
    """Let the user choose which service to configure."""
    print(f"{COLORS['BOLD']}Available services:{COLORS['ENDC']}")
    services = list(SERVICES.keys())
    for i, service_id in enumerate(services, 1):
        print(f"  {i}. {SERVICES[service_id]['name']}")
    print(f"  {len(services) + 1}. All services")
    print(f"  {len(services) + 2}. Exit")
    
    while True:
        try:
            choice = input("\nEnter your choice (number): ").strip()
            if not choice.isdigit():
                raise ValueError("Please enter a number")
            
            choice_num = int(choice)
            if 1 <= choice_num <= len(services):
                return services[choice_num - 1]
            elif choice_num == len(services) + 1:
                return 'all'
            elif choice_num == len(services) + 2:
                return 'exit'
            else:
                raise ValueError(f"Please enter a number between 1 and {len(services) + 2}")
        except ValueError as e:
            print(f"{COLORS['FAIL']}Error: {e}{COLORS['ENDC']}")


def configure_service(service_id: str):
    """Configure a single service."""
    service = SERVICES[service_id]
    print(f"\n{COLORS['BOLD']}Configuring {service['name']}{COLORS['ENDC']}")
    print("-" * 60)
    
    # Show instructions
    print("\n".join(service['instructions']))
    
    # Get token URL (dynamic for some services like NPM)
    token_url = service['token_url']
    if callable(token_url):
        token_url = service['get_token_url']()
    
    # Open the token generation page
    input(f"\nPress Enter to open {service['name']} in your browser...")
    webbrowser.open(token_url)
    
    # Get token and other required info
    updates = {}
    for var in service['env_vars']:
        if 'TOKEN' in var or 'PASSWORD' in var:
            value = input(f"\nPaste your {service['name']} {var}: ").strip()
        else:
            value = input(f"Enter your {service['name']} {var}: ").strip()
        updates[var] = value
    
    # Update .env file
    update_env_file(updates)
    print(f"{COLORS['GREEN']}✓ {service['name']} configuration complete!{COLORS['ENDC']}")


def main():
    """Main function to run the token setup assistant."""
    print_header()
    
    while True:
        service_id = get_service_choice()
        
        if service_id == 'exit':
            print("\nExiting. Your .env file has been updated with the provided information.")
            print(f"{COLORS['BOLD']}Don't forget to keep your tokens secure!{COLORS['ENDC']}")
            break
        elif service_id == 'all':
            for srv_id in SERVICES:
                configure_service(srv_id)
        else:
            configure_service(service_id)
        
        # Ask if user wants to configure another service
        if service_id != 'all':
            another = input("\nConfigure another service? (y/n): ").strip().lower()
            if another != 'y':
                print("\nExiting. Your .env file has been updated with the provided information.")
                print(f"{COLORS['BOLD']}Don't forget to keep your tokens secure!{COLORS['ENDC']}")
                break


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"{COLORS['FAIL']}An error occurred: {e}{COLORS['ENDC']}")
        print("Please report this issue if it persists.")
