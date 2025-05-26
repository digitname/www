"""
Command-line interface for DigitName.
"""

import os
import sys
import typer
from pathlib import Path
from typing import Optional

from .accounts import AccountManager
from .portfolio import PortfolioGenerator

app = typer.Typer(help="DigitName - Manage your development accounts and generate portfolio.")

@app.command()
def init():
    """Initialize the configuration file with default values."""
    config_path = Path("config/accounts.toml")
    if config_path.exists():
        typer.echo("Configuration file already exists. Use 'update' command to modify it.")
        return
    
    # Create config directory if it doesn't exist
    config_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create default config
    default_config = """# Configuration for development accounts
[github]
username = "your_github_username"
token = "your_github_token"  # Generate at: https://github.com/settings/tokens

[npm]
username = "your_npm_username"
email = "your.email@example.com"
token = "your_npm_token"  # Get from: https://www.npmjs.com/settings/~/tokens

[pypi]
username = "your_pypi_username"
password = "your_pypi_password"

[docker]
username = "your_docker_username"
password = "your_docker_password"

[gitlab]
username = "your_gitlab_username"
token = "your_gitlab_token"  # Create at: https://gitlab.com/-/profile/personal_access_tokens

[portfolio]
output_dir = "./portfolio"
template = "default"  # Options: default, modern, minimal
include_private = false  # Whether to include private repositories

[theme]
primary_color = "#2563eb"
secondary_color = "#7c3aed"
background_color = "#ffffff"
text_color = "#1f2937"
font_family = "Inter, sans-serif"
"""
    
    with open(config_path, 'w') as f:
        f.write(default_config)
    
    typer.echo(f"Configuration file created at {config_path}")
    typer.echo("Please update it with your account information.")

@app.command()
def update_account(
    service: str = typer.Argument(..., help="Service name (github, npm, pypi, docker, gitlab)"),
    key: str = typer.Argument(..., help="Configuration key to update"),
    value: str = typer.Argument(..., help="New value for the configuration key"),
):
    """Update account configuration."""
    try:
        manager = AccountManager()
        manager.update_account(service, **{key: value})
        typer.echo(f"Updated {service}.{key}")
    except Exception as e:
        typer.echo(f"Error: {str(e)}", err=True)
        raise typer.Exit(1)

@app.command()
def generate_portfolio():
    """Generate the portfolio website based on the current configuration."""
    try:
        # Load configuration
        manager = AccountManager()
        config = manager.config
        
        # Initialize portfolio generator
        portfolio_config = config.get("portfolio", {})
        generator = PortfolioGenerator(portfolio_config)
        
        # Generate portfolio
        generator.generate(account_data=config)
        
        typer.echo(f"Portfolio generated at: {portfolio_config.get('output_dir', 'portfolio')}")
    except Exception as e:
        typer.echo(f"Error generating portfolio: {str(e)}", err=True)
        raise typer.Exit(1)

def main():
    """Entry point for the CLI."""
    app()

if __name__ == "__main__":
    main()
