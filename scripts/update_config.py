#!/usr/bin/env python3
"""
Update the accounts.toml configuration with values from .env
"""
import os
import toml
from pathlib import Path

def load_env():
    """Load environment variables from .env file."""
    env_path = Path(__file__).parent.parent / '.env'
    if not env_path.exists():
        print("Error: .env file not found")
        return {}
    
    env_vars = {}
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip().strip('"\'')
    return env_vars

def update_config(env_vars):
    """Update the accounts.toml file with values from .env"""
    config_path = Path(__file__).parent.parent / 'config' / 'accounts.toml'
    if not config_path.exists():
        print(f"Error: {config_path} not found")
        return
    
    # Load existing config
    with open(config_path) as f:
        config = toml.load(f)
    
    # Update GitHub config
    if 'GITHUB_USERNAME' in env_vars:
        config['github']['username'] = env_vars['GITHUB_USERNAME']
    if 'GITHUB_TOKEN' in env_vars:
        config['github']['token'] = env_vars['GITHUB_TOKEN']
    if 'GITHUB_EMAIL' in env_vars:
        config['github']['email'] = env_vars['GITHUB_EMAIL']
    
    # Update NPM config
    if 'NPM_USERNAME' in env_vars:
        config['npm']['username'] = env_vars['NPM_USERNAME']
    if 'NPM_EMAIL' in env_vars:
        config['npm']['email'] = env_vars['NPM_EMAIL']
    if 'NPM_TOKEN' in env_vars and env_vars['NPM_TOKEN'] != 'your_npm_token':
        config['npm']['token'] = env_vars['NPM_TOKEN']
    
    # Update PyPI config
    if 'PYPI_USERNAME' in env_vars:
        config['pypi']['username'] = env_vars['PYPI_USERNAME']
    if 'PYPI_EMAIL' in env_vars:
        config['pypi']['email'] = env_vars.get('PYPI_EMAIL', '')
    if 'PYPI_TOKEN' in env_vars and env_vars['PYPI_TOKEN'] != 'your_pypi_token':
        config['pypi']['token'] = env_vars['PYPI_TOKEN']
    
    # Update Docker config
    if 'DOCKERHUB_USERNAME' in env_vars:
        config['docker']['username'] = env_vars['DOCKERHUB_USERNAME']
    if 'DOCKERHUB_TOKEN' in env_vars and env_vars['DOCKERHUB_TOKEN'] != 'your_dockerhub_token':
        config['docker']['password'] = env_vars['DOCKERHUB_TOKEN']
    
    # Update GitLab config
    if 'GITLAB_USERNAME' in env_vars:
        config['gitlab']['username'] = env_vars['GITLAB_USERNAME']
    if 'GITLAB_EMAIL' in env_vars:
        config['gitlab']['email'] = env_vars.get('GITLAB_EMAIL', '')
    if 'GITLAB_TOKEN' in env_vars and env_vars['GITLAB_TOKEN'] != 'your_gitlab_token':
        config['gitlab']['token'] = env_vars['GITLAB_TOKEN']
    
    # Save updated config
    with open(config_path, 'w') as f:
        toml.dump(config, f)
    
    print(f"Updated {config_path} with credentials from .env")
    return config

if __name__ == "__main__":
    env_vars = load_env()
    if env_vars:
        update_config(env_vars)
