"""
Command-line interface for DigitName.
"""

import os
import sys
import typer
from typing import Optional, List
from pathlib import Path
from dotenv import load_dotenv

from .accounts import AccountManager
from .portfolio import PortfolioGenerator

# Load environment variables from .env file
load_dotenv()

app = typer.Typer(help="DigitName - Manage your development accounts and generate portfolio.")

@app.command()
def init():
    """Display instructions for setting up environment variables."""
    env_example = """# Required Environment Variables

# GitHub Configuration
GITHUB_USERNAME=your_github_username
GITHUB_TOKEN=your_github_token  # Generate at: https://github.com/settings/tokens
GITHUB_EMAIL=your.email@example.com

# NPM Configuration
NPM_USERNAME=your_npm_username
NPM_EMAIL=your.email@example.com
NPM_TOKEN=your_npm_token  # Get from: https://www.npmjs.com/settings/~/tokens

# PyPI Configuration
PYPI_USERNAME=your_pypi_username
PYPI_TOKEN=your_pypi_token  # Get from: https://pypi.org/manage/account/token/
PYPI_EMAIL=your.email@example.com

# Docker Hub Configuration
DOCKERHUB_USERNAME=your_docker_username
DOCKERHUB_TOKEN=your_docker_token  # Get from: https://hub.docker.com/settings/security

# GitLab Configuration
GITLAB_USERNAME=your_gitlab_username
GITLAB_TOKEN=your_gitlab_token  # Create at: https://gitlab.com/-/profile/personal_access_tokens
GITLAB_EMAIL=your.email@example.com

# Portfolio Configuration
PORTFOLIO_OUTPUT_DIR=./portfolio
"""
    
    env_path = Path(".env")
    if env_path.exists():
        typer.echo("Found existing .env file. Here's an example configuration:")
    else:
        with open(env_path, 'w') as f:
            f.write(env_example)
        typer.echo(f"Created .env file at {env_path.absolute()}")
    
    typer.echo("\nPlease update the .env file with your account details and then run:")
    typer.echo("$ source .env  # Load the environment variables")
    typer.echo("$ digitname check  # Verify your configuration")


@app.command()
def check():
    """Verify the current configuration."""
    try:
        manager = AccountManager()
        config = manager.config
        
        if not config:
            typer.echo("No configuration found. Please run 'init' to set up your .env file.", err=True)
            raise typer.Exit(1)
        
        typer.echo("Current configuration:")
        for service, data in config.items():
            typer.echo(f"\n{service.upper()}:")
            for key, value in data.items():
                # Mask sensitive values
                if any(s in key.lower() for s in ['token', 'password', 'secret']):
                    value = "*" * 8 if value else "(not set)"
                typer.echo(f"  {key}: {value}")
        
        typer.echo("\nConfiguration looks good!")
        
    except Exception as e:
        typer.echo(f"Error: {str(e)}", err=True)
        raise typer.Exit(1)


@app.command()
def generate_portfolio(
    output_dir: str = typer.Option(
        os.getenv("PORTFOLIO_OUTPUT_DIR", "./portfolio"),
        "--output", "-o",
        help="Output directory for the generated portfolio"
    )
):
    """Generate the portfolio website."""
    try:
        # Create output directory if it doesn't exist
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize the generator with the output directory
        generator = PortfolioGenerator({
            'output_dir': str(output_path.absolute())
        })
        
        # Generate the portfolio
        result_path = generator.generate()
        typer.echo(f"Portfolio generated at: {result_path}")
        
    except Exception as e:
        typer.echo(f"Error generating portfolio: {str(e)}", err=True)
        raise typer.Exit(1)


def main():
    """Entry point for the CLI."""
    app()


if __name__ == "__main__":
    main()
