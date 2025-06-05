"""
Account management module for DigitName.

Handles authentication and API interactions with various development platforms.
Uses environment variables for configuration.
"""

import os
from typing import Dict, Any, Optional


class AccountManager:
    """Manages development accounts and their configurations using environment variables."""

    def __init__(self):
        """Initialize the account manager with environment variables."""
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Dict[str, str]]:
        """Load the configuration from environment variables.
        
        Returns:
            Dict containing the configuration for each service.
        """
        config = {
            'github': {
                'username': os.getenv('GITHUB_USERNAME', ''),
                'token': os.getenv('GITHUB_TOKEN', ''),
                'email': os.getenv('GITHUB_EMAIL', '')
            },
            'npm': {
                'username': os.getenv('NPM_USERNAME', ''),
                'email': os.getenv('NPM_EMAIL', ''),
                'token': os.getenv('NPM_TOKEN', '')
            },
            'pypi': {
                'username': os.getenv('PYPI_USERNAME', ''),
                'password': os.getenv('PYPI_PASSWORD', ''),
                'token': os.getenv('PYPI_TOKEN', '')
            },
            'docker': {
                'username': os.getenv('DOCKERHUB_USERNAME', ''),
                'token': os.getenv('DOCKERHUB_TOKEN', '')
            },
            'gitlab': {
                'username': os.getenv('GITLAB_USERNAME', ''),
                'token': os.getenv('GITLAB_TOKEN', ''),
                'email': os.getenv('GITLAB_EMAIL', '')
            }
        }
        
        # Filter out empty values
        return {
            service: {k: v for k, v in data.items() if v}
            for service, data in config.items()
            if any(data.values())
        }

    def get_account(self, service: str) -> Dict[str, str]:
        """Get account information for a specific service.
        
        Args:
            service: The service name (e.g., 'github', 'npm').
            
        Returns:
            Dictionary containing the account information.
        """
        return self.config.get(service.lower(), {})

    def update_account(self, service: str, **kwargs) -> None:
        """Update account information for a specific service.
        
        Note: This method is a no-op when using environment variables.
        Update your .env file directly instead.
        
        Args:
            service: The service name (e.g., 'github', 'npm').
            **kwargs: Key-value pairs of account information to update.
        """
        raise NotImplementedError(
            "Direct updates are not supported when using environment variables. "
            "Please update your .env file directly."
        )
